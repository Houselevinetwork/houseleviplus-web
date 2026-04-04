import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

/**
 * Cache Configuration
 * Netflix-Grade: Redis caching for OTP, sessions, and content
 * DPA 2019: Secure cache with TTL management
 */
export const cacheConfig = (): CacheModuleOptions => {
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD || undefined;
  const cacheProvider = process.env.CACHE_PROVIDER || 'memory';

  // Use Redis in production
  if (cacheProvider === 'redis') {
    const options: any = {
      isGlobal: true,
      store: redisStore,
      host: redisHost,
      port: redisPort,
      ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
    };

    // Add password if provided
    if (redisPassword) {
      options.password = redisPassword;
    }

    return options;
  }

  // Fallback to in-memory cache (development/testing)
  return {
    isGlobal: true,
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  };
};