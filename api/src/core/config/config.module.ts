import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { validate } from './env.validation';

/**
 * Configuration Module
 * 
 * @Global - Available throughout the application
 * Netflix-Grade: Centralized configuration management
 * DPA 2019: Secure secrets management
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate, // Validates env vars on startup
      cache: true, // Cache config for performance
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
