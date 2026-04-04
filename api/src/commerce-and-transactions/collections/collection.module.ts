import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection, CollectionSchema } from './collection.schema';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

/**
 * Location: api/src/commerce-and-transactions/collections/collection.module.ts
 *
 * FIX: CollectionController was never in the controllers array,
 * so GET /api/commerce/collections was never registered → 404.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]),
  ],
  controllers: [CollectionController],   // ← was missing entirely
  providers:   [CollectionService],
  exports:     [CollectionService],
})
export class CollectionModule {}