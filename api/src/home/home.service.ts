import { Injectable } from '@nestjs/common';
import { GalleryService }      from './services/gallery.service';
import { HomeEventsService }   from './services/home-events.service';
import { HomeArtistsService }  from './services/home-artists.service';
import { HomePartnersService } from './services/home-partners.service';
import { HomeConfigService }   from './services/home-config.service';

@Injectable()
export class HomeService {
  constructor(
    readonly gallery:  GalleryService,
    readonly events:   HomeEventsService,
    readonly artists:  HomeArtistsService,
    readonly partners: HomePartnersService,
    readonly config:   HomeConfigService,
  ) {}

  async getHomePageData() {
    const [config, galleryEvents, events, artists, partners] = await Promise.all([
      this.config.getConfig(),
      this.gallery.getActiveEvents(),
      this.events.findAll(true),
      this.artists.findAll(true),
      this.partners.findAll(true),
    ]);
    return { config, galleryEvents, events, artists, partners };
  }
}
