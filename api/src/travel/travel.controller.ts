import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Res, UseGuards, UseInterceptors, Logger,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../user-and-monetization/auth/guards/jwt-auth.guard';
import { TravelService } from './travel.service';
import { CloudflareService } from '../modules/cloudflare/cloudflare.service';

/**
 * Location: api/src/travel/travel.controller.ts
 *
 * Public routes (no auth):
 *   GET  /travel/hero
 *   GET  /travel/packages
 *   GET  /travel/packages/:id
 *   GET  /travel/testimonials
 *   POST /travel/inquiries
 *   POST /travel/inquiries/custom
 *   POST /travel/testimonials
 *   POST /travel/subscribe
 *   GET  /travel/note
 *
 * Admin routes (JWT required):
 *   POST /travel/hero/upload
 *   PUT  /travel/hero
 *   POST /travel/packages/upload
 *   POST /travel/packages
 *   PATCH /travel/packages/:id
 *   DELETE /travel/packages/:id
 *   GET  /travel/inquiries
 *   PATCH /travel/testimonials/:id/approve
 *   PATCH /travel/testimonials/:id/reject
 *   PUT  /travel/note
 */

@Controller('travel')
export class TravelController {
  private readonly logger = new Logger(TravelController.name);

  constructor(
    private readonly travelService: TravelService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  // ── HERO ─────────────────────────────────────────────────────────────────────

  @Get('hero')
  async getHero(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    return this.travelService.getHero();
  }

  @Post('hero/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: require('multer').memoryStorage(),
  }))
  async uploadHeroImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    // Ensure we have a buffer
    if (!file.buffer || file.buffer.length === 0) {
      this.logger.error('File buffer missing or empty', {
        originalname: file.originalname,
        hasBuffer: !!file.buffer,
        bufferLength: file.buffer?.length || 0,
      });
      throw new BadRequestException('File buffer missing or empty - storage not configured correctly');
    }
    
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/'))
      throw new BadRequestException('Only image or video files allowed');
    if (file.size > 100 * 1024 * 1024) throw new BadRequestException('Max 100MB');
    
    const safeName = file.originalname.replace(/\s+/g, '-');
    const path     = `travel/hero/${Date.now()}-${safeName}`;
    
    this.logger.log(`Uploading hero image: ${path} (${file.buffer.length} bytes)`);
    
    const url      = await this.cloudflareService
      .uploadImageToR2('travel', path, file.buffer, file.mimetype)
      .catch(e => { 
        this.logger.error(`Upload error: ${e.message}`, e.stack);
        throw new BadRequestException(`Upload failed: ${e.message}`);
      });
    return { success: true, url, path };
  }

  @Put('hero')
  @UseGuards(JwtAuthGuard)
  async updateHero(@Body() data: { imageUrl: string; ctaLabel?: string }) {
    if (typeof (this.travelService as any).updateHero === 'function') {
      return (this.travelService as any).updateHero(data);
    }
    return { success: true, ...data };
  }

  // ── PACKAGES ────────────────────────────────────────────────────────────────

  @Get('packages')
  async getPackages(@Query('status') status = 'active', @Query('continent') continent?: string) {
    const packages = await this.travelService.getPackages({ status, continent });
    return { data: packages ?? [], total: (packages ?? []).length };
  }

  @Get('packages/:id')
  async getPackage(@Param('id') id: string) {
    return this.travelService.getPackageById(id);
  }

  @Post('packages/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: require('multer').memoryStorage(),
  }))
  async uploadPackageImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    // Ensure we have a buffer
    if (!file.buffer || file.buffer.length === 0) {
      this.logger.error('Package image buffer missing or empty', {
        originalname: file.originalname,
        hasBuffer: !!file.buffer,
        bufferLength: file.buffer?.length || 0,
      });
      throw new BadRequestException('File buffer missing or empty - storage not configured correctly');
    }
    
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Images only');
    if (file.size > 30 * 1024 * 1024) throw new BadRequestException('Max 30MB');
    
    const safeName = file.originalname.replace(/\s+/g, '-');
    const path     = `travel/packages/${Date.now()}-${safeName}`;
    
    this.logger.log(`Uploading package image: ${path} (${file.buffer.length} bytes)`);
    
    const url      = await this.cloudflareService
      .uploadImageToR2('travel', path, file.buffer, file.mimetype)
      .catch(e => { 
        this.logger.error(`Upload error: ${e.message}`, e.stack);
        throw new BadRequestException(`Upload failed: ${e.message}`);
      });
    return { success: true, url, path };
  }

  @Post('packages')
  @UseGuards(JwtAuthGuard)
  async createPackage(@Body() body: Record<string, any>) {
    return this.travelService.createPackage(body);
  }

  @Patch('packages/:id')
  @UseGuards(JwtAuthGuard)
  async updatePackage(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.travelService.updatePackage(id, body);
  }

  @Delete('packages/:id')
  @UseGuards(JwtAuthGuard)
  async deletePackage(@Param('id') id: string) {
    return this.travelService.deletePackage(id);
  }

  // ── INQUIRIES ───────────────────────────────────────────────────────────────

  @Post('inquiries')
  async submitInquiry(@Body() body: Record<string, any>) {
    return this.travelService.createInquiry(body);
  }

  @Post('inquiries/custom')
  async submitCustomInquiry(@Body() body: Record<string, any>) {
    return this.travelService.createCustomInquiry(body);
  }

  @Get('inquiries')
  @UseGuards(JwtAuthGuard)
  async getInquiries(@Query('type') type?: string) {
    return this.travelService.getInquiries(type);
  }

  // ── TESTIMONIALS ────────────────────────────────────────────────────────────

  @Get('testimonials')
  async getTestimonials(
    @Query('status') status = 'approved',
    @Query('featured') featured?: string,
  ) {
    const items = await this.travelService.getTestimonials({ status, featured: featured === 'true' });
    return { data: items ?? [], total: (items ?? []).length };
  }

  @Post('testimonials')
  async submitTestimonial(@Body() body: Record<string, any>) {
    return this.travelService.createTestimonial({ ...body, status: 'pending' });
  }

  @Patch('testimonials/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveTestimonial(@Param('id') id: string) {
    return this.travelService.updateTestimonial(id, { status: 'approved' });
  }

  @Patch('testimonials/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectTestimonial(@Param('id') id: string) {
    return this.travelService.updateTestimonial(id, { status: 'rejected' });
  }

  // ── NOTE FROM LEVI ──────────────────────────────────────────────────────────

  @Get('note')
  async getNote() {
    return this.travelService.getNote();
  }

  @Put('note')
  @UseGuards(JwtAuthGuard)
  async updateNote(@Body() body: { body: string; imageUrl?: string }) {
    return this.travelService.updateNote(body);
  }

  // ── SUBSCRIBE ───────────────────────────────────────────────────────────────

  @Post('subscribe')
  async subscribe(@Body() body: { email: string; firstName?: string; name?: string }) {
    return this.travelService.subscribe({
      email: body.email,
      firstName: body.firstName ?? body.name ?? '',
    });
  }
}