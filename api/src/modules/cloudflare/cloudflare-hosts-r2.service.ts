// api/src/modules/cloudflare/cloudflare-hosts-r2.service.ts
//
// Handles all R2 operations for the dedicated `hosts` bucket.
// Folder structure per host:
//
//   hosts/
//   └── {host-slug}/
//       ├── profile/          ← avatar / banner images
//       ├── podcasts/         ← podcast episode thumbnails
//       ├── tv-shows/         ← TV show thumbnails
//       ├── movies/           ← movie posters
//       ├── documentaries/    ← documentary posters
//       ├── stage-plays/      ← stage play posters
//       ├── shorts/           ← short video thumbnails
//       └── shop/             ← host merchandise images
//
// Public URL base: https://pub-1210c46fee0244f6aa58acd69a6962df.r2.dev

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

export type HostAssetFolder =
  | 'profile'
  | 'podcasts'
  | 'tv-shows'
  | 'movies'
  | 'documentaries'
  | 'stage-plays'
  | 'shorts'
  | 'shop';

export interface HostUploadResult {
  url: string; // public CDN URL
  key: string; // R2 object key  e.g. wakhata-levi/profile/avatar-1234.jpg
  bucket: string; // always 'hosts'
  folder: HostAssetFolder;
  hostSlug: string;
  fileName: string;
}

@Injectable()
export class CloudflareHostsR2Service {
  private readonly logger = new Logger(CloudflareHostsR2Service.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const accessKey = this.config.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretKey = this.config.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('CLOUDFLARE_R2_BUCKET_HOSTS', 'hosts');
    this.publicUrl = (this.config.get<string>('CLOUDFLARE_R2_PUBLIC_URL_HOSTS') || '').replace(/\/$/, ''); // strip trailing slash

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey!, secretAccessKey: secretKey! },
    });
  }

  // ─── PUBLIC METHODS ──────────────────────────────────────────────────────────

  /**
   * Upload an image buffer for a specific host and asset folder.
   * Returns the full public URL and the R2 object key.
   *
   * @example
   *   const result = await hostsR2.uploadHostImage(
   *     'wakhata-levi', 'profile', file.buffer, file.originalname, file.mimetype
   *   );
   *   // result.url = "https://pub-xxx.r2.dev/wakhata-levi/profile/avatar-1710000000-abc123.jpg"
   */
  async uploadHostImage(
    hostSlug: string,
    folder: HostAssetFolder,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<HostUploadResult> {
    const safeSlug = this.sanitizeSlug(hostSlug);
    const ext = this.getExtension(fileName, mimeType);
    const uniqueName = `${folder}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    const key = `${safeSlug}/${folder}/${uniqueName}`;

    this.logger.log(`Uploading host image → ${this.bucket}/${key}`);

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          // Allow public read via the dev URL
          Metadata: {
            hostSlug: safeSlug,
            folder,
            originalName: fileName,
          },
        }),
      );

      const url = `${this.publicUrl}/${key}`;
      this.logger.log(`✅ Host image uploaded: ${url}`);

      return { url, key, bucket: this.bucket, folder, hostSlug: safeSlug, fileName: uniqueName };
    } catch (err: any) {
      this.logger.error(`Failed to upload host image: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`R2 upload failed: ${err.message}`);
    }
  }

  /**
   * Delete a host asset by its R2 key.
   * Safe — swallows NoSuchKey errors.
   */
  async deleteHostAsset(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      this.logger.log(`🗑️  Deleted host asset: ${key}`);
    } catch (err: any) {
      if (err.Code !== 'NoSuchKey') {
        this.logger.warn(`Could not delete ${key}: ${err.message}`);
      }
    }
  }

  /**
   * List all assets for a given host (optionally filtered to one folder).
   * Returns an array of public URLs.
   */
  async listHostAssets(
    hostSlug: string,
    folder?: HostAssetFolder,
  ): Promise<{ key: string; url: string; size: number; lastModified: Date }[]> {
    const safeSlug = this.sanitizeSlug(hostSlug);
    const prefix = folder ? `${safeSlug}/${folder}/` : `${safeSlug}/`;

    const response = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      }),
    );

    return (response.Contents ?? []).map(obj => ({
      key: obj.Key!,
      url: `${this.publicUrl}/${obj.Key}`,
      size: obj.Size ?? 0,
      lastModified: obj.LastModified ?? new Date(),
    }));
  }

  /**
   * Rename a host's folder prefix — called when admin changes a host slug.
   * Copies all objects to new key prefix then deletes originals.
   */
  async renameHostFolder(oldSlug: string, newSlug: string): Promise<void> {
    const oldPrefix = this.sanitizeSlug(oldSlug) + '/';
    const newPrefix = this.sanitizeSlug(newSlug) + '/';

    const list = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: oldPrefix,
      }),
    );

    if (!list.Contents?.length) return;

    this.logger.log(`Renaming host folder: ${oldPrefix} → ${newPrefix} (${list.Contents.length} objects)`);

    for (const obj of list.Contents) {
      const oldKey = obj.Key!;
      const newKey = newPrefix + oldKey.slice(oldPrefix.length);

      await this.s3.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${oldKey}`,
          Key: newKey,
        }),
      );

      await this.deleteHostAsset(oldKey);
    }

    this.logger.log(`✅ Host folder renamed: ${list.Contents.length} objects moved`);
  }

  /**
   * Build the public URL for a known key (no upload — just URL construction).
   * Useful when you already have the key stored in MongoDB.
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Generate a presigned PUT URL so the frontend can upload directly to R2
   * without the file passing through the NestJS server.
   * Expires in 10 minutes.
   */
  async getPresignedUploadUrl(
    hostSlug: string,
    folder: HostAssetFolder,
    fileName: string,
    mimeType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const safeSlug = this.sanitizeSlug(hostSlug);
    const ext = this.getExtension(fileName, mimeType);
    const uniqueName = `${folder}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
    const key = `${safeSlug}/${folder}/${uniqueName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 600 });
    const publicUrl = `${this.publicUrl}/${key}`;

    return { uploadUrl, publicUrl, key };
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

  private sanitizeSlug(slug: string): string {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-|-$/g, '');
  }

  private getExtension(fileName: string, mimeType: string): string {
    const fromName = fileName.split('.').pop()?.toLowerCase();
    if (fromName && fromName.length <= 5) return fromName;
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return mimeMap[mimeType] ?? 'jpg';
  }
}