import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@core/config/config.service';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { join } from 'path';

/**
 * Mail Module
 * 
 * Netflix-Grade Email System:
 * - Background email sending (non-blocking)
 * - Email queues (retry failed emails)
 * - HTML templates (beautiful emails)
 * - Multiple email types
 * 
 * DPA 2019: Email logging, unsubscribe links
 */
@Global()
@Module({
  imports: [
    // Email Configuration
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.mailHost,
          port: configService.mailPort,
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.mailUser,
            pass: configService.mailPassword,
          },
        },
        defaults: {
          from: `"ReelAfrika" <${configService.mailFrom}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    // Email Queue (Background Jobs)
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {} // ← Make sure "export" is here!