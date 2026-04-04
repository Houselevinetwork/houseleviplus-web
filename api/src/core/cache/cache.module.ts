import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@core/config/config.service';
import { CacheService } from './cache.service';
import * as redisStore from 'cache-manager-redis-store';

/**
 * Cache Module (Global)
 * Netflix-Grade: Redis caching for OTP, sessions, and content
 * DPA 2019: Secure cache with TTL management
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const cacheProvider = configService.get('CACHE_PROVIDER') || 'memory';
        const redisHost = configService.get('REDIS_HOST') || 'localhost';
        const redisPort = parseInt(configService.get('REDIS_PORT') as string) || 6379;
        const redisPassword = configService.get('REDIS_PASSWORD') || '';
        const redisTtl = parseInt(configService.get('REDIS_TTL') as string) || 3600;

        // Use Redis for production/development with CACHE_PROVIDER=redis
        if (cacheProvider === 'redis') {
          const options: any = {
            isGlobal: true,
            store: redisStore,
            host: redisHost,
            port: redisPort,
            ttl: redisTtl,
            max: 10000,
          };

          // Add password if provided
          if (redisPassword && redisPassword.trim() !== '') {
            options.password = redisPassword;
          }

          return options;
        }

        // Fallback to in-memory cache (development/testing without Redis)
        return {
          isGlobal: true,
          ttl: redisTtl,
          max: 10000,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}