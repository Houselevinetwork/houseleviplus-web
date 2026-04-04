// api/src/modules/cloudflare/cloudflare.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { CloudflareHostsR2Service } from './cloudflare-hosts-r2.service';
import { CloudflareStreamService } from './cloudflare-stream.service';
import { CloudflareService } from './cloudflare.service';

@Module({
  imports: [ConfigModule],
  providers: [
    CloudflareService,
    CloudflareR2Service,
    CloudflareStreamService,
    CloudflareHostsR2Service,
  ],
  exports: [
    CloudflareService,
    CloudflareR2Service,
    CloudflareStreamService,
    CloudflareHostsR2Service,
  ],
})
export class CloudflareModule {}