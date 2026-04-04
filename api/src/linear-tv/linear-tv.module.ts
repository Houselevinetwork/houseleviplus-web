// api/src/linear-tv/linear-tv.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinearTvController } from './linear-tv.controller';
import { LinearTvService } from './linear-tv.service';
import { MoodTVBlock, MoodTVBlockSchema } from './schemas/mood-tv-block.schema';
import { CloudflareModule } from '../modules/cloudflare/cloudflare.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MoodTVBlock.name, schema: MoodTVBlockSchema },
    ]),
    CloudflareModule, // ← needed for R2 presigned URLs + deletion
  ],
  controllers: [LinearTvController],
  providers:   [LinearTvService],
  exports:     [LinearTvService],
})
export class LinearTvModule {}