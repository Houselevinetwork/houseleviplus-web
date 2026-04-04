import {
  Controller, Get, Post, Patch, Delete, Put,
  Body, Param, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../user-and-monetization/auth/guards/jwt-auth.guard';
import { CloudflareService } from '../modules/cloudflare/cloudflare.service';
import { GalleryService }      from './services/gallery.service';
import { HomeEventsService }   from './services/home-events.service';
import { HomeArtistsService }  from './services/home-artists.service';
import { HomePartnersService } from './services/home-partners.service';
import { HomeConfigService }   from './services/home-config.service';

@Controller('home/admin')
@UseGuards(JwtAuthGuard)
export class HomeAdminController {
  private readonly logger = new Logger(HomeAdminController.name);

  constructor(
    private readonly galleryService:  GalleryService,
    private readonly eventsService:   HomeEventsService,
    private readonly artistsService:  HomeArtistsService,
    private readonly partnersService: HomePartnersService,
    private readonly configService:   HomeConfigService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  // ── GALLERY EVENTS ─────────────────────────────────────────────────────────

  @Post('gallery/events')
  async createGalleryEvent(@Body() body: { name: string; slug: string; description?: string; displayOrder?: number }) {
    if (!body.name || !body.slug) throw new BadRequestException('name and slug are required');
    return this.galleryService.createEvent(body);
  }

  @Get('gallery/events')
  async getAllGalleryEvents() {
    const events = await this.galleryService.getAllEvents();
    return { data: events, total: events.length };
  }

  @Patch('gallery/events/:id')
  async updateGalleryEvent(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.galleryService.updateEvent(id, body);
  }

  @Delete('gallery/events/:id')
  async deleteGalleryEvent(@Param('id') id: string) {
    return this.galleryService.deleteEvent(id);
  }

  @Post('gallery/events/:id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: require('multer').memoryStorage(),
    limits: { fileSize: 1000 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype === 'application/zip' ||
          file.mimetype === 'application/x-zip-compressed' ||
          file.originalname.toLowerCase().endsWith('.zip')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only ZIP files are accepted'), false);
      }
    },
  }))
  async uploadZip(@Param('id') eventId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No ZIP file uploaded');
    this.logger.log(`📦 ZIP upload: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(1)}MB) → event: ${eventId}`);
    const result = await this.galleryService.processZipUpload(eventId, file.buffer);
    return {
      success: true,
      eventId,
      ...result,
      message: `Successfully uploaded ${result.processed} images (${(result.totalBytes / 1024 / 1024).toFixed(1)}MB)`,
    };
  }

  // ── UPCOMING EVENTS ────────────────────────────────────────────────────────

  @Post('events')
  async createEvent(@Body() body: Record<string, any>) {
    if (!body.title) throw new BadRequestException('title is required');
    if (!body.eventDate) throw new BadRequestException('eventDate is required');
    return this.eventsService.create(body);
  }

  @Patch('events/:id')
  async updateEvent(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.eventsService.update(id, body);
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post('events/:id/image')
  @UseInterceptors(FileInterceptor('file', { storage: require('multer').memoryStorage() }))
  async uploadEventImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Images only');
    const key = `home/events/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const url = await this.cloudflareService.uploadImageToR2('home', key, file.buffer, file.mimetype);
    await this.eventsService.update(id, { imageUrl: url, imageKey: key });
    return { success: true, url, key };
  }

  // ── FEATURED ARTISTS ───────────────────────────────────────────────────────

  @Post('artists')
  async createArtist(@Body() body: Record<string, any>) {
    if (!body.name) throw new BadRequestException('name is required');
    return this.artistsService.create(body);
  }

  @Patch('artists/:id')
  async updateArtist(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.artistsService.update(id, body);
  }

  @Delete('artists/:id')
  async deleteArtist(@Param('id') id: string) {
    return this.artistsService.remove(id);
  }

  @Post('artists/:id/image')
  @UseInterceptors(FileInterceptor('file', { storage: require('multer').memoryStorage() }))
  async uploadArtistImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Images only');
    const key = `home/artists/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const url = await this.cloudflareService.uploadImageToR2('home', key, file.buffer, file.mimetype);
    await this.artistsService.update(id, { imageUrl: url, imageKey: key });
    return { success: true, url, key };
  }

  // ── PARTNERS ───────────────────────────────────────────────────────────────

  @Post('partners')
  async createPartner(@Body() body: Record<string, any>) {
    if (!body.name) throw new BadRequestException('name is required');
    return this.partnersService.create(body);
  }

  @Patch('partners/:id')
  async updatePartner(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.partnersService.update(id, body);
  }

  @Delete('partners/:id')
  async deletePartner(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }

  @Post('partners/:id/logo')
  @UseInterceptors(FileInterceptor('file', { storage: require('multer').memoryStorage() }))
  async uploadPartnerLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Images only');
    const key = `home/partners/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const url = await this.cloudflareService.uploadImageToR2('home', key, file.buffer, file.mimetype);
    await this.partnersService.update(id, { logoUrl: url, logoKey: key });
    return { success: true, url, key };
  }

  // ── CONFIG ─────────────────────────────────────────────────────────────────

  @Get('config')
  async getConfig() {
    return this.configService.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() body: Record<string, any>) {
    return this.configService.updateConfig(body);
  }
}

