// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { getDatabaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';
import { cloudflareConfig } from './config/cloudflare.config';

// ========================================
// 🎯 EVENT EMITTER MODULE
// ========================================
import { EventEmitterModule } from './shared/event-emitter/event-emitter.module';

// ========================================
// 💼 USER & MONETIZATION MODULES
// ========================================
import { AuthModule } from './user-and-monetization/auth/auth.module';
import { UserModule } from './user-and-monetization/user/user.module';
import { RoleModule } from './user-and-monetization/role/role.module';
import { PesapalModule } from './user-and-monetization/pesapal/pesapal.module';
import { SubscriptionModule } from './user-and-monetization/subscription/subscription.module';
import { ListenersModule } from './user-and-monetization/listeners/listeners.module';
import { BillingModule } from './user-and-monetization/billing/billing.module';
import { WebhookModule } from './user-and-monetization/webhook/webhook.module';
import { LegalModule } from './user-and-monetization/legal/legal.module';

// ========================================
// 🛍️ COMMERCE & TRANSACTIONS MODULES
// ========================================
import { CommerceAndTransactionsModule } from './commerce-and-transactions/commerce.module';

// ========================================
// 🎬 MEDIA PLATFORM MODULES (Phase 1)
// ========================================
import { UsersModule } from './modules/users/users.module';
import { ContentModule } from './modules/content/content.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { CloudflareModule } from './modules/cloudflare/cloudflare.module';
import { HealthModule } from './modules/health/health.module';

// ========================================
// 📺 LINEAR TV MODULE
// ========================================
import { LinearTvModule } from './linear-tv/linear-tv.module';

// ========================================
// ✈️ TRAVEL MODULE
// ========================================
import { TravelModule } from './travel/travel.module';

// ========================================
// 🏠 HOME MODULE
// ========================================
import { HomeModule } from './home/home.module';

@Module({
  imports: [
    // ========================================
    // 🔐 CONFIGURATION MODULE (MUST BE FIRST!)
    // ========================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, cloudflareConfig],
      cache: true,
    }),

    // ========================================
    // 🧠 DATABASE MODULE (MongoDB)
    // ========================================
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),

    // ========================================
    // 🔐 RATE LIMITING
    // ========================================
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 10000,
      },
      {
        name: 'auth',
        ttl: 900000,
        limit: 1000,
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 1000,
      },
    ]),

    // ========================================
    // 📧 EMAIL MODULE (MailerModule)
    // ========================================
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        console.log('\n==========================================');
        console.log('📧 MailerModule Configuration Loading...');
        console.log('==========================================');
        console.log('MAIL_HOST:', configService.get('MAIL_HOST'));
        console.log('MAIL_PORT:', configService.get('MAIL_PORT'));
        console.log('MAIL_USER:', configService.get('MAIL_USER'));
        console.log('MAIL_FROM:', configService.get('MAIL_FROM'));
        console.log('MAIL_SECURE:', configService.get('MAIL_SECURE'));
        console.log('==========================================\n');

        const mailConfig = {
          transport: {
            host: configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
            port: parseInt(configService.get<string>('MAIL_PORT') || '587', 10),
            secure: configService.get<string>('MAIL_SECURE') === 'true',
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASSWORD'),
            },
            debug: true,
            logger: true,
          },
          defaults: {
            from: `"${configService.get<string>('MAIL_FROM_NAME') || 'House Levi+'}" <${configService.get<string>('MAIL_FROM')}>`,
          },
        };

        console.log('📧 Final Mail Transport Config:', {
          host: mailConfig.transport.host,
          port: mailConfig.transport.port,
          secure: mailConfig.transport.secure,
          user: mailConfig.transport.auth.user,
          from: mailConfig.defaults.from,
        });

        return mailConfig;
      },
    }),

    // ========================================
    // 🎯 EVENT EMITTER MODULE
    // ========================================
    EventEmitterModule,

    // ========================================
    // 💼 USER & MONETIZATION MODULES
    // ========================================
    AuthModule,
    UserModule,
    RoleModule,
    PesapalModule,
    SubscriptionModule,
    ListenersModule,
    BillingModule,
    WebhookModule,
    LegalModule,

    // ========================================
    // 🛍️ COMMERCE & TRANSACTIONS MODULES
    // ========================================
    CommerceAndTransactionsModule,

    // ========================================
    // 🎬 MEDIA PLATFORM MODULES (Phase 1)
    // ========================================
    ContentModule,
    UploadsModule,
    UsersModule,
    CloudflareModule,
    HealthModule,

    // ========================================
    // 📺 LINEAR TV MODULE
    // ========================================
    LinearTvModule,

    // ========================================
    // ✈️ TRAVEL MODULE
    // ========================================
    TravelModule,

    // ========================================
    // 🏠 HOME MODULE
    // ========================================
    HomeModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
