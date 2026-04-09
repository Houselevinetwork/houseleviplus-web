import { MailerModule } from '@nestjs-modules/mailer';

export const mailerConfig = MailerModule.forRoot({
  transport: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  },
  defaults: {
    from: `"${process.env.MAIL_FROM_NAME || 'House Levi+'}" <${process.env.MAIL_FROM}>`,
  },
});