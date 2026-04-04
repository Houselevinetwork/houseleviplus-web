import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Configuration Service
 * Provides type-safe access to environment variables
 * Netflix-Grade: Single source of truth for all config
 * DPA 2019: Centralized config management with fail-safe defaults
 */
@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  // ============================================
  // GENERIC GET METHOD (for dynamic access)
  // ============================================
  get(key: string, defaultValue?: any): any {
    const value = this.configService.get<any>(key);
    return value !== undefined ? value : defaultValue;
  }

  // ============================================
  // SERVER CONFIG
  // ============================================
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get port(): number {
    return this.configService.get<number>('PORT') || 3001;
  }

  get apiPrefix(): string {
    return this.configService.get<string>('API_PREFIX') || '/api';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  // ============================================
  // URLS
  // ============================================
  get backendUrl(): string {
    return this.configService.getOrThrow<string>('BACKEND_URL');
  }

  get frontendUrl(): string {
    return this.configService.getOrThrow<string>('FRONTEND_URL');
  }

  get adminUrl(): string {
    return this.configService.getOrThrow<string>('ADMIN_URL');
  }

  // ============================================
  // DATABASE
  // ============================================
  get mongoUri(): string {
    return this.configService.getOrThrow<string>('MONGODB_URI');
  }

  get mongoMaxPoolSize(): number {
    return this.configService.get<number>('MONGODB_MAX_POOL_SIZE') || 50;
  }

  // ============================================
  // JWT (Netflix-Grade: Short-lived tokens)
  // ============================================
  get jwtAccessSecret(): string {
    return this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  get jwtAccessExpiry(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRY') || '5m';
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiry(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';
  }

  get deviceSessionSecret(): string {
    return this.configService.getOrThrow<string>('DEVICE_SESSION_SECRET');
  }

  get maxDevicesPerUser(): number {
    return this.configService.get<number>('MAX_DEVICES_PER_USER') || 3;
  }

  // ============================================
  // REDIS
  // ============================================
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST') || 'localhost';
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT') || 6379;
  }

  get redisPassword(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get redisTtl(): number {
    return this.configService.get<number>('REDIS_TTL') || 3600;
  }

  get cacheProvider(): string {
    return this.configService.get<string>('CACHE_PROVIDER') || 'memory';
  }

  // ============================================
  // EMAIL
  // ============================================
  get mailHost(): string {
    return this.configService.getOrThrow<string>('MAIL_HOST');
  }

  get mailPort(): number {
    const port = this.configService.get<number>('MAIL_PORT');
    if (!port) {
      throw new Error('MAIL_PORT is required');
    }
    return port;
  }

  get mailUser(): string {
    return this.configService.getOrThrow<string>('MAIL_USER');
  }

  get mailPassword(): string {
    return this.configService.getOrThrow<string>('MAIL_PASSWORD');
  }

  get mailFrom(): string {
    return this.configService.getOrThrow<string>('MAIL_FROM');
  }

  // ============================================
  // PAYMENTS (Pesapal)
  // ============================================
  get pesapalConsumerKey(): string {
    return this.configService.getOrThrow<string>('PESAPAL_CONSUMER_KEY');
  }

  get pesapalConsumerSecret(): string {
    return this.configService.getOrThrow<string>('PESAPAL_CONSUMER_SECRET');
  }

  get pesapalApiUrl(): string {
    return this.configService.getOrThrow<string>('PESAPAL_API_URL');
  }

  get pesapalIpnId(): string {
    return this.configService.getOrThrow<string>('PESAPAL_IPN_ID');
  }

  // ============================================
  // DPA 2019 COMPLIANCE
  // ============================================
  get encryptionKey(): string {
    return this.configService.getOrThrow<string>('ENCRYPTION_KEY');
  }

  get dataCommissionerEmail(): string {
    return this.configService.getOrThrow<string>('DATA_COMMISSIONER_EMAIL');
  }

  get dataRetentionDays(): number {
    return this.configService.get<number>('DATA_RETENTION_DAYS') || 365;
  }

  // ============================================
  // SECURITY
  // ============================================
  get rateLimitTtl(): number {
    return this.configService.get<number>('RATE_LIMIT_TTL') || 60;
  }

  get rateLimitMax(): number {
    return this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS') || 100;
  }

  get trustProxy(): boolean {
    return this.configService.get<boolean>('TRUST_PROXY') || false;
  }

  // ============================================
  // LOGGING
  // ============================================
  get logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL') || 'debug';
  }

  get logFilePath(): string {
    return this.configService.get<string>('LOG_FILE_PATH') || './logs';
  }
}