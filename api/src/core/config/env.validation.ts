import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  validateSync,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

/**
 * Environment Configuration Validation
 * Kenya Data Protection Act 2019 Compliance: Section 41 - Data Protection by Design
 * Netflix-Grade: Fail fast if configuration is invalid
 */

enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export class EnvironmentVariables {
  // ============================================
  // ENVIRONMENT & SERVER
  // ============================================
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number = 3001;

  @IsString()
  API_PREFIX: string = '/api';

  // ============================================
  // URLs
  // ============================================
  @IsUrl({ require_tld: false })
  BACKEND_URL: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string;

  @IsUrl({ require_tld: false })
  ADMIN_URL: string;

  // ============================================
  // DATABASE
  // ============================================
  @IsString()
  MONGODB_URI: string;

  @IsNumber()
  @IsOptional()
  MONGODB_MAX_POOL_SIZE?: number = 50;

  // ============================================
  // JWT AUTHENTICATION (Netflix-Grade)
  // ============================================
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRY: string = '5m';

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRY: string = '7d';

  @IsString()
  DEVICE_SESSION_SECRET: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  MAX_DEVICES_PER_USER: number = 3;

  // ============================================
  // REDIS (Cache)
  // ============================================
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  // ============================================
  // EMAIL
  // ============================================
  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  MAIL_PORT: number;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASSWORD: string;

  @IsString()
  MAIL_FROM: string;

  // ============================================
  // PAYMENTS (Pesapal Primary)
  // ============================================
  @IsString()
  PESAPAL_CONSUMER_KEY: string;

  @IsString()
  PESAPAL_CONSUMER_SECRET: string;

  @IsUrl()
  PESAPAL_API_URL: string;

  @IsString()
  PESAPAL_IPN_ID: string;

  // ============================================
  // CLOUDFLARE
  // ============================================
  @IsString()
  CLOUDFLARE_ACCOUNT_ID: string;

  @IsString()
  CLOUDFLARE_R2_ACCESS_KEY_ID: string;

  @IsString()
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;

  // ============================================
  // DPA 2019 COMPLIANCE
  // ============================================
  @IsString()
  ENCRYPTION_KEY: string;

  @IsString()
  DATA_COMMISSIONER_EMAIL: string;

  @IsNumber()
  @Min(1)
  DATA_RETENTION_DAYS: number = 365;

  // ============================================
  // SECURITY
  // ============================================
  @IsNumber()
  @Min(1)
  RATE_LIMIT_TTL: number = 60;

  @IsNumber()
  @Min(1)
  RATE_LIMIT_MAX_REQUESTS: number = 100;

  @IsBoolean()
  @IsOptional()
  TRUST_PROXY?: boolean = false;

  // ============================================
  // LOGGING
  // ============================================
  @IsEnum(['debug', 'info', 'warn', 'error'])
  LOG_LEVEL: string = 'debug';

  @IsString()
  LOG_FILE_PATH: string = './logs';
}

/**
 * Validates environment variables at startup
 * Prevents application from starting with invalid config
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();

    throw new Error(
      `❌ Configuration validation failed:\n${errorMessages.join('\n')}`,
    );
  }

  return validatedConfig;
}