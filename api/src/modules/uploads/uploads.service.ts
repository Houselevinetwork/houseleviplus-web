// api/src/modules/uploads/uploads.service.ts
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { ContentService } from '../content/content.service';
import { CreateDraftDto, MediaType } from './dtos/create-draft.dto';
import { GetPresignedUrlDto } from './dtos/get-presigned-url.dto';
import { CompleteUploadDto } from './dtos/complete-upload.dto';
import { UploadException } from '../../common/exceptions/upload.exception';
import { ContentType as ContentSchemaType, StorageProvider, ContentStatus } from '../content/schemas/content.schema';
import * as fetch from 'node-fetch';
import FormData = require('form-data');
import { Readable } from 'stream';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  private readonly mediaTypeMap: Record<MediaType, ContentSchemaType> = {
    [MediaType.MINISERIES]: ContentSchemaType.MINISODE,
    [MediaType.REELFILM]:   ContentSchemaType.REELFILM,
    [MediaType.STAGEPLAY]:  ContentSchemaType.STAGE_PLAY,
    [MediaType.TVSHOW]:     ContentSchemaType.TV_EPISODE,
    [MediaType.MOVIE]:      ContentSchemaType.MOVIE,
    [MediaType.PODCAST]:    ContentSchemaType.PODCAST,
    [MediaType.MUSIC]:      ContentSchemaType.MUSIC,
  };

  constructor(
    private cloudflareService: CloudflareService,
    private contentService: ContentService,
    private configService: ConfigService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // CREATE DRAFT
  // ──────────────────────────────────────────────────────────────────────────
  async createDraft(
    createDraftDto: CreateDraftDto,
    userId: string,
  ): Promise<{ id: string; mediaType: string; storageMethod: string; createdAt: Date }> {
    try {
      this.logger.log(`Creating draft: ${createDraftDto.mediaType} - ${createDraftDto.title}`);

      // Build series info for episodic content
      const seriesInfo = createDraftDto.series
        ? {
            title:        createDraftDto.series.title,
            description:  createDraftDto.series.description  || '',
            genres:       (createDraftDto.series as any).genres       || [],
            rating:       (createDraftDto.series as any).rating,
            releaseYear:  (createDraftDto.series as any).releaseYear,
            isOriginal:   (createDraftDto.series as any).isOriginal   || false,
            isExclusive:  (createDraftDto.series as any).isExclusive  || false,
            totalSeasons:  0,
            totalEpisodes: 0,
          }
        : undefined;

      // Build metadata with all fields
      const metadata: any = {
        mediaType:     createDraftDto.mediaType,
        fileName:      createDraftDto.fileName,
        fileSize:      createDraftDto.fileSize,
        contentType:   createDraftDto.type,
        storageMethod: createDraftDto.storageMethod ?? 'r2',

        // Cast & Crew
        cast:     createDraftDto.cast     || [],
        director: createDraftDto.director,
        writer:   (createDraftDto as any).writer,
        producer: (createDraftDto as any).producer,

        // Genres
        genre:       createDraftDto.genre       || [],
        musicGenre:  (createDraftDto as any).musicGenre  || [],
        podcastGenre:(createDraftDto as any).podcastGenre || [],

        // Release Info
        releaseYear:   createDraftDto.releaseYear,
        rating:        (createDraftDto as any).rating,
        ratingReasons: (createDraftDto as any).ratingReasons || [],

        // Language & Subtitles
        language:   (createDraftDto as any).language,
        audioTracks:(createDraftDto as any).audioTracks || [],
        subtitles:  (createDraftDto as any).subtitles   || [],

        // Classification
        tags:   (createDraftDto as any).tags   || [],
        themes: (createDraftDto as any).themes || [],

        // Regional Metadata
        region:  (createDraftDto as any).region  || [],
        country: (createDraftDto as any).country,

        // Category Enabler Flags
        featured:    (createDraftDto as any).featured    || false,
        isOriginal:  (createDraftDto as any).isOriginal  || false,
        isExclusive: (createDraftDto as any).isExclusive || false,
        isTrending:  (createDraftDto as any).isTrending  || false,

        // Award & Festival Flags
        hasWonAwards:       (createDraftDto as any).hasWonAwards       || false,
        awardsList:         (createDraftDto as any).awardsList         || [],
        isFestivalSelection:(createDraftDto as any).isFestivalSelection || false,
        festivalsList:      (createDraftDto as any).festivalsList      || [],

        // Thematic Flags
        voiceOfWomen: (createDraftDto as any).voiceOfWomen || false,
        isDiaspora:   (createDraftDto as any).isDiaspora   || false,

        // Episode-specific
        episodeTitle:       (createDraftDto as any).episodeTitle,
        episodeDescription: (createDraftDto as any).episodeDescription,

        // Music-specific
        artist: (createDraftDto as any).artist,
        album:  (createDraftDto as any).album,

        // Podcast-specific
        host:   (createDraftDto as any).host,
        guests: (createDraftDto as any).guests || [],
        topics: (createDraftDto as any).topics || [],
      };

      const content = await this.contentService.create({
        type:        this.mediaTypeMap[createDraftDto.mediaType],
        title:       createDraftDto.title,
        description: createDraftDto.description || '',
        uploaderId:  userId,
        series:      seriesInfo,
        season:      createDraftDto.season,
        episode:     createDraftDto.episode,
        seriesId:    createDraftDto.seriesId,
        metadata,
        isPremium:   createDraftDto.isPremium || false,

        // Slug — generated from title, used for SEO-friendly watch URLs
        slug: createDraftDto.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 80),

        // ── Fields previously dropped silently ────────────────────────────
        isFeatured:      createDraftDto.isFeatured   || false,
        isNewContent:    createDraftDto.isNewContent  || false,
        displayDuration: createDraftDto.displayDuration,
        status:          createDraftDto.status        || 'draft',

        // Host assignment (content shows under host immediately after wizard)
        hostSlug: createDraftDto.hostSlug || null,
        hostId:   createDraftDto.hostId   || null,
        hostName: createDraftDto.hostName  || null,

        // Images — poster + backdrop uploaded in wizard steps 5-6
        images: {
          poster:   createDraftDto.images?.poster   || '',
          backdrop: createDraftDto.images?.backdrop || '',
        },

        // If media was uploaded before draft creation, persist the URL
        ...(createDraftDto.mediaUrl
          ? {
              storage: {
                originalUrl: createDraftDto.mediaUrl,
                provider:    createDraftDto.storageMethod || 'r2',
                size:        createDraftDto.fileSize || 0,
                mimeType:    '',
              },
            }
          : {}),
      });

      this.logger.debug(`Draft created: ${content._id}`);

      return {
        id:            (content._id as any).toString(),
        mediaType:     createDraftDto.mediaType,
        storageMethod: createDraftDto.storageMethod ?? 'r2',
        createdAt:     content.createdAt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create draft: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new UploadException('DRAFT_CREATION_FAILED', 500, 'Failed to create upload draft', { originalError: errorMessage });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET PRESIGNED URL
  // ──────────────────────────────────────────────────────────────────────────
  async getPresignedUrl(
    uploadId: string,
    getPresignedUrlDto: GetPresignedUrlDto,
    userId: string,
  ): Promise<{ uploadUrl: string; publicUrl?: string; uploadId: string; cloudflareKey?: string; method: 'PUT' | 'POST'; expiresIn: number }> {
    try {
      this.logger.log(`Generating presigned URL for upload ${uploadId}`);

      const content = await this.contentService.findById(uploadId);
      if (!content) throw new UploadException('CONTENT_NOT_FOUND', 404, `Upload draft not found: ${uploadId}`);
      if (content.uploaderId.toString() !== userId) throw new ForbiddenException('You do not have permission to access this upload');

      const storageMethod = content.metadata?.storageMethod || 'r2';
      if (storageMethod !== 'r2') throw new UploadException('INVALID_STORAGE_METHOD', 400, 'Presigned URLs are only for R2 uploads. Use /stream-direct for Stream uploads.');

      const uploadCredentials = await this.cloudflareService.createUploadSession(content.type as any, 'r2', getPresignedUrlDto.fileName);

      return {
        uploadUrl:     uploadCredentials.uploadUrl,
        publicUrl:     uploadCredentials.cloudflareKey
          ? this.cloudflareService.getR2PublicUrl(content.type as any, uploadCredentials.cloudflareKey)
          : undefined,
        uploadId,
        cloudflareKey: uploadCredentials.cloudflareKey,
        method:        uploadCredentials.method,
        expiresIn:     uploadCredentials.expiresIn,
      };
    } catch (error) {
      if (error instanceof UploadException || error instanceof ForbiddenException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate presigned URL: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new UploadException('PRESIGNED_URL_FAILED', 500, 'Failed to generate upload URL', { originalError: errorMessage });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPLOAD TO STREAM
  // ──────────────────────────────────────────────────────────────────────────
  async uploadToStream(
    uploadId: string,
    file: any,
    userId: string,
  ): Promise<{ streamId: string; status: string; uploadId: string }> {
    try {
      this.logger.log(`Uploading to Stream: ${uploadId} - ${file.originalname}`);

      const content = await this.contentService.findById(uploadId);
      if (!content) throw new UploadException('CONTENT_NOT_FOUND', 404, `Content not found: ${uploadId}`);
      if (content.uploaderId.toString() !== userId) throw new ForbiddenException('You do not have permission to upload to this content');

      const storageMethod = content.metadata?.storageMethod || 'r2';
      if (storageMethod !== 'stream') throw new UploadException('INVALID_STORAGE_METHOD', 400, 'This upload is configured for R2, not Stream');

      const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
      const apiToken  = this.configService.get<string>('CLOUDFLARE_STREAM_API_TOKEN');
      if (!accountId || !apiToken) throw new UploadException('STREAM_CONFIG_MISSING', 500, 'Cloudflare Stream credentials not configured');

      const formData  = new FormData();
      const fileStream = file.buffer ? Readable.from(file.buffer) : file;
      formData.append('file', fileStream, { filename: file.originalname, contentType: file.mimetype });
      formData.append('name', content.title || file.originalname);
      formData.append('requireSignedURLs', 'false');

      const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
      const response  = await fetch.default(uploadUrl, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${apiToken}`, ...formData.getHeaders() },
        body:    formData as any,
      });

      const result: any = await response.json();
      if (!result.success || !result.result?.uid) {
        this.logger.error('Stream upload failed:', result);
        throw new UploadException('STREAM_UPLOAD_FAILED', 500, result.errors?.[0]?.message || 'Failed to upload to Stream');
      }

      const streamId = result.result.uid;
      this.logger.log(`✅ Uploaded to Stream: ${streamId}`);

      await this.contentService.update(uploadId, {
        metadata: { ...content.metadata, cloudflareStreamId: streamId, streamStatus: result.result.status?.state || 'uploading' },
      });

      return { streamId, status: result.result.status?.state || 'processing', uploadId };
    } catch (error) {
      if (error instanceof UploadException || error instanceof ForbiddenException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to upload to Stream: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new UploadException('STREAM_UPLOAD_FAILED', 500, 'Failed to upload to Stream', { originalError: errorMessage });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET STREAM PROCESSING STATUS
  // ──────────────────────────────────────────────────────────────────────────
  async getStreamProcessingStatus(
    uploadId: string,
    userId: string,
  ): Promise<{ streamId: string; state: string; progress: number; ready: boolean; playbackUrl?: string }> {
    try {
      const content = await this.contentService.findById(uploadId);
      if (!content) throw new UploadException('CONTENT_NOT_FOUND', 404, `Content not found: ${uploadId}`);
      if (content.uploaderId.toString() !== userId) throw new ForbiddenException('You do not have permission to view this upload');

      const streamId = content.metadata?.cloudflareStreamId || content.storage?.cloudflareStreamId;
      if (!streamId) throw new UploadException('STREAM_ID_NOT_FOUND', 404, 'Stream ID not found for this content');

      const videoInfo: any = await this.cloudflareService.getStreamVideoInfo(streamId);
      this.logger.debug(`📹 Stream Status: ${JSON.stringify(videoInfo, null, 2)}`);

      if (videoInfo.status?.state === 'ready' && content.status !== ContentStatus.READY) {
        this.logger.log(`Stream video ready, updating content: ${uploadId}`);
        await this.contentService.markAsReady(uploadId, {
          originalUrl:       videoInfo.playbackUrl || videoInfo.preview || '',
          cloudflareStreamId: streamId,
          size:              videoInfo.size || 0,
          mimeType:          'video/mp4',
          provider:          StorageProvider.STREAM,
          duration:          videoInfo.duration || 0,
        });
        await this.contentService.update(uploadId, {
          storage: { ...content.storage, thumbnail: this.getStreamThumbnail(streamId) },
        } as any);
      }

      return {
        streamId,
        state:      videoInfo.status?.state        || 'unknown',
        progress:   videoInfo.status?.pct_complete || 0,
        ready:      videoInfo.status?.state === 'ready',
        playbackUrl: videoInfo.playbackUrl || videoInfo.preview,
      };
    } catch (error) {
      if (error instanceof UploadException || error instanceof ForbiddenException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get Stream status: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new UploadException('STREAM_STATUS_FAILED', 500, 'Failed to check Stream status', { originalError: errorMessage });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COMPLETE UPLOAD
  // ──────────────────────────────────────────────────────────────────────────
  async completeUpload(
    uploadId: string,
    dto: CompleteUploadDto,
    userId: string,
  ): Promise<{ contentId: string; status: string; originalUrl: string }> {
    try {
      this.logger.log(`Completing upload: ${uploadId} - ${dto.title}`);

      const content = await this.contentService.findById(uploadId);
      if (!content) throw new UploadException('CONTENT_NOT_FOUND', 404, `Content not found: ${uploadId}`);
      if (content.uploaderId.toString() !== userId) throw new ForbiddenException('You do not have permission to complete this upload');

      let originalUrl  = '';
      let size         = dto.fileSize;
      let mimeType     = 'application/octet-stream';
      let provider: StorageProvider;
      let finalStatus: ContentStatus;
      let duration     = dto.duration;

      if (dto.storageMethod === 'r2') {
        if (!dto.cloudflareKey) throw new UploadException('MISSING_CLOUDFLARE_KEY', 400, 'cloudflareKey required for R2');
        const exists = await this.cloudflareService.r2ObjectExists(content.type as any, dto.cloudflareKey);
        if (!exists) throw new UploadException('FILE_NOT_FOUND_IN_R2', 404, 'File not found in R2');

        const r2meta  = await this.cloudflareService.getR2Metadata(content.type as any, dto.cloudflareKey);
        size          = r2meta.size;
        originalUrl   = this.cloudflareService.getR2PublicUrl(content.type as any, dto.cloudflareKey);
        provider      = StorageProvider.R2;
        mimeType      = this.getMimeType(dto.cloudflareKey);
        finalStatus   = ContentStatus.READY;
      } else {
        const streamId = content.metadata?.cloudflareStreamId || dto.cloudflareStreamId;
        if (!streamId) throw new UploadException('MISSING_STREAM_ID', 400, 'cloudflareStreamId required for Stream');

        const videoInfo: any = await this.cloudflareService.getStreamVideoInfo(streamId);
        size        = videoInfo.size     || dto.fileSize;
        duration    = videoInfo.duration || dto.duration;
        originalUrl = videoInfo.playbackUrl || videoInfo.preview || '';
        mimeType    = 'video/mp4';
        provider    = StorageProvider.STREAM;
        finalStatus = videoInfo.status?.state === 'ready' ? ContentStatus.READY : ContentStatus.PROCESSING;
      }

      const updatedMetadata: any = {
        ...content.metadata,
        duration,
        season:  dto.season,
        episode: dto.episode,

        cast:     dto.cast     || content.metadata?.cast     || [],
        director: dto.director || content.metadata?.director,
        writer:   (dto as any).writer,
        producer: (dto as any).producer,

        genre:       dto.genre       || content.metadata?.genre       || [],
        musicGenre:  (dto as any).musicGenre  || content.metadata?.musicGenre  || [],
        podcastGenre:(dto as any).podcastGenre || content.metadata?.podcastGenre || [],

        releaseYear:   dto.releaseYear   || content.metadata?.releaseYear,
        rating:        (dto as any).rating        || content.metadata?.rating,
        ratingReasons: (dto as any).ratingReasons || [],

        language:   (dto as any).language   || content.metadata?.language,
        audioTracks:(dto as any).audioTracks || [],
        subtitles:  (dto as any).subtitles   || [],
        subtitleUrls:(dto as any).subtitleUrls || [],

        tags:     (dto as any).tags     || [],
        keywords: (dto as any).keywords || [],
        themes:   (dto as any).themes   || [],

        region:  (dto as any).region  || content.metadata?.region  || [],
        country: (dto as any).country || content.metadata?.country,

        featured:    dto.featured    ?? content.metadata?.featured    ?? false,
        isOriginal:  (dto as any).isOriginal  ?? content.metadata?.isOriginal  ?? false,
        isExclusive: (dto as any).isExclusive ?? content.metadata?.isExclusive ?? false,
        isTrending:  (dto as any).isTrending  ?? false,

        hasWonAwards:       (dto as any).hasWonAwards       ?? content.metadata?.hasWonAwards       ?? false,
        awardsList:         (dto as any).awardsList         || content.metadata?.awardsList          || [],
        isFestivalSelection:(dto as any).isFestivalSelection ?? content.metadata?.isFestivalSelection ?? false,
        festivalsList:      (dto as any).festivalsList      || content.metadata?.festivalsList       || [],

        voiceOfWomen: (dto as any).voiceOfWomen ?? content.metadata?.voiceOfWomen ?? false,
        isDiaspora:   (dto as any).isDiaspora   ?? content.metadata?.isDiaspora   ?? false,

        episodeTitle:       (dto as any).episodeTitle,
        episodeDescription: (dto as any).episodeDescription,

        artist: (dto as any).artist,
        album:  (dto as any).album,

        host:       (dto as any).host,
        guests:     (dto as any).guests     || [],
        topics:     (dto as any).topics     || [],
        timestamps: (dto as any).timestamps || [],
      };

      const seriesInfo = dto.series
        ? {
            title:        dto.series.title,
            description:  dto.series.description                             || '',
            images:       (dto.series as any).images || content.series?.images || {},
            totalSeasons: (dto.series as any).totalSeasons || content.series?.totalSeasons || 0,
            totalEpisodes:(dto.series as any).totalEpisodes || content.series?.totalEpisodes || 0,
            genres:       (dto.series as any).genres || content.series?.genres || [],
            rating:       (dto.series as any).rating || content.series?.rating,
            releaseYear:  (dto.series as any).releaseYear || content.series?.releaseYear,
            isOriginal:   (dto.series as any).isOriginal  ?? content.series?.isOriginal  ?? false,
            isExclusive:  (dto.series as any).isExclusive ?? content.series?.isExclusive ?? false,
          }
        : content.series;

      await this.contentService.update(uploadId, {
        title:       dto.title,
        description: dto.description || '',
        series:      seriesInfo,
        season:      dto.season,
        episode:     dto.episode,
        images:      dto.images || content.images || {},
        trailer:     (dto as any).trailer || content.trailer,
        metadata:    updatedMetadata,
        isPremium:   dto.isPremium ?? content.isPremium ?? false,
      });

      const storagePayload = {
        originalUrl,
        cloudflareKey:      dto.cloudflareKey,
        cloudflareStreamId: dto.cloudflareStreamId || content.metadata?.cloudflareStreamId,
        size,
        mimeType,
        provider,
        duration,
        thumbnail: (dto as any).thumbnail || (dto.storageMethod === 'stream'
          ? this.getStreamThumbnail(dto.cloudflareStreamId || content.metadata?.cloudflareStreamId)
          : undefined),
      };

      if (finalStatus === ContentStatus.READY) {
        await this.contentService.markAsReady(uploadId, storagePayload);
      } else {
        await this.contentService.markAsUploaded(uploadId, storagePayload);
      }

      const finalContent = await this.contentService.findById(uploadId);
      this.logger.debug(`Upload completed: ${uploadId} - Status: ${finalContent.status}`);

      return {
        contentId:   (finalContent._id as any).toString(),
        status:      finalContent.status,
        originalUrl: finalContent.storage.originalUrl ?? '',
      };
    } catch (error) {
      if (error instanceof UploadException || error instanceof ForbiddenException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to complete upload: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new UploadException('UPLOAD_COMPLETION_FAILED', 500, 'Failed to complete upload', { originalError: errorMessage });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET UPLOAD STATUS
  // ──────────────────────────────────────────────────────────────────────────
  async getUploadStatus(
    uploadId: string,
    userId: string,
  ): Promise<{ contentId: string; status: string; progress: number; storageMethod?: string }> {
    try {
      const content = await this.contentService.findById(uploadId);
      if (!content) throw new UploadException('CONTENT_NOT_FOUND', 404, `Content not found: ${uploadId}`);
      if (content.uploaderId.toString() !== userId) throw new ForbiddenException('Permission denied');

      let progress = 0;
      if (content.status === 'ready')                                         progress = 100;
      else if (content.status === 'uploaded' || content.status === 'processing') progress = 75;

      return {
        contentId:     (content._id as any).toString(),
        status:        content.status,
        progress,
        storageMethod: content.metadata?.storageMethod,
      };
    } catch (error) {
      if (error instanceof UploadException || error instanceof ForbiddenException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get status: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new UploadException('STATUS_CHECK_FAILED', 500, 'Failed to check status', { originalError: errorMessage });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CANCEL UPLOAD
  // ──────────────────────────────────────────────────────────────────────────
  async cancelUpload(uploadId: string, userId: string): Promise<void> {
    try {
      const content = await this.contentService.findById(uploadId);
      if (!content) throw new UploadException('CONTENT_NOT_FOUND', 404, `Content not found: ${uploadId}`);
      if (content.uploaderId.toString() !== userId) throw new ForbiddenException('Permission denied');

      if (content.storage?.cloudflareKey) {
        await this.cloudflareService.deleteFromR2(content.type as any, content.storage.cloudflareKey);
      }
      const streamId = content.storage?.cloudflareStreamId || content.metadata?.cloudflareStreamId;
      if (streamId) {
        await this.cloudflareService.deleteFromStream(streamId);
      }

      await this.contentService.delete(uploadId);
      this.logger.debug(`Upload cancelled: ${uploadId}`);
    } catch (error) {
      if (error instanceof UploadException || error instanceof ForbiddenException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to cancel: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      throw new UploadException('UPLOAD_CANCELLATION_FAILED', 500, 'Failed to cancel upload', { originalError: errorMessage });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────────────────────────────────
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp4:  'video/mp4',
      mov:  'video/quicktime',
      avi:  'video/x-msvideo',
      mp3:  'audio/mpeg',
      wav:  'audio/wav',
      m4a:  'audio/mp4',
      jpg:  'image/jpeg',
      jpeg: 'image/jpeg',
      png:  'image/png',
      pdf:  'application/pdf',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private getStreamThumbnail(streamId?: string): string | undefined {
    if (!streamId) return undefined;
    const customerCode = this.configService.get<string>('CLOUDFLARE_STREAM_CUSTOMER_CODE')
      || '7a488e9b77e6c8630472a07003c7d8e4';
    return `https://customer-${customerCode}.cloudflarestream.com/${streamId}/thumbnails/thumbnail.jpg`;
  }
}