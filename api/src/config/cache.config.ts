import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig = (): CacheModuleOptions => {
  return {
    isGlobal: true,
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
    max: 10000,
  };
};