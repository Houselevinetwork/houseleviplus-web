import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ShopConfigSchema } from './schemas/shop-config.schema';
import { CloudflareModule } from '../../modules/cloudflare/cloudflare.module';

/**
 * Location: api/src/commerce-and-transactions/shop/shop.module.ts
 * 
 * Registers:
 * - ShopController (endpoints for hero, announcements, reviews)
 * - ShopService (business logic)
 * - ShopConfig schema (MongoDB model)
 * - CloudflareModule (reuses existing R2 infrastructure from modules/cloudflare)
 */

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: 'ShopConfig', 
        schema: ShopConfigSchema,
        collection: 'shop_configs'
      },
    ]),
    CloudflareModule,  // ← Import to use CloudflareService for R2 uploads
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}