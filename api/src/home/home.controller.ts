import { Controller, Get, Query } from '@nestjs/common';
import { GalleryService }      from './services/gallery.service';
import { HomeEventsService }   from './services/home-events.service';
import { HomeArtistsService }  from './services/home-artists.service';
import { HomePartnersService } from './services/home-partners.service';
import { HomeConfigService }   from './services/home-config.service';

@Controller('home')
export class HomeController {
  constructor(
    private readonly galleryService:  GalleryService,
    private readonly eventsService:   HomeEventsService,
    private readonly artistsService:  HomeArtistsService,
    private readonly partnersService: HomePartnersService,
    private readonly configService:   HomeConfigService,
  ) {}

  @Get('config')
  async getConfig() {
    return this.configService.getConfig();
  }

  @Get('gallery/events')
  async getGalleryEvents() {
    const events = await this.galleryService.getActiveEvents();
    return { data: events, total: events.length };
  }

  @Get('gallery/hero')
  async getHeroImages(
    @Query('event') event = 'all',
    @Query('count') count = '20',
  ) {
    const urls = await this.galleryService.getHeroImages(event, parseInt(count, 10));
    return { data: urls, total: urls.length };
  }

  @Get('gallery')
  async getGallery(
    @Query('event') event = 'all',
    @Query('page')  page  = '1',
    @Query('limit') limit = '60',
  ) {
    return this.galleryService.getImages(event, parseInt(page, 10), parseInt(limit, 10));
  }

  @Get('events')
  async getEvents() {
    const events = await this.eventsService.findAll(true);
    return { data: events, total: events.length };
  }

  @Get('artists')
  async getArtists() {
    const artists = await this.artistsService.findAll(true);
    return { data: artists, total: artists.length };
  }

  @Get('partners')
  async getPartners() {
    const partners = await this.partnersService.findAll(true);
    return { data: partners, total: partners.length };
  }
}
