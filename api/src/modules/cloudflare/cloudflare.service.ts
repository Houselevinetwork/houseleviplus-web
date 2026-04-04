// api/src/modules/cloudflare/cloudflare.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudflareR2Service, ContentTypeBucket } from './cloudflare-r2.service';
import { CloudflareStreamService } from './cloudflare-stream.service';

export type StorageMethod = 'r2' | 'stream';

// Derived from file extension when mimeType is missing or generic
const EXT_MIME_MAP: Record<string, string> = {
  mp4:  'video/mp4',
  mov:  'video/quicktime',
  avi:  'video/x-msvideo',
  webm: 'video/webm',
  mkv:  'video/x-matroska',
  m4v:  'video/x-m4v',
  mp3:  'audio/mpeg',
  m4a:  'audio/mp4',
  wav:  'audio/wav',
  aac:  'audio/aac',
  ogg:  'audio/ogg',
  flac: 'audio/flac',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  webp: 'image/webp',
  gif:  'image/gif',
  avif: 'image/avif',
};

function safeMime(filename: string, declared: string): string {
  // If the declared type is valid and not generic, use it
  if (declared && declared !== 'application/octet-stream') return declared;
  // Fall back to extension-based detection
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MIME_MAP[ext] ?? 'application/octet-stream';
}

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);

  constructor(
    private r2Service: CloudflareR2Service,
    private streamService: CloudflareStreamService,
    private configService: ConfigService,
  ) {}

  async createUploadSession(
    contentType: ContentTypeBucket,
    storageMethod: StorageMethod = 'r2',
    fileName: string = 'upload',
  ): Promise<{
    uploadUrl: string;
    method: 'PUT' | 'POST';
    headers?: Record<string, string>;
    expiresIn: number;
    cloudflareKey?: string;
    uploadToken?: string;
  }> {
    this.logger.log(`Creating upload session: ${contentType} via ${storageMethod}`);

    if (storageMethod === 'r2') {
      return await this.r2Service.generatePresignedUploadUrl(contentType, fileName);
    } else if (storageMethod === 'stream') {
      const result = await this.streamService.createUploadToken({ name: fileName });
      return {
        uploadUrl:   result.uploadUrl,
        method:      'POST',
        expiresIn:   result.expiresIn,
        uploadToken: result.uploadToken,
      };
    }

    throw new Error(`Unknown storage method: ${storageMethod}`);
  }

  getR2PublicUrl(contentType: ContentTypeBucket, cloudflareKey: string): string {
    return this.r2Service.getPublicUrl(contentType, cloudflareKey);
  }

  async getR2Metadata(contentType: ContentTypeBucket, cloudflareKey: string) {
    return await this.r2Service.getObjectMetadata(contentType, cloudflareKey);
  }

  async deleteFromR2(contentType: ContentTypeBucket, cloudflareKey: string): Promise<void> {
    return await this.r2Service.deleteObject(contentType, cloudflareKey);
  }

  async r2ObjectExists(contentType: ContentTypeBucket, cloudflareKey: string): Promise<boolean> {
    return await this.r2Service.objectExists(contentType, cloudflareKey);
  }

  async getStreamVideoInfo(videoId: string) {
    return await this.streamService.getVideoInfo(videoId);
  }

  async deleteFromStream(videoId: string): Promise<void> {
    return await this.streamService.deleteVideo(videoId);
  }

  async getStreamVideoStatus(videoId: string) {
    return await this.streamService.getVideoStatus(videoId);
  }

  /**
   * Upload any file (image, video, audio) to R2.
   * FIX: mimeType is now derived from filename extension when the declared
   * type is empty or generic ('application/octet-stream'), so R2 stores the
   * correct Content-Type and browsers can play video/audio without sniffing.
   */
  async uploadImageToR2(
    contentType: ContentTypeBucket,
    filename: string,
    buffer: any,
    mimeType: string,
  ): Promise<string> {
    try {
      this.logger.log(`Uploading image to R2: ${filename}`);

      // Normalise buffer
      let bufferToUpload: Buffer;
      if (Buffer.isBuffer(buffer)) {
        bufferToUpload = buffer;
      } else if (typeof buffer === 'object' && buffer.data) {
        bufferToUpload = Buffer.from(buffer.data);
      } else if (typeof buffer === 'object') {
        bufferToUpload = Buffer.from(buffer);
      } else {
        throw new Error(`Invalid buffer type: ${typeof buffer}`);
      }

      this.logger.debug(`Buffer size: ${bufferToUpload.length} bytes`);

      if (bufferToUpload.length === 0) {
        throw new Error('Buffer is empty - no data to upload');
      }

      // ── KEY FIX ─────────────────────────────────────────────────────────────
      // Derive a safe Content-Type from the filename extension when the caller
      // provides an empty or generic mimeType.  Without this, R2 stores the
      // object as application/octet-stream and browsers refuse to play it.
      const resolvedMimeType = safeMime(filename, mimeType);
      if (resolvedMimeType !== mimeType) {
        this.logger.debug(
          `mimeType upgraded: "${mimeType}" → "${resolvedMimeType}" (from filename: ${filename})`,
        );
      }
      // ────────────────────────────────────────────────────────────────────────

      const key = `images/${filename}`;
      await this.r2Service.uploadObject(contentType, key, bufferToUpload, resolvedMimeType);

      const publicUrl = this.r2Service.getPublicUrl(contentType, key);
      this.logger.log(`✅ Image uploaded to R2: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      this.logger.error(`Failed to upload image to R2: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadTrailerToStream(file: any): Promise<{
    streamId: string;
    playbackUrl: string;
    duration?: number;
  }> {
    try {
      this.logger.log(`Uploading trailer to Stream: ${file.originalname}`);

      const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
      const apiToken  = this.configService.get<string>('CLOUDFLARE_STREAM_API_TOKEN');

      if (!accountId || !apiToken) {
        throw new Error('Cloudflare Stream credentials not configured');
      }

      const FormData = require('form-data');
      const formData = new FormData();

      formData.append('file', file.buffer, {
        filename:    file.originalname,
        contentType: file.mimetype,
      });
      formData.append('requireSignedURLs', 'false');

      const fetch = require('node-fetch');
      const response = await fetch.default(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
        {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${apiToken}`, ...formData.getHeaders() },
          body:    formData,
        },
      );

      const result = await response.json();

      if (!result.success || !result.result?.uid) {
        throw new Error(result.errors?.[0]?.message || 'Failed to upload trailer');
      }

      const streamId      = result.result.uid;
      const customerCode  = this.configService.get<string>('CLOUDFLARE_STREAM_CUSTOMER_CODE') || '7a488e9b77e6c8630472a07003c7d8e4';
      const playbackUrl   = `https://customer-${customerCode}.cloudflarestream.com/${streamId}/manifest/video.m3u8`;

      this.logger.log(`✅ Trailer uploaded to Stream: ${streamId}`);

      return { streamId, playbackUrl, duration: result.result.duration };
    } catch (error) {
      this.logger.error(`Failed to upload trailer to Stream: ${error.message}`, error.stack);
      throw error;
    }
  }
}