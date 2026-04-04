// api/src/linear-tv/linear-tv.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Logger,
} from '@nestjs/common';
import { LinearTvService } from './linear-tv.service';
import { JwtAuthGuard } from '../user-and-monetization/auth/guards/jwt-auth.guard';

/**
 * Location: api/src/linear-tv/linear-tv.controller.ts
 *
 * Public routes:
 *   GET  /linear-tv/now-playing
 *   GET  /linear-tv/schedule/today
 *
 * Admin routes (JWT required):
 *   GET  /linear-tv/blocks              ← all blocks for admin dashboard
 *   POST /linear-tv/blocks/presign      ← get R2 presigned URL for video upload
 *   POST /linear-tv/blocks              ← create block after upload
 *   PATCH /linear-tv/blocks/:id         ← update block (metadata, times, video)
 *   PATCH /linear-tv/blocks/:id/toggle  ← toggle active/inactive
 *   DELETE /linear-tv/blocks/:id        ← delete block + R2 video
 *   POST /linear-tv/seed                ← seed default schedule
 */
@Controller('linear-tv')
export class LinearTvController {
  private readonly logger = new Logger(LinearTvController.name);

  constructor(private readonly linearTvService: LinearTvService) {}

  // ── PUBLIC ────────────────────────────────────────────────────

  @Get('now-playing')
  async getNowPlaying() {
    return this.linearTvService.getCurrentBlock();
  }

  @Get('schedule/today')
  async getTodaySchedule() {
    return this.linearTvService.getTodaySchedule();
  }

  // ── ADMIN ─────────────────────────────────────────────────────

  @Get('blocks')
  @UseGuards(JwtAuthGuard)
  async getAllBlocks() {
    return this.linearTvService.getAllBlocks();
  }

  /**
   * Step 1 of video upload:
   * Returns a presigned PUT URL so the browser can upload directly to R2.
   * Body: { fileName: 'coffee-morning.mp4' }
   * Response: { uploadUrl, cloudflareKey, publicUrl, expiresIn }
   */
  @Post('blocks/presign')
  @UseGuards(JwtAuthGuard)
  async getPresignedUrl(@Body() body: { fileName: string }) {
    this.logger.log(`Presign request for: ${body.fileName}`);
    return this.linearTvService.getVideoUploadUrl(body.fileName);
  }

  /**
   * Step 2 of video upload (after browser PUT to R2 succeeds):
   * Create the block record in MongoDB.
   */
  @Post('blocks')
  @UseGuards(JwtAuthGuard)
  async createBlock(@Body() body: {
    name:        string;
    startTime:   string;
    endTime:     string;
    videoUrl?:   string;
    videoKey?:   string;
    daysOfWeek?: number[];
    isActive?:   boolean;
    priority?:   number;
    metadata?:   { title?: string; description?: string; genre?: string; thumbnail?: string };
  }) {
    this.logger.log(`Creating block: ${body.name} (${body.startTime}–${body.endTime})`);
    return this.linearTvService.createBlock(body);
  }

  @Patch('blocks/:id')
  @UseGuards(JwtAuthGuard)
  async updateBlock(
    @Param('id') id: string,
    @Body() body: Partial<{
      name:       string;
      startTime:  string;
      endTime:    string;
      videoUrl:   string;
      videoKey:   string;
      daysOfWeek: number[];
      isActive:   boolean;
      priority:   number;
      metadata:   { title?: string; description?: string; genre?: string; thumbnail?: string };
    }>,
  ) {
    this.logger.log(`Updating block: ${id}`);
    return this.linearTvService.updateBlock(id, body);
  }

  @Patch('blocks/:id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleBlock(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.linearTvService.toggleBlock(id, body.isActive);
  }

  @Delete('blocks/:id')
  @UseGuards(JwtAuthGuard)
  async deleteBlock(@Param('id') id: string) {
    this.logger.log(`Deleting block: ${id}`);
    return this.linearTvService.deleteBlock(id);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard)
  async seedSchedule() {
    return this.linearTvService.seedDefaultSchedule();
  }
}