// api/src/modules/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { ContentModule }    from '../content/content.module';
import { AuthModule }       from '../../user-and-monetization/auth/auth.module';
import { RoleModule }       from '../../user-and-monetization/role/role.module';

import { UploadsService }    from './uploads.service';
import { UploadsController } from './uploads.controller';
import { UploadJob, UploadJobSchema } from './schemas/upload-job.schema';

@Module({
  imports: [
    // Register the UploadJob collection — used to track multipart upload state
    MongooseModule.forFeature([
      { name: UploadJob.name, schema: UploadJobSchema },
    ]),
    CloudflareModule,
    ContentModule,
    AuthModule,
    RoleModule,
  ],
  providers:   [UploadsService],
  controllers: [UploadsController],
  exports:     [UploadsService],
})
export class UploadsModule {}
