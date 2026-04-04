import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailerConfig = MailerModule.forRoot({
  transport: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_FROM,
      pass: process.env.MAIL_PASSWORD,
    },
  },
  defaults: {
    from: `"${process.env.MAIL_FROM_NAME || 'The Reel Afrika'}" <${process.env.MAIL_FROM}>`,
  },
  template: {
    dir: join(__dirname, '../templates/emails'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});