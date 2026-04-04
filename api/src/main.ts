import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

// Exception Filters
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CloudflareExceptionFilter } from './common/filters/cloudflare-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

dotenv.config({ path: envFile });

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  logger.log('==========================================');
  logger.log('🔍 ENVIRONMENT VARIABLES CHECK:');
  logger.log('==========================================');
  logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.log(`PORT: ${process.env.PORT}`);
  logger.log(`BACKEND_URL: ${process.env.BACKEND_URL}`);
  logger.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  logger.log(`ADMIN_FRONTEND_URL: ${process.env.ADMIN_FRONTEND_URL}`);
  logger.log(`ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS}`);
  logger.log(`MAIL_HOST: ${process.env.MAIL_HOST}`);
  logger.log(`MAIL_PORT: ${process.env.MAIL_PORT}`);
  logger.log(`MAIL_USER: ${process.env.MAIL_USER}`);
  logger.log('==========================================\n');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port    = configService.get<number>('PORT')    || 4000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // ── Body size limits ────────────────────────────────────────────────────────
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb' }));
  app.use(bodyParser.raw({ type: 'application/zip', limit: '1000mb' }));
  app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '1000mb' }));

  // ── Extend HTTP server timeout for large ZIP processing ─────────────────────
  const httpServer = app.getHttpServer();
  httpServer.setTimeout(45 * 60 * 1000);        // 45 min socket timeout
  httpServer.keepAliveTimeout = 45 * 60 * 1000; // 45 min keep-alive
  httpServer.headersTimeout   = 46 * 60 * 1000; // must be > keepAliveTimeout

  logger.log('⏱️  HTTP timeout set to 45 minutes (large ZIP upload support)');

  // ── CORS ────────────────────────────────────────────────────────────────────
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS');

  let allowedOrigins: string[];

  if (allowedOriginsEnv) {
    allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());
  } else {
    allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:4000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://192.168.100.223:4000', // PC local IP
      'http://192.168.100.81',       // Samsung phone
    ];
    logger.warn('⚠️  ALLOWED_ORIGINS not set in .env — using default localhost origins');
  }

  logger.log(`🌍 Environment: ${nodeEnv.toUpperCase()}`);
  logger.log(`🔌 Allowed Origins: ${allowedOrigins.join(', ')}`);

  // ── Exception filters ───────────────────────────────────────────────────────
  app.useGlobalFilters(
    new CloudflareExceptionFilter(),
    new HttpExceptionFilter(),
    new AllExceptionsFilter(),
  );

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allows Retrofit/mobile clients
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`🚫 CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

  // ── Validation pipe ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Start — bind to 0.0.0.0 so phone can reach it on local network ──────────
  await app.listen(port, '0.0.0.0'); // ← KEY CHANGE: was app.listen(port)

  const serverUrl = nodeEnv === 'production'
    ? configService.get<string>('BACKEND_URL')
    : `http://localhost:${port}`;

  logger.log(`\n✅ Server running on: ${serverUrl}`);
  logger.log(`📝 API Routes:`);
  logger.log(`   Health Check : ${serverUrl}/health`);
  logger.log(`   Content      : ${serverUrl}/api/content`);
  logger.log(`   Uploads      : ${serverUrl}/api/uploads/session`);
  logger.log(`   Auth         : ${serverUrl}/auth/register`);
  logger.log(`   Billing      : ${serverUrl}/billing`);
  logger.log(`   Pesapal Hook : ${serverUrl}/billing/pesapal-webhook`);
  logger.log(`\n🌐 CORS Enabled for: ${allowedOrigins.join(', ')}`);
  logger.log(`\n🚀 Reel Afrika Backend Ready!\n`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});