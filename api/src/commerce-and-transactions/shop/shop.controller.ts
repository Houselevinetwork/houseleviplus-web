import {
  Controller, Get, Post, Put, Body, Query,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';
import { ShopService } from './shop.service';
import { CloudflareService } from '../../modules/cloudflare/cloudflare.service';

/**
 * Location: api/src/commerce-and-transactions/shop/shop.controller.ts
 *
 * All shop page config routes.
 * New in this version: editorial banner GET/PUT/upload endpoints.
 *
 * Routes (all prefixed /api/shop):
 *   GET  /hero
 *   POST /hero/upload         (admin JWT)
 *   PUT  /hero                (admin JWT)
 *   GET  /announcements
 *   PUT  /announcements       (admin JWT)
 *   GET  /reviews
 *   GET  /editorial           ← NEW
 *   POST /editorial/upload    ← NEW (admin JWT)
 *   PUT  /editorial           ← NEW (admin JWT)
 *   POST /products/upload     (admin JWT)
 *   POST /collections/upload  (admin JWT)
 */
@Controller('api/shop')
export class ShopController {
  constructor(
    private shopService: ShopService,
    private cloudflareService: CloudflareService,
  ) {}

  // ── HERO ──────────────────────────────────────────────────────

  @Get('hero')
  async getHero() { return this.shopService.getHero(); }

  @Post('hero/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadHeroImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/'))
      throw new BadRequestException('Only image or video files are allowed');
    if (file.size > 100 * 1024 * 1024) throw new BadRequestException('Max 100MB');
    const safeName = file.originalname.replace(/\s+/g, '-');
    const path     = `heroes/${Date.now()}-${safeName}`;
    const url      = await this.cloudflareService.uploadImageToR2('shop', path, file.buffer, file.mimetype).catch(e => { throw new BadRequestException(`Upload failed: ${e.message}`); });
    return { success: true, url, fileName: file.originalname, path };
  }

  @Put('hero')
  @UseGuards(JwtAuthGuard)
  async updateHero(@Body() data: { url: string; type: 'image'|'video'; headline: string }) {
    return this.shopService.updateHero(data);
  }

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────

  @Get('announcements')
  async getAnnouncements() { return this.shopService.getAnnouncements(); }

  @Put('announcements')
  @UseGuards(JwtAuthGuard)
  async updateAnnouncements(@Body() data: any) {
    const list = Array.isArray(data) ? data : (data.announcements ?? []);
    return this.shopService.updateAnnouncements(list);
  }

  // ── REVIEWS ───────────────────────────────────────────────────

  @Get('reviews')
  async getReviews(@Query('limit') limit = '3') {
    return this.shopService.getReviews(Math.min(parseInt(limit) || 3, 100));
  }

  // ── EDITORIAL BANNER ─────────────────────────────────────────
  // The "OLD MONEY · HOUSELEVI+ OFFICIAL" strip on the web shop page.
  // ShopService stores this in its config document (same doc as hero/announcements).

  @Get('editorial')
  async getEditorial() {
    if (typeof (this.shopService as any).getEditorial === 'function') {
      return (this.shopService as any).getEditorial();
    }
    return { url: '', headline: 'OLD MONEY HOUSELEVI+ OFFICIAL' };
  }

  @Post('editorial/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadEditorialImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Images only');
    if (file.size > 30 * 1024 * 1024) throw new BadRequestException('Max 30MB');
    const safeName = file.originalname.replace(/\s+/g, '-');
    const path     = `editorial/${Date.now()}-${safeName}`;
    const url      = await this.cloudflareService.uploadImageToR2('shop', path, file.buffer, file.mimetype).catch(e => { throw new BadRequestException(`Upload failed: ${e.message}`); });
    return { success: true, url, fileName: file.originalname, path };
  }

  @Put('editorial')
  @UseGuards(JwtAuthGuard)
  async updateEditorial(@Body() data: { url: string; headline: string }) {
    if (typeof (this.shopService as any).updateEditorial === 'function') {
      return (this.shopService as any).updateEditorial(data);
    }
    return { success: true, ...data };
  }

  // ── PRODUCTS IMAGE UPLOAD ─────────────────────────────────────

  @Post('products/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Images only');
    if (file.size > 20 * 1024 * 1024) throw new BadRequestException('Max 20MB');
    const safeName = file.originalname.replace(/\s+/g, '-');
    const path     = `products/${Date.now()}-${safeName}`;
    const url      = await this.cloudflareService.uploadImageToR2('shop', path, file.buffer, file.mimetype).catch(e => { throw new BadRequestException(`Upload failed: ${e.message}`); });
    return { success: true, url, fileName: file.originalname, path };
  }

  // ── COLLECTIONS IMAGE UPLOAD ──────────────────────────────────

  @Post('collections/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCollectionImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Images only');
    if (file.size > 20 * 1024 * 1024) throw new BadRequestException('Max 20MB');
    const safeName = file.originalname.replace(/\s+/g, '-');
    const path     = `collections/${Date.now()}-${safeName}`;
    const url      = await this.cloudflareService.uploadImageToR2('shop', path, file.buffer, file.mimetype).catch(e => { throw new BadRequestException(`Upload failed: ${e.message}`); });
    return { success: true, url, fileName: file.originalname, path };
  }
}