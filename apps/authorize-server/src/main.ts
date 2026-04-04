import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for web and levi+ apps
  app.enableCors({
    origin: [
      'http://localhost:3000',        // web (dev)
      'http://localhost:3001',        // levi+ (dev)
      'https://houselevi.com',        // web (prod)
      'https://admin.houselevi.com'   // levi+ (prod)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  const PORT = process.env.AUTHORIZE_SERVER_PORT || 3002;
  await app.listen(PORT);
  console.log(\\n? Authorize Server running on http://localhost:\\);
}

bootstrap();
