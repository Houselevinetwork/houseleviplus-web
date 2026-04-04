// api/src/modules/cloudflare/cloudflare-r2.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import { CloudflareException } from '../../common/exceptions/cloudflare.exception';

export type ContentTypeBucket =
  | 'minisode'
  | 'reelfilm'
  | 'stageplay'
  | 'tv_episode'
  | 'movie'
  | 'podcast'
  | 'music'
  | 'shop'
  | 'travel'
  | 'ltv'   // ← HL Mood TV videos
  | 'home'; // ← Home gallery photos

export type HostAssetFolder =
  | 'profile'
  | 'podcasts'
  | 'tv-shows'
  | 'movies'
  | 'documentaries'
  | 'stage-plays'
  | 'shorts'
  | 'shop';

interface R2Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  accountId: string;
  publicUrls: { [key in ContentTypeBucket]: string };
  buckets: { [key in ContentTypeBucket]: string };
  hostsBucket: string;
  hostsPublicUrl: string;
}

export interface HostUploadResult {
  url: string;
  key: string;
  bucket: string;
  folder: HostAssetFolder;
  hostSlug: string;
  fileName: string;
}

// Returned by streamObject — caller pipes body to the HTTP response
export interface R2StreamResult {
  body:          NodeJS.ReadableStream;
  contentType:   string;
  contentLength: number | undefined;
  contentRange:  string | undefined;
  statusCode:    200 | 206;
  etag:          string | undefined;
  acceptRanges:  string;
}

@Injectable()
export class CloudflareR2Service {
  private readonly logger = new Logger(CloudflareR2Service.name);
  private s3Client: S3Client;
  private config: R2Config;

  constructor(private configService: ConfigService) {
    this.initializeConfig();
    this.initializeS3Client();
  }

  private initializeConfig(): void {
    const accessKeyId      = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID')     ?? '';
    const secretAccessKey  = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ?? '';
    const defaultPublicUrl = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL')        ?? '';
    const accountId        = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID')           ?? '';

    if (!accessKeyId || !secretAccessKey || !defaultPublicUrl || !accountId) {
      throw new Error(
        'Missing required R2 configuration: CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_PUBLIC_URL, CLOUDFLARE_ACCOUNT_ID',
      );
    }

    const travelPublicUrl = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_TRAVEL') || defaultPublicUrl;
    const ltvPublicUrl    = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_LTV')    || defaultPublicUrl;
    const homePublicUrl   = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_HOME')   || defaultPublicUrl;
    const hostsBucket     = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_HOSTS', 'hosts');
    const hostsPublicUrl  = (this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_HOSTS') || '').replace(/\/$/, '');

    this.config = {
      accessKeyId,
      secretAccessKey,
      region: this.configService.get<string>('CLOUDFLARE_R2_REGION') ?? 'auto',
      accountId,
      publicUrls: {
        minisode:   this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_MINISODE')   || defaultPublicUrl,
        reelfilm:   this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_REELFILM')   || defaultPublicUrl,
        stageplay:  this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_STAGEPLAY')  || defaultPublicUrl,
        tv_episode: this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_TV_EPISODE') || defaultPublicUrl,
        movie:      this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_MOVIE')      || defaultPublicUrl,
        podcast:    this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_PODCAST')    || defaultPublicUrl,
        music:      this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL_MUSIC')      || defaultPublicUrl,
        shop:       defaultPublicUrl,
        travel:     travelPublicUrl,
        ltv:        ltvPublicUrl,
        home:       homePublicUrl,
      },
      buckets: {
        minisode:   this.configService.get<string>('CLOUDFLARE_R2_BUCKET_MINISODE')   ?? '',
        reelfilm:   this.configService.get<string>('CLOUDFLARE_R2_BUCKET_REELFILM')   ?? '',
        stageplay:  this.configService.get<string>('CLOUDFLARE_R2_BUCKET_STAGEPLAY')  ?? '',
        tv_episode: this.configService.get<string>('CLOUDFLARE_R2_BUCKET_TV_EPISODE') ?? '',
        movie:      this.configService.get<string>('CLOUDFLARE_R2_BUCKET_MOVIE')      ?? '',
        podcast:    this.configService.get<string>('CLOUDFLARE_R2_BUCKET_PODCAST')    ?? '',
        music:      this.configService.get<string>('CLOUDFLARE_R2_BUCKET_MUSIC')      ?? '',
        shop:       this.configService.get<string>('CLOUDFLARE_R2_BUCKET_SHOP')       ?? 'houselevi-shop',
        travel:     this.configService.get<string>('CLOUDFLARE_R2_BUCKET_TRAVEL')     ?? 'travel',
        ltv:        this.configService.get<string>('CLOUDFLARE_R2_BUCKET_LTV')        ?? 'ltv',
        home:       this.configService.get<string>('CLOUDFLARE_R2_BUCKET_HOME')       ?? 'home',
      },
      hostsBucket,
      hostsPublicUrl,
    };

    Object.entries(this.config.buckets).forEach(([type, bucket]) => {
      if (!bucket) {
        this.logger.warn(`⚠️  Missing R2 bucket config: CLOUDFLARE_R2_BUCKET_${type.toUpperCase()}`);
      }
    });
  }

  private initializeS3Client(): void {
    // NOTE: forcePathStyle intentionally omitted — it breaks PutObject
    // signature calculation against Cloudflare R2
    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId:     this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
    });
    this.logger.log(`✅ R2 Client initialized: ${this.config.accountId}.r2.cloudflarestorage.com`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT TYPE BUCKET OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  getBucketForContentType(contentType: ContentTypeBucket): string {
    const bucket = this.config.buckets[contentType];
    if (!bucket) {
      throw new CloudflareException(
        'INVALID_CONTENT_TYPE',
        400,
        `No R2 bucket configured for content type: ${contentType}`,
      );
    }
    return bucket;
  }

  async generatePresignedUploadUrl(
    contentType: ContentTypeBucket,
    fileName: string = 'upload',
    expiresIn: number = 86400,
  ): Promise<{
    uploadUrl: string;
    method: 'PUT';
    headers: Record<string, string>;
    expiresIn: number;
    cloudflareKey: string;
  }> {
    try {
      const bucket        = this.getBucketForContentType(contentType);
      const cloudflareKey = `${contentType}/${Date.now()}-${fileName}`;
      const putCommand    = new PutObjectCommand({ Bucket: bucket, Key: cloudflareKey });
      const uploadUrl     = await getSignedUrl(this.s3Client, putCommand, { expiresIn });
      this.logger.debug(`Generated presigned URL for ${contentType}: ${cloudflareKey}`);
      return {
        uploadUrl,
        method:  'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        expiresIn,
        cloudflareKey,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate presigned URL: ${msg}`);
      throw new CloudflareException(
        'PRESIGNED_URL_GENERATION_FAILED',
        500,
        'Failed to generate upload URL from Cloudflare R2',
        { originalError: msg },
      );
    }
  }

  async uploadObject(
    contentType: ContentTypeBucket,
    key:         string,
    buffer:      Buffer,
    mimeType:    string,
  ): Promise<void> {
    try {
      const bucket = this.getBucketForContentType(contentType);
      if (!Buffer.isBuffer(buffer)) throw new Error('Invalid buffer: expected Buffer instance');
      this.logger.debug(`Uploading to ${bucket}/${key} (${buffer.length} bytes, type: ${mimeType})`);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket:        bucket,
          Key:           key,
          Body:          buffer,
          ContentType:   mimeType,
          ContentLength: buffer.length,
        }),
      );
      this.logger.log(`✅ Object uploaded to R2: ${bucket}/${key} (${buffer.length} bytes)`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to upload object to R2: ${msg}`);
      throw new CloudflareException('UPLOAD_FAILED', 500, 'Failed to upload object to R2', {
        originalError: msg,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STREAM OBJECT
  // Pipes an R2 object directly to the caller. Supports Range requests.
  // Used by ContentPremiumController to proxy media to the browser,
  // bypassing CORS restrictions on pub-xxx.r2.dev entirely.
  // ─────────────────────────────────────────────────────────────────────────────
  async streamObject(
    contentType:  ContentTypeBucket,
    key:          string,
    mimeType:     string,
    rangeHeader?: string,
  ): Promise<R2StreamResult> {
    const bucket = this.getBucketForContentType(contentType);
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key:    key,
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new CloudflareException('STREAM_FAILED', 500, 'R2 returned empty body');
      }

      const statusCode: 200 | 206 = rangeHeader && response.ContentRange ? 206 : 200;

      return {
        body:          response.Body as NodeJS.ReadableStream,
        contentType:   mimeType || response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength,
        contentRange:  response.ContentRange,
        statusCode,
        etag:          response.ETag,
        acceptRanges:  response.AcceptRanges || 'bytes',
      };
    } catch (err: any) {
      this.logger.error(`Failed to stream object ${bucket}/${key}: ${err.message}`);
      throw new CloudflareException('STREAM_FAILED', 500, 'Failed to stream media from R2', {
        originalError: err.message,
      });
    }
  }

  getPublicUrl(contentType: ContentTypeBucket, cloudflareKey: string): string {
    const base = this.config.publicUrls[contentType] ?? this.config.publicUrls['shop'];
    return `${base}/${cloudflareKey}`;
  }

  async getObjectMetadata(contentType: ContentTypeBucket, cloudflareKey: string) {
    try {
      const bucket   = this.getBucketForContentType(contentType);
      const response = await this.s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: cloudflareKey }));
      return {
        size:         response.ContentLength ?? 0,
        lastModified: response.LastModified   ?? new Date(),
        eTag:         response.ETag           ?? '',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get object metadata: ${msg}`);
      throw new CloudflareException('METADATA_RETRIEVAL_FAILED', 500, 'Failed to retrieve file metadata from R2', {
        originalError: msg,
      });
    }
  }

  async deleteObject(contentType: ContentTypeBucket, cloudflareKey: string): Promise<void> {
    try {
      const bucket = this.getBucketForContentType(contentType);
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: cloudflareKey }));
      this.logger.debug(`Deleted object from R2: ${cloudflareKey}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete object: ${msg}`);
      throw new CloudflareException('DELETE_FAILED', 500, 'Failed to delete file from R2', {
        originalError: msg,
      });
    }
  }

  async objectExists(contentType: ContentTypeBucket, cloudflareKey: string): Promise<boolean> {
    try {
      const bucket = this.getBucketForContentType(contentType);
      await this.s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: cloudflareKey }));
      return true;
    } catch (error) {
      if ((error as any).name === 'NotFound') return false;
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error checking object existence: ${msg}`);
      throw new CloudflareException('EXISTENCE_CHECK_FAILED', 500, 'Failed to check if file exists in R2', {
        originalError: msg,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HOST BUCKET OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  async uploadHostImage(
    hostSlug: string,
    folder:   HostAssetFolder,
    buffer:   Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<HostUploadResult> {
    const safeSlug   = this.sanitizeSlug(hostSlug);
    const ext        = this.getExtension(fileName, mimeType);
    const uniqueName = `${folder}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    const key        = `${safeSlug}/${folder}/${uniqueName}`;

    this.logger.log(`Uploading host image → ${this.config.hostsBucket}/${key}`);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket:      this.config.hostsBucket,
          Key:         key,
          Body:        buffer,
          ContentType: mimeType,
          Metadata:    { hostSlug: safeSlug, folder, originalName: fileName },
        }),
      );

      const url = `${this.config.hostsPublicUrl}/${key}`;
      this.logger.log(`✅ Host image uploaded: ${url}`);
      return { url, key, bucket: this.config.hostsBucket, folder, hostSlug: safeSlug, fileName: uniqueName };
    } catch (err: any) {
      this.logger.error(`Failed to upload host image: ${err.message}`, err.stack);
      throw new CloudflareException('HOST_UPLOAD_FAILED', 500, `R2 upload failed: ${err.message}`);
    }
  }

  async deleteHostAsset(key: string): Promise<void> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.config.hostsBucket, Key: key }));
      this.logger.log(`🗑️  Deleted host asset: ${key}`);
    } catch (err: any) {
      if (err.Code !== 'NoSuchKey') {
        this.logger.warn(`Could not delete ${key}: ${err.message}`);
      }
    }
  }

  async listHostAssets(
    hostSlug: string,
    folder?:  HostAssetFolder,
  ): Promise<{ key: string; url: string; size: number; lastModified: Date }[]> {
    const safeSlug = this.sanitizeSlug(hostSlug);
    const prefix   = folder ? `${safeSlug}/${folder}/` : `${safeSlug}/`;

    const response = await this.s3Client.send(
      new ListObjectsV2Command({ Bucket: this.config.hostsBucket, Prefix: prefix }),
    );

    return (response.Contents ?? []).map(obj => ({
      key:          obj.Key!,
      url:          `${this.config.hostsPublicUrl}/${obj.Key}`,
      size:         obj.Size         ?? 0,
      lastModified: obj.LastModified ?? new Date(),
    }));
  }

  async renameHostFolder(oldSlug: string, newSlug: string): Promise<void> {
    const oldPrefix = this.sanitizeSlug(oldSlug) + '/';
    const newPrefix = this.sanitizeSlug(newSlug) + '/';

    const list = await this.s3Client.send(
      new ListObjectsV2Command({ Bucket: this.config.hostsBucket, Prefix: oldPrefix }),
    );

    if (!list.Contents?.length) return;

    this.logger.log(`Renaming host folder: ${oldPrefix} → ${newPrefix} (${list.Contents.length} objects)`);

    for (const obj of list.Contents) {
      const oldKey = obj.Key!;
      const newKey = newPrefix + oldKey.slice(oldPrefix.length);
      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket:     this.config.hostsBucket,
          CopySource: `${this.config.hostsBucket}/${oldKey}`,
          Key:        newKey,
        }),
      );
      await this.deleteHostAsset(oldKey);
    }

    this.logger.log(`✅ Host folder renamed: ${list.Contents.length} objects moved`);
  }

  getHostPublicUrl(key: string): string {
    return `${this.config.hostsPublicUrl}/${key}`;
  }

  async getPresignedHostUploadUrl(
    hostSlug: string,
    folder:   HostAssetFolder,
    fileName: string,
    mimeType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const safeSlug   = this.sanitizeSlug(hostSlug);
    const ext        = this.getExtension(fileName, mimeType);
    const uniqueName = `${folder}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    const key        = `${safeSlug}/${folder}/${uniqueName}`;

    const command = new PutObjectCommand({
      Bucket:      this.config.hostsBucket,
      Key:         key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 600 });
    const publicUrl = `${this.config.hostsPublicUrl}/${key}`;

    return { uploadUrl, publicUrl, key };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private sanitizeSlug(slug: string): string {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-|-$/g, '');
  }

  private getExtension(fileName: string, mimeType: string): string {
    const fromName = fileName.split('.').pop()?.toLowerCase();
    if (fromName && fromName.length <= 5) return fromName;
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png':  'png',
      'image/webp': 'webp',
      'image/gif':  'gif',
    };
    return mimeMap[mimeType] ?? 'jpg';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPART — Step 1: Initiate
  // ═══════════════════════════════════════════════════════════════════════════
  async createMultipartUpload(contentType: ContentTypeBucket, key: string, mimeType: string): Promise<string> {
    const bucket = this.getBucketForContentType(contentType);
    try {
      const res = await this.s3Client.send(
        new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: mimeType }),
      );
      if (!res.UploadId) throw new Error('R2 did not return an UploadId');
      this.logger.log(`✅ Multipart initiated: ${bucket}/${key} — UploadId: ${res.UploadId}`);
      return res.UploadId;
    } catch (err: any) {
      this.logger.error(`Failed to initiate multipart: ${err.message}`);
      throw new CloudflareException('MULTIPART_INIT_FAILED', 500, 'Failed to initiate multipart upload', { originalError: err.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPART — Step 2: Presigned URL for one part (2-hour TTL)
  // ═══════════════════════════════════════════════════════════════════════════
  async getPresignedPartUrl(contentType: ContentTypeBucket, key: string, r2UploadId: string, partNumber: number): Promise<string> {
    const bucket = this.getBucketForContentType(contentType);
    try {
      const cmd = new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: r2UploadId, PartNumber: partNumber });
      const url = await getSignedUrl(this.s3Client, cmd, { expiresIn: 7200 });
      this.logger.debug(`Presigned part URL — part ${partNumber} of ${bucket}/${key}`);
      return url;
    } catch (err: any) {
      this.logger.error(`Failed to generate part URL: ${err.message}`);
      throw new CloudflareException('PART_URL_FAILED', 500, 'Failed to generate part upload URL', { originalError: err.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPART — Step 3: Complete
  // ═══════════════════════════════════════════════════════════════════════════
  async completeMultipartUpload(
    contentType: ContentTypeBucket,
    key:         string,
    r2UploadId:  string,
    parts:       { partNumber: number; etag: string }[],
  ): Promise<void> {
    const bucket = this.getBucketForContentType(contentType);
    try {
      const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
      await this.s3Client.send(new CompleteMultipartUploadCommand({
        Bucket:          bucket,
        Key:             key,
        UploadId:        r2UploadId,
        MultipartUpload: { Parts: sorted.map(p => ({ PartNumber: p.partNumber, ETag: p.etag })) },
      }));
      this.logger.log(`✅ Multipart complete: ${bucket}/${key} (${parts.length} parts)`);
    } catch (err: any) {
      this.logger.error(`Failed to complete multipart: ${err.message}`);
      throw new CloudflareException('MULTIPART_COMPLETE_FAILED', 500, 'Failed to complete multipart upload', { originalError: err.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPART — Abort (best-effort, never throws)
  // ═══════════════════════════════════════════════════════════════════════════
  async abortMultipartUpload(contentType: ContentTypeBucket, key: string, r2UploadId: string): Promise<void> {
    const bucket = this.getBucketForContentType(contentType);
    try {
      await this.s3Client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: r2UploadId }));
      this.logger.log(`🗑️  Multipart aborted: ${bucket}/${key}`);
    } catch (err: any) {
      this.logger.warn(`Could not abort multipart ${r2UploadId}: ${err.message}`);
    }
  }
}