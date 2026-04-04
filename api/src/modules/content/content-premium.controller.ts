/**
 * content-premium.controller.ts
 *
 * FIXES IN THIS VERSION:
 *
 *  1. Presigned URL rewritten from private S3 endpoint → public R2 domain
 *     The AWS SDK generates presigned URLs against the private S3 endpoint:
 *       https://BUCKET.ACCOUNT_ID.r2.cloudflarestorage.com/KEY
 *     Browsers cannot access this directly. We rewrite to the public domain:
 *       https://pub-xxx.r2.dev/KEY
 *     R2 validates the signature against the key/credentials — not the hostname —
 *     so the rewritten URL remains fully valid.
 *
 *  2. x-amz-checksum-mode fully suppressed
 *     Added both 'x-amz-checksum-mode' and 'x-amz-checksum-crc32' to
 *     unhoistableHeaders. Without this R2 rejects the request.
 *
 *  3. ResponseContentType forces correct MIME on R2 response
 *     Files uploaded without explicit mimeType are stored as application/octet-stream.
 *     ResponseContentType overrides this so browsers receive the correct type.
 *
 *  4. mimeType resolved from multiple fallback sources
 *     storage.mimeType → metadata.contentType + extension → extension map → type default
 *
 *  5. mimeType returned in response so players use the correct element
 *
 *  6. S3Client created once in onModuleInit
 */

import {
  Controller, Get, Param, Request,
  UseGuards, Logger, ForbiddenException, NotFoundException,
  DefaultValuePipe, ParseIntPipe, Query, OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Content } from './schemas/content.schema';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../user-and-monetization/auth/guards/subscription.guard';
import { SubscriptionService } from '../../user-and-monetization/subscription/subscription.service';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service';

const SIGNED_URL_EXPIRY_SECONDS = 4 * 60 * 60; // 4 hours

@Controller('api/content')
export class ContentPremiumController implements OnModuleInit {
  private readonly logger = new Logger(ContentPremiumController.name);
  private s3: S3Client;
  private accountId: string;

  constructor(
    @InjectModel(Content.name) private contentModel: Model<Content>,
    private readonly subscriptionService: SubscriptionService,
    private readonly r2: CloudflareR2Service,
  ) {}

  onModuleInit() {
    this.accountId  = process.env.CLOUDFLARE_ACCOUNT_ID           ?? '';
    const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID     ?? '';
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? '';

    if (!this.accountId || !accessKey || !secretKey) {
      this.logger.error(
        '⚠️  Missing R2 credentials — CLOUDFLARE_ACCOUNT_ID, ' +
        'CLOUDFLARE_R2_ACCESS_KEY_ID or CLOUDFLARE_R2_SECRET_ACCESS_KEY not set',
      );
    }

    // S3Client points to the private R2 S3 endpoint for signing.
    // The signed URL is rewritten to the public domain before being returned.
    this.s3 = new S3Client({
      region:         'auto',
      endpoint:       `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials:    { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: false,
    });

    this.logger.log('✅ Playback S3Client initialised');
  }

  // ============================================================================
  // GET /api/content/premium
  // ============================================================================
  @Get('premium')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async listPremiumContent(
    @Request() req,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { isPremium: true, status: 'ready' };
    if (type) filter.type = type;

    const [items, total] = await Promise.all([
      this.contentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.contentModel.countDocuments(filter),
    ]);

    this.logger.log(`Premium listing: ${items.length} items for user ${req.user.userId}`);

    return {
      success: true,
      items:   items.map(i => this.formatForClient(i)),
      total,
      page,
      pages:   Math.ceil(total / limit),
    };
  }

  // ============================================================================
  // GET /api/content/free
  // ============================================================================
  @Get('free')
  @UseGuards(JwtAuthGuard)
  async listFreeContent(
    @Request() req,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { isPremium: false, status: 'ready' };
    if (type) filter.type = type;

    const [items, total] = await Promise.all([
      this.contentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.contentModel.countDocuments(filter),
    ]);

    return {
      success: true,
      items:   items.map(i => this.formatForClient(i)),
      total,
      page,
      pages:   Math.ceil(total / limit),
    };
  }

  // ============================================================================
  // GET /api/content/:id/play
  // ============================================================================
  @Get(':id/play')
  @UseGuards(JwtAuthGuard)
  async getPlaybackUrl(@Param('id') id: string, @Request() req) {

    // 1. Find by slug first, then ObjectId
    let item = await this.contentModel
      .findOne({ slug: id, status: 'ready' })
      .select('title isPremium status storage type slug metadata')
      .lean()
      .catch(() => null);

    if (!item) {
      item = await this.contentModel
        .findById(id)
        .select('title isPremium status storage type slug metadata')
        .lean()
        .catch(() => null);
    }

    if (!item) throw new NotFoundException('Content not found');
    if ((item as any).status !== 'ready') {
      throw new ForbiddenException('Content is not available yet');
    }

    // 2. Premium gate — real-time subscription check
    if ((item as any).isPremium) {
      this.logger.log(`Premium play attempt: "${(item as any).title}" by user ${req.user.userId}`);
      const check = await this.subscriptionService.checkSubscription(req.user.userId);
      if (!check.hasActiveSubscription) {
        this.logger.warn(`Subscription required — denied for user ${req.user.userId}`);
        throw new ForbiddenException({
          statusCode: 403,
          message:    'Active subscription required to watch this content',
          error:      'SUBSCRIPTION_REQUIRED',
          redirectTo: '/premium-access',
        });
      }
    }

    // 3. Resolve R2 object key
    const storage  = (item as any).storage  ?? {};
    const metadata = (item as any).metadata ?? {};

    const r2Key =
      storage.cloudflareKey ||
      storage.originalUrl?.split('.r2.dev/').pop() ||
      storage.originalUrl
        ?.split('.cloudflarestorage.com/')
        .pop()
        ?.split('/')
        .slice(1)
        .join('/');

    if (!r2Key) {
      this.logger.error(
        `No R2 key for "${(item as any).title}" (${id}). ` +
        `cloudflareKey="${storage.cloudflareKey}" originalUrl="${storage.originalUrl}"`,
      );
      throw new ForbiddenException('Playback not available — media not yet processed');
    }

    // 4. Resolve bucket name
    const contentType = (item as any).type as any;
    let bucketName: string;
    try {
      bucketName = this.r2.getBucketForContentType(contentType);
    } catch {
      this.logger.error(`Unknown content type "${contentType}" for id ${id}`);
      throw new ForbiddenException('Playback not available — unknown content type');
    }

    // 5. Resolve MIME type
    const mimeType = this.resolveMimeType(storage, metadata, r2Key, contentType);

    // 6. Generate presigned URL with public domain rewrite
    try {
      const signedUrl = await this.generateGetSignedUrl(bucketName, r2Key, mimeType);

      this.logger.log(
        `✅ Signed URL issued: "${(item as any).title}" → user ${req.user.userId} ` +
        `(4h TTL, mime: ${mimeType}, bucket: ${bucketName})`,
      );

      return {
        success:   true,
        playUrl:   signedUrl,
        mimeType,
        expiresIn: SIGNED_URL_EXPIRY_SECONDS,
        expiresAt: new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000).toISOString(),
        title:     (item as any).title,
        type:      (item as any).type,
        isPremium: (item as any).isPremium,
        thumbnail: storage.thumbnail ?? '',
      };
    } catch (err: any) {
      this.logger.error(
        `Failed to generate signed URL for "${(item as any).title}": ${err.message}`,
      );
      throw new ForbiddenException('Could not generate playback URL');
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Generate a presigned GET URL for R2 playback.
   *
   * THE CORE FIX:
   * The AWS SDK generates URLs against the private S3 endpoint:
   *   https://BUCKET.ACCOUNT_ID.r2.cloudflarestorage.com/KEY?...
   *
   * Browsers cannot access r2.cloudflarestorage.com — it is the private
   * S3-compatible API. We rewrite the hostname to the public R2 domain
   * after signing. R2 validates signatures against credentials + key,
   * not the hostname, so the rewritten URL is still fully valid.
   *
   * Result:
   *   https://pub-328b12daabc14ba2b456246ba6a6446a.r2.dev/KEY?...signature...
   */
  private async generateGetSignedUrl(
    bucket:   string,
    key:      string,
    mimeType: string,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket:              bucket,
      Key:                 key,
      ResponseContentType: mimeType,
    });

    let signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn:          SIGNED_URL_EXPIRY_SECONDS,
      // Prevent SDK adding x-amz-checksum-mode — R2 rejects it causing infinite retry
      unhoistableHeaders: new Set(['x-amz-checksum-mode', 'x-amz-checksum-crc32']),
    });

    // Rewrite private S3 hostname → public R2 domain
    // e.g. reelafrika-podcast.ACCOUNT.r2.cloudflarestorage.com → pub-xxx.r2.dev
    const privateHost = `${bucket}.${this.accountId}.r2.cloudflarestorage.com`;
    const publicBase  = this.getPublicUrlForBucket(bucket);

    if (publicBase && signedUrl.includes(privateHost)) {
      signedUrl = signedUrl.replace(`https://${privateHost}`, publicBase);
      this.logger.debug(`Rewrote presigned URL to public domain: ${publicBase}`);
    } else if (!publicBase) {
      this.logger.warn(
        `No public URL configured for bucket "${bucket}". ` +
        `Add CLOUDFLARE_R2_PUBLIC_URL_${bucket.toUpperCase().replace(/-/g, '_')} to .env`,
      );
    }

    return signedUrl;
  }

  /**
   * Map bucket name → public R2 domain from env.
   * Falls back to CLOUDFLARE_R2_PUBLIC_URL (default bucket) if no specific entry.
   */
  private getPublicUrlForBucket(bucket: string): string {
    const map: Record<string, string> = {
      'reelafrika-podcast':     process.env.CLOUDFLARE_R2_PUBLIC_URL_PODCAST     ?? '',
      'reelafrika-mini-series': process.env.CLOUDFLARE_R2_PUBLIC_URL_MINISODE    ?? '',
      'reelafrika-reelfilms':   process.env.CLOUDFLARE_R2_PUBLIC_URL_REELFILM    ?? '',
      'reelafrika-tv-shows':    process.env.CLOUDFLARE_R2_PUBLIC_URL_TV_EPISODE  ?? '',
      'reelafrika-movies':      process.env.CLOUDFLARE_R2_PUBLIC_URL_MOVIE       ?? '',
      'reelafrika-music':       process.env.CLOUDFLARE_R2_PUBLIC_URL_MUSIC       ?? '',
      'reelafrika-stageplays':  process.env.CLOUDFLARE_R2_PUBLIC_URL_STAGEPLAY   ?? '',
    };

    // Strip trailing slash for clean URL concatenation
    const url = map[bucket] || (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? '');
    return url.replace(/\/$/, '');
  }

  /**
   * Resolve MIME type from multiple sources.
   * Priority: storage.mimeType → metadata hint → extension → content type default.
   *
   * This is needed because files uploaded without explicit mimeType
   * have storage.mimeType = "" and R2 serves them as application/octet-stream.
   * ResponseContentType on the presigned URL overrides this.
   */
  private resolveMimeType(
    storage:     any,
    metadata:    any,
    r2Key:       string,
    contentType: string,
  ): string {
    // a) Explicit stored mimeType
    if (storage.mimeType && storage.mimeType !== '') {
      return storage.mimeType;
    }

    const ext = r2Key.split('.').pop()?.toLowerCase() ?? '';

    // b) metadata.contentType = "audio" — pick audio MIME
    if (metadata.contentType === 'audio') {
      const audioMap: Record<string, string> = {
        mp3: 'audio/mpeg',
        m4a: 'audio/mp4',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        aac: 'audio/aac',
        mp4: 'audio/mp4',  // MP4 container with audio track
      };
      return audioMap[ext] ?? 'audio/mp4';
    }

    // c) Extension-based mapping
    const extMap: Record<string, string> = {
      mp4:  'video/mp4',
      mov:  'video/quicktime',
      webm: 'video/webm',
      mkv:  'video/x-matroska',
      avi:  'video/x-msvideo',
      mp3:  'audio/mpeg',
      m4a:  'audio/mp4',
      wav:  'audio/wav',
      ogg:  'audio/ogg',
      aac:  'audio/aac',
    };
    if (ext && extMap[ext]) return extMap[ext];

    // d) Content type default
    const audioTypes = new Set(['podcast', 'music']);
    return audioTypes.has(contentType) ? 'audio/mp4' : 'video/mp4';
  }

  private formatForClient(doc: any) {
    return {
      _id:             String(doc._id),
      title:           doc.title,
      type:            doc.type,
      slug:            doc.slug || String(doc._id),
      isPremium:       doc.isPremium    ?? false,
      isNew:           doc.isNewContent ?? false,
      isFeatured:      doc.isFeatured   ?? false,
      thumbnailUrl:    doc.images?.backdrop || doc.storage?.thumbnail || doc.images?.poster || '',
      posterUrl:       doc.images?.poster   || doc.storage?.thumbnail || '',
      displayDuration: doc.displayDuration  || '',
      description:     doc.description     || '',
      year:            doc.metadata?.releaseYear ?? null,
      genre:           Array.isArray(doc.metadata?.genre)
                         ? doc.metadata.genre[0]
                         : (doc.metadata?.genre ?? ''),
      hostName:        doc.hostName ?? '',
    };
  }
}