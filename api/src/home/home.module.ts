import { Module }         from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudflareModule } from '../modules/cloudflare/cloudflare.module';

import { GalleryEvent,  GalleryEventSchema  } from './schemas/gallery-event.schema';
import { GalleryImage,  GalleryImageSchema  } from './schemas/gallery-image.schema';
import { HomeEvent,     HomeEventSchema     } from './schemas/home-event.schema';
import { HomeArtist,    HomeArtistSchema    } from './schemas/home-artist.schema';
import { HomePartner,   HomePartnerSchema   } from './schemas/home-partner.schema';
import { HomeConfig,    HomeConfigSchema    } from './schemas/home-config.schema';

import { GalleryService }      from './services/gallery.service';
import { HomeEventsService }   from './services/home-events.service';
import { HomeArtistsService }  from './services/home-artists.service';
import { HomePartnersService } from './services/home-partners.service';
import { HomeConfigService }   from './services/home-config.service';

import { HomeController }      from './home.controller';
import { HomeAdminController } from './home-admin.controller';

@Module({
  imports: [
    CloudflareModule,
    MongooseModule.forFeature([
      { name: 'GalleryEvent',  schema: GalleryEventSchema  },
      { name: 'GalleryImage',  schema: GalleryImageSchema  },
      { name: 'HomeEvent',     schema: HomeEventSchema     },
      { name: 'HomeArtist',    schema: HomeArtistSchema    },
      { name: 'HomePartner',   schema: HomePartnerSchema   },
      { name: 'HomeConfig',    schema: HomeConfigSchema    },
    ]),
  ],
  providers: [
    GalleryService,
    HomeEventsService,
    HomeArtistsService,
    HomePartnersService,
    HomeConfigService,
  ],
  controllers: [HomeController, HomeAdminController],
  exports: [GalleryService, HomeEventsService, HomeArtistsService, HomePartnersService, HomeConfigService],
})
export class HomeModule {}
