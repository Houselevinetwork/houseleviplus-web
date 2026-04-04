import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from './schemas/content.schema';
import { Host, HostSchema } from './schemas/host.schema';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentPremiumController } from './content-premium.controller';
import { CloudflareModule } from '../cloudflare/cloudflare.module';

// 🔐 Auth + Subscription modules
import { AuthModule } from '../../user-and-monetization/auth/auth.module';
import { SubscriptionModule } from '../../user-and-monetization/subscription/subscription.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: Host.name,    schema: HostSchema    },
    ]),

    // 🔐 Auth Guards + Session/Device Services
    forwardRef(() => AuthModule),

    // 🔐 SubscriptionService (needed by SubscriptionGuard + ContentPremiumController)
    forwardRef(() => SubscriptionModule),

    // R2 client — CloudflareR2Service used by ContentPremiumController for signed URLs
    CloudflareModule,
  ],

  providers: [ContentService],

  controllers: [
    ContentPremiumController,  // 🔐 FIRST — /premium, /free, /:id/play must match before :id
    ContentController,         // SECOND — generic :id route registered after specific routes
  ],

  exports: [ContentService],
})
export class ContentModule {}