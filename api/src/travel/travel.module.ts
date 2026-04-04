import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { TravelConfig, TravelConfigSchema } from './travel-config.schema';
import { TravelPackage, TravelPackageSchema } from './travel.schema';
import { TravelPackagesController } from './packages/packages.controller';
import { TravelPackagesService } from './packages/packages.service';
import { TravelInquiriesController } from './inquiries/inquiries.controller';
import { TravelInquiriesService } from './inquiries/inquiries.service';
import { TravelTestimonialsController } from './testimonials/testimonials.controller';
import { TravelTestimonialsService } from './testimonials/testimonials.service';
import { CloudflareModule } from '../modules/cloudflare/cloudflare.module';

/**
 * Location: api/src/travel/travel.module.ts
 */

@Module({
  imports: [
    MulterModule.register({ dest: './uploads/travel' }),
    CloudflareModule,
    MongooseModule.forFeature([
      { name: 'TravelConfig', schema: TravelConfigSchema },
      { name: 'TravelPackage', schema: TravelPackageSchema },
    ]),
  ],
  controllers: [
    TravelController,
    TravelPackagesController,
    TravelInquiriesController,
    TravelTestimonialsController,
  ],
  providers: [
    TravelService,
    TravelPackagesService,
    TravelInquiriesService,
    TravelTestimonialsService,
  ],
  exports: [
    TravelService,
    TravelPackagesService,
    TravelTestimonialsService,
  ],
})
export class TravelModule {}