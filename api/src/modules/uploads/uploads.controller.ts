// api/src/modules/uploads/uploads.controller.ts
import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Logger,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  Query,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { UploadsService }        from './uploads.service';
import { ContentService }        from '../content/content.service';
import { CloudflareR2Service }   from '../cloudflare/cloudflare-r2.service';
import { CloudflareService }     from '../cloudflare/cloudflare.service';
import { CloudflareHostsR2Service, HostAssetFolder } from '../cloudflare/cloudflare-hosts-r2.service';
import { UploadJob, UploadJobStatus } from './schemas/upload-job.schema';

import { CreateDraftDto }     from './dtos/create-draft.dto';
import { GetPresignedUrlDto } from './dtos/get-presigned-url.dto';
import { CompleteUploadDto }  from './dtos/complete-upload.dto';
import { JwtAuthGuard }       from '../../user-and-monetization/auth/guards/jwt-auth.guard';
import { RolesGuard }         from '../../user-and-monetization/auth/guards/roles.guard';
import { Roles }              from '../../user-and-monetization/auth/decorators/roles.decorator';

// ─── Types ───────────────────────────────────────────────────────────────────
type ImageFolder = 'hosts' | 'products' | 'heroes' | 'collections' | 'content';

// ─── Thresholds ───────────────────────────────────────────────────────────────
// Files ≤ 50 MB are buffered through NestJS (fast path).
// Files > 50 MB MUST use /multipart/* — NestJS never sees the bytes.
const SMALL_FILE_LIMIT_BYTES = 50 * 1024 * 1024;  // 50 MB

// Each chunk the browser uploads to R2 is 50 MB.
// R2 minimum part size is 5 MB (except the last part).
// 50 MB chunks = good parallelism + manageable retry cost.
const CHUNK_SIZE_BYTES = 50 * 1024 * 1024;         // 50 MB

// ─── Bucket map ───────────────────────────────────────────────────────────────
const MEDIA_BUCKET_MAP: Record<string, string> = {
  podcast:    'podcast',
  music:      'music',
  movie:      'movie',
  tv_episode: 'tv_episode',
  stage_play: 'stageplay',
  stageplay:  'stageplay',
  reelfilm:   'reelfilm',
  minisode:   'minisode',
  miniseries: 'minisode',
};

// ─── Multer configs ───────────────────────────────────────────────────────────
const IMAGE_UPLOAD_OPTIONS = {
  storage: memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new BadRequestException(`File type "${file.mimetype}" not allowed. Use JPEG, PNG, WebP or GIF.`), false);
  },
};

const MEDIA_UPLOAD_OPTIONS = {
  storage: memoryStorage(),
  limits:  { fileSize: SMALL_FILE_LIMIT_BYTES },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = [
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
      'video/webm', 'video/mpeg', 'video/ogg',
      'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac',
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new BadRequestException(`File type "${file.mimetype}" not allowed for media upload.`), false);
  },
};

// ─────────────────────────────────────────────────────────────────────────────

@Controller('api/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(
    @InjectModel(UploadJob.name) private uploadJobModel: Model<UploadJob>,
    private uploadsService:    UploadsService,
    private cloudflareR2:      CloudflareR2Service,
    private contentService:    ContentService,
    private cloudflareService: CloudflareService,
    private hostsR2:           CloudflareHostsR2Service,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE UPLOAD — POST /api/uploads/image
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('image')
  @Roles('admin', 'superadmin')
  @UseInterceptors(FileInterceptor('file', IMAGE_UPLOAD_OPTIONS))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder')      folderQuery?:      string,
    @Query('slug')        slugQuery?:        string,
    @Query('assetType')   assetTypeQuery?:   string,
    @Query('contentType') contentTypeQuery?: string,
    @Body('folder')       folderBody?:       string,
    @Body('slug')         slugBody?:         string,
    @Body('assetType')    assetTypeBody?:    string,
    @Request()            req?:              any,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const folder      = folderQuery    || folderBody    || 'hosts';
    const slug        = slugQuery      || slugBody;
    const assetType   = assetTypeQuery || assetTypeBody || 'profile';
    const contentType = contentTypeQuery;

    this.logger.log(
      `[${req?.user?.userId ?? 'unknown'}] Uploading image — folder="${folder}" slug="${slug ?? 'n/a'}" assetType="${assetType}": ${file.originalname} (${Math.round(file.size / 1024)} KB)`,
    );

    if (folder === 'hosts') {
      const hostSlug = slug || `host-${Date.now()}`;
      const VALID_ASSET_TYPES: HostAssetFolder[] = ['profile', 'podcasts', 'tv-shows', 'movies', 'documentaries', 'stage-plays', 'shorts', 'shop'];
      const safeAssetType: HostAssetFolder = VALID_ASSET_TYPES.includes(assetType as HostAssetFolder) ? (assetType as HostAssetFolder) : 'profile';
      const result = await this.hostsR2.uploadHostImage(hostSlug, safeAssetType, file.buffer, file.originalname, file.mimetype);
      this.logger.log(`✅ Host image uploaded: ${result.url}`);
      return { url: result.url, key: result.key };
    }

    if (folder === 'content') {
      const VALID_CONTENT_BUCKETS = ['movie', 'tv_episode', 'stageplay', 'podcast', 'reelfilm', 'minisode', 'music'];
      const bucketKey = contentType && VALID_CONTENT_BUCKETS.includes(contentType) ? contentType : 'movie';
      const extension = file.originalname.split('.').pop() ?? 'jpg';
      const safeSlug  = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60) : 'content';
      const filename  = `${assetType}-${safeSlug}-${Date.now()}.${extension}`;
      const url = await this.cloudflareService.uploadImageToR2(bucketKey as any, filename, file.buffer, file.mimetype);
      this.logger.log(`✅ Content image uploaded: ${url}`);
      return { url };
    }

    const VALID_OTHER_FOLDERS: ImageFolder[] = ['products', 'heroes', 'collections'];
    const safeFolder = VALID_OTHER_FOLDERS.includes(folder as ImageFolder) ? (folder as ImageFolder) : 'products';
    const extension  = file.originalname.split('.').pop() ?? 'jpg';
    const filename   = `${safeFolder}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const url = await this.cloudflareService.uploadImageToR2(safeFolder as any, filename, file.buffer, file.mimetype);
    this.logger.log(`✅ Image uploaded: ${url}`);
    return { url };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SMALL MEDIA UPLOAD (≤ 50 MB) — POST /api/uploads/media
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('media')
  @Roles('admin', 'superadmin')
  @UseInterceptors(FileInterceptor('file', MEDIA_UPLOAD_OPTIONS))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Query('slug')        slug:        string = 'untitled',
    @Query('contentType') contentType: string = 'content',
    @Request() req,
  ) {
    if (!file) throw new BadRequestException('No media file provided');

    if (file.size > SMALL_FILE_LIMIT_BYTES) {
      throw new BadRequestException(
        `File is ${(file.size / 1024 / 1024).toFixed(0)} MB. ` +
        `Files over 50 MB must use the multipart route (/api/uploads/multipart/init).`,
      );
    }

    this.logger.log(
      `[${req.user.userId}] Media upload: ${file.originalname} (${file.mimetype}, ${(file.size / 1024 / 1024).toFixed(1)} MB)`,
    );

    const bucketKey = MEDIA_BUCKET_MAP[contentType] ?? 'podcast';
    const safeSlug  = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 80);
    const ext       = file.originalname.split('.').pop()?.toLowerCase() ?? 'mp4';
    const r2Key     = `${safeSlug}-${Date.now()}.${ext}`;

    this.logger.log(`[Media] Routing to bucket: ${bucketKey}, key: ${r2Key}`);

    await this.cloudflareR2.uploadObject(bucketKey as any, r2Key, file.buffer, file.mimetype);

    const publicUrl = this.cloudflareR2.getPublicUrl(bucketKey as any, r2Key);
    this.logger.log(`✅ Media uploaded to R2: ${publicUrl}`);

    return { success: true, url: publicUrl, key: r2Key, size: file.size, mimetype: file.mimetype };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ███████████████████  MULTIPART UPLOAD  ████████████████████████████████████
  //
  // For any file — the frontend always prefers this for anything > 50 MB.
  //
  //   POST   /multipart/init       1. Start session, get jobId + totalParts
  //   POST   /multipart/part-url   2. Get presigned PUT URL for one chunk
  //                                   (repeat; browser uploads chunks to R2)
  //   POST   /multipart/complete   3. Assemble parts, get publicUrl
  //   DELETE /multipart/abort      Anytime: cancel + free R2 storage
  //   GET    /multipart/:jobId     Anytime: check status, resume after crash
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── 1. Init ───────────────────────────────────────────────────────────────

  @Post('multipart/init')
  @Roles('admin', 'superadmin')
  async initMultipartUpload(
    @Body('contentType') contentType: string,
    @Body('slug')        slug:        string = 'untitled',
    @Body('fileName')    fileName:    string,
    @Body('fileSize')    fileSize:    number,
    @Body('mimeType')    mimeType:    string = 'video/mp4',
    @Request() req,
  ) {
    if (!fileName)              throw new BadRequestException('fileName is required');
    if (!fileSize || fileSize <= 0) throw new BadRequestException('fileSize must be a positive number');
    if (!contentType)           throw new BadRequestException('contentType is required');

    const bucketKey = MEDIA_BUCKET_MAP[contentType];
    if (!bucketKey) throw new BadRequestException(`Unknown contentType: ${contentType}`);

    const safeSlug   = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 80);
    const ext        = fileName.split('.').pop()?.toLowerCase() ?? 'mp4';
    const r2Key      = `${safeSlug}-${Date.now()}.${ext}`;
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE_BYTES);

    this.logger.log(
      `[${req.user.userId}] Multipart init: ${fileName} (${(fileSize / 1024 / 1024).toFixed(1)} MB, ${totalParts} parts) → ${bucketKey}/${r2Key}`,
    );

    const r2UploadId = await this.cloudflareR2.createMultipartUpload(bucketKey as any, r2Key, mimeType);

    const job = await this.uploadJobModel.create({
      r2UploadId,
      r2Key,
      bucket:     this.cloudflareR2.getBucketForContentType(bucketKey as any),
      bucketKey,
      fileName,
      fileSize,
      mimeType,
      totalParts,
      completedParts: [],
      status:     UploadJobStatus.INITIATED,
      createdBy:  req.user.userId,
    });

    this.logger.log(`✅ Upload job created: ${job._id} — R2 UploadId: ${r2UploadId}`);

    return {
      success:   true,
      jobId:     (job._id as any).toString(),
      r2UploadId,
      r2Key,
      bucketKey,
      totalParts,
      chunkSize: CHUNK_SIZE_BYTES,
      publicUrl: this.cloudflareR2.getPublicUrl(bucketKey as any, r2Key),
    };
  }

  // ─── 2. Presigned URL for one part ────────────────────────────────────────

  @Post('multipart/part-url')
  @Roles('admin', 'superadmin')
  async getPartUrl(
    @Body('jobId')      jobId:      string,
    @Body('partNumber') partNumber: number,
    @Request() req,
  ) {
    if (!jobId)                    throw new BadRequestException('jobId is required');
    if (!partNumber || partNumber < 1) throw new BadRequestException('partNumber must be ≥ 1');

    const job = await this.uploadJobModel.findById(jobId);
    if (!job)                                       throw new NotFoundException(`Upload job not found: ${jobId}`);
    if (job.createdBy !== req.user.userId)          throw new ForbiddenException('Not your upload job');
    if (job.status === UploadJobStatus.ABORTED)     throw new BadRequestException('Upload job was aborted');
    if (job.status === UploadJobStatus.COMPLETE)    throw new BadRequestException('Upload already complete');
    if (partNumber > job.totalParts)                throw new BadRequestException(`partNumber ${partNumber} exceeds totalParts ${job.totalParts}`);

    // Transition to uploading on first part request
    if (job.status === UploadJobStatus.INITIATED) {
      await this.uploadJobModel.findByIdAndUpdate(jobId, { status: UploadJobStatus.UPLOADING });
    }

    const uploadUrl = await this.cloudflareR2.getPresignedPartUrl(
      job.bucketKey as any,
      job.r2Key,
      job.r2UploadId,
      partNumber,
    );

    return { success: true, uploadUrl, partNumber };
  }

  // ─── 3. Complete — assemble all parts into one object ─────────────────────

  @Post('multipart/complete')
  @Roles('admin', 'superadmin')
  async completeMultipartUpload(
    @Body('jobId') jobId: string,
    @Body('parts') parts: { partNumber: number; etag: string }[],
    @Request() req,
  ) {
    if (!jobId)        throw new BadRequestException('jobId is required');
    if (!parts?.length) throw new BadRequestException('parts array is required');

    const job = await this.uploadJobModel.findById(jobId);
    if (!job)                                    throw new NotFoundException(`Upload job not found: ${jobId}`);
    if (job.createdBy !== req.user.userId)        throw new ForbiddenException('Not your upload job');
    if (job.status === UploadJobStatus.ABORTED)  throw new BadRequestException('Upload job was aborted');

    // Idempotent — safe to call twice after a network error on the complete request
    if (job.status === UploadJobStatus.COMPLETE) {
      return { success: true, publicUrl: job.publicUrl };
    }

    this.logger.log(`[${req.user.userId}] Completing multipart: ${jobId} (${parts.length} parts)`);

    await this.uploadJobModel.findByIdAndUpdate(jobId, { status: UploadJobStatus.COMPLETING });

    try {
      await this.cloudflareR2.completeMultipartUpload(
        job.bucketKey as any,
        job.r2Key,
        job.r2UploadId,
        parts,
      );
    } catch (err: any) {
      await this.uploadJobModel.findByIdAndUpdate(jobId, {
        status:        UploadJobStatus.FAILED,
        failureReason: err.message,
      });
      throw err;
    }

    const publicUrl = this.cloudflareR2.getPublicUrl(job.bucketKey as any, job.r2Key);

    await this.uploadJobModel.findByIdAndUpdate(jobId, {
      status:         UploadJobStatus.COMPLETE,
      completedParts: parts,
      publicUrl,
      // Extend TTL to 7 days for audit trail
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    this.logger.log(`✅ Multipart complete: ${job.bucketKey}/${job.r2Key} → ${publicUrl}`);

    return {
      success:  true,
      publicUrl,
      key:      job.r2Key,
      size:     job.fileSize,
      mimetype: job.mimeType,
    };
  }

  // ─── Abort ─────────────────────────────────────────────────────────────────

  @Delete('multipart/abort')
  @Roles('admin', 'superadmin')
  async abortMultipartUpload(
    @Body('jobId') jobId: string,
    @Request() req,
  ) {
    if (!jobId) throw new BadRequestException('jobId is required');

    const job = await this.uploadJobModel.findById(jobId);
    if (!job)                            throw new NotFoundException(`Upload job not found: ${jobId}`);
    if (job.createdBy !== req.user.userId) throw new ForbiddenException('Not your upload job');

    await this.cloudflareR2.abortMultipartUpload(job.bucketKey as any, job.r2Key, job.r2UploadId);
    await this.uploadJobModel.findByIdAndUpdate(jobId, { status: UploadJobStatus.ABORTED });

    this.logger.log(`🗑️  Multipart aborted: ${jobId}`);
    return { success: true };
  }

  // ─── Status / resume ───────────────────────────────────────────────────────

  @Get('multipart/:jobId')
  @Roles('admin', 'superadmin')
  async getMultipartJobStatus(
    @Param('jobId') jobId: string,
    @Request() req,
  ) {
    const job = await this.uploadJobModel.findById(jobId);
    if (!job)                            throw new NotFoundException(`Upload job not found: ${jobId}`);
    if (job.createdBy !== req.user.userId) throw new ForbiddenException('Not your upload job');

    return {
      success:        true,
      jobId:          (job._id as any).toString(),
      status:         job.status,
      fileName:       job.fileName,
      fileSize:       job.fileSize,
      totalParts:     job.totalParts,
      completedParts: job.completedParts.length,
      publicUrl:      job.publicUrl || this.cloudflareR2.getPublicUrl(job.bucketKey as any, job.r2Key),
      r2UploadId:     job.r2UploadId,
      r2Key:          job.r2Key,
      bucketKey:      job.bucketKey,
      chunkSize:      CHUNK_SIZE_BYTES,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAFT WORKFLOW
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('draft')
  @Roles('admin', 'superadmin')
  async createDraft(@Body() createDraftDto: CreateDraftDto, @Request() req) {
    this.logger.log(`[${req.user.userId}] Creating draft: ${createDraftDto.mediaType} - ${createDraftDto.title}`);
    const draft = await this.uploadsService.createDraft(createDraftDto, req.user.userId);
    return { success: true, data: draft, message: 'Upload draft created successfully' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAM WEBHOOK
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('webhook/stream')
  @HttpCode(200)
  async handleStreamWebhook(@Body() payload: any): Promise<{ success: boolean }> {
    try {
      this.logger.log(`📥 Stream webhook: ${payload.status}`);
      const { uid, status, duration, size, thumbnail } = payload;
      if (!uid) { this.logger.warn('⚠️ Webhook missing uid'); return { success: true }; }

      const content = await this.contentService.findAll({
        $or: [{ 'storage.cloudflareStreamId': uid }, { 'metadata.cloudflareStreamId': uid }],
      });
      if (!content?.length) { this.logger.warn(`⚠️ No content for Stream ID: ${uid}`); return { success: true }; }

      const contentItem = content[0];
      const contentId   = (contentItem._id as any).toString();

      if (status === 'ready') {
        await this.contentService.markAsReady(contentId, {
          originalUrl: `https://customer-7a488e9b77e6c8630472a07003c7d8e4.cloudflarestream.com/${uid}/manifest/video.m3u8`,
          cloudflareStreamId: uid,
          size:      size      || contentItem.storage?.size     || 0,
          mimeType:  'video/mp4',
          provider:  'stream'  as any,
          duration:  duration  || contentItem.storage?.duration || 0,
          thumbnail: thumbnail || `https://customer-7a488e9b77e6c8630472a07003c7d8e4.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`,
        });
        this.logger.log(`🎉 Content marked READY: ${contentId}`);
      } else if (status === 'error') {
        await this.contentService.update(contentId, { status: 'failed' } as any);
      } else if (status === 'queued' || status === 'inprogress') {
        await this.contentService.update(contentId, { status: 'processing' } as any);
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`, error.stack);
      return { success: false };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PER-UPLOAD ROUTES (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  @Post(':id/presigned-url')
  @Roles('admin', 'superadmin')
  async getPresignedUrl(@Param('id') uploadId: string, @Body() dto: GetPresignedUrlDto, @Request() req) {
    const presignedUrl = await this.uploadsService.getPresignedUrl(uploadId, dto, req.user.userId);
    return { success: true, data: presignedUrl, message: 'Presigned URL generated successfully' };
  }

  @Post(':id/stream-direct')
  @Roles('admin', 'superadmin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToStream(@Param('id') uploadId: string, @UploadedFile() file: any, @Request() req) {
    if (!file) throw new BadRequestException('No file provided');
    const result = await this.uploadsService.uploadToStream(uploadId, file, req.user.userId);
    return { success: true, data: result, message: 'File uploaded to Cloudflare Stream successfully' };
  }

  @Get(':id/stream-status')
  @Roles('admin', 'superadmin')
  async getStreamStatus(@Param('id') uploadId: string, @Request() req) {
    const status = await this.uploadsService.getStreamProcessingStatus(uploadId, req.user.userId);
    return { success: true, data: status };
  }

  @Patch(':id/complete')
  @Roles('admin', 'superadmin')
  async completeUpload(@Param('id') uploadId: string, @Body() dto: CompleteUploadDto, @Request() req) {
    const result = await this.uploadsService.completeUpload(uploadId, dto, req.user.userId);
    return { success: true, data: result, message: 'Upload completed and content published successfully' };
  }

  @Get(':id/status')
  @Roles('admin', 'superadmin')
  async getStatus(@Param('id') uploadId: string, @Request() req) {
    const status = await this.uploadsService.getUploadStatus(uploadId, req.user.userId);
    return { success: true, data: status };
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  async cancelUpload(@Param('id') uploadId: string, @Request() req) {
    await this.uploadsService.cancelUpload(uploadId, req.user.userId);
    return { success: true, message: 'Upload cancelled and cleaned up successfully' };
  }

  @Post(':uploadId/images/:imageType')
  @Roles('admin', 'superadmin')
  @UseInterceptors(FileInterceptor('image', IMAGE_UPLOAD_OPTIONS))
  async uploadContentImage(
    @Param('uploadId')  uploadId:  string,
    @Param('imageType') imageType: 'poster' | 'backdrop' | 'logo',
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    try {
      const userId  = req.user.userId;
      const content = await this.contentService.findById(uploadId);
      if (content.uploaderId.toString() !== userId) throw new BadRequestException('Permission denied');
      if (!file) throw new BadRequestException('No image file provided');
      const ext      = file.originalname.split('.').pop() ?? 'jpg';
      const filename = `${imageType}-${Date.now()}.${ext}`;
      const imageUrl = await this.cloudflareService.uploadImageToR2(content.type as any, filename, file.buffer, file.mimetype);
      const updatedImages = { ...(content.images || {}), [imageType]: imageUrl };
      await this.contentService.update(uploadId, { images: updatedImages } as any);
      this.logger.log(`✅ ${imageType} uploaded: ${imageUrl}`);
      return { success: true, data: { imageUrl, imageType }, message: `${imageType} uploaded successfully` };
    } catch (error) {
      throw new BadRequestException(`Failed to upload ${imageType}: ${error.message}`);
    }
  }

  @Post(':uploadId/trailer')
  @Roles('admin', 'superadmin')
  @UseInterceptors(FileInterceptor('trailer'))
  async uploadTrailer(@Param('uploadId') uploadId: string, @UploadedFile() file: any, @Request() req) {
    try {
      const userId  = req.user.userId;
      const content = await this.contentService.findById(uploadId);
      if (content.uploaderId.toString() !== userId) throw new BadRequestException('Permission denied');
      if (!file || !file.mimetype.startsWith('video/')) throw new BadRequestException('Only video files allowed for trailers');
      if (file.size > 500 * 1024 * 1024) throw new BadRequestException('Trailer must be under 500 MB');
      const streamResult = await this.cloudflareService.uploadTrailerToStream(file);
      await this.contentService.update(uploadId, {
        trailer: { cloudflareStreamId: streamResult.streamId, url: streamResult.playbackUrl, duration: streamResult.duration },
      } as any);
      this.logger.log(`✅ Trailer uploaded: ${streamResult.streamId}`);
      return { success: true, data: { trailerStreamId: streamResult.streamId, trailerUrl: streamResult.playbackUrl }, message: 'Trailer uploaded successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to upload trailer: ${error.message}`);
    }
  }
}
