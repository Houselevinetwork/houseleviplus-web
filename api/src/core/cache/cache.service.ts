import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * Cache Service
 * 
 * Netflix-Grade Caching:
 * - Session management (faster than DB)
 * - Rate limiting
 * - Popular content caching
 * - OTP storage (email verification)
 * 
 * DPA 2019: Auto-expiration prevents data retention violations
 */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - Time to live in seconds (default: 3600 = 1 hour)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl || 3600);
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key);
    return value !== undefined ? value : null;
  }

  /**
   * Delete value from cache
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null && value !== undefined;
  }

  // ============================================
  // NETFLIX-GRADE: Session Management
  // ============================================

  /**
   * Cache user session
   * @param sessionId - Session ID
   * @param sessionData - Session data
   * @param ttl - Session TTL in seconds (default: 15 min)
   */
  async setSession(sessionId: string, sessionData: any, ttl: number = 900): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, sessionData, ttl);
  }

  /**
   * Get user session from cache
   * @param sessionId - Session ID
   */
  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return await this.get<T>(key);
  }

  /**
   * Delete user session (logout)
   * @param sessionId - Session ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.delete(key);
  }

  // ============================================
  // NETFLIX-GRADE: Rate Limiting
  // ============================================

  /**
   * Increment rate limit counter
   * @param key - Rate limit key (e.g., 'login:userId' or 'api:ip')
   * @param ttl - Window in seconds (default: 60 = 1 minute)
   * @returns Current count
   */
  async incrementRateLimit(key: string, ttl: number = 60): Promise<number> {
    const rateLimitKey = `ratelimit:${key}`;
    const currentCount = await this.get<number>(rateLimitKey);
    const count = (currentCount || 0) + 1;
    await this.set(rateLimitKey, count, ttl);
    return count;
  }

  /**
   * Check if rate limit exceeded
   * @param key - Rate limit key
   * @param maxAttempts - Max allowed attempts (default: 5)
   * @returns true if limit exceeded
   */
  async isRateLimited(key: string, maxAttempts: number = 5): Promise<boolean> {
    const rateLimitKey = `ratelimit:${key}`;
    const count = await this.get<number>(rateLimitKey);
    return (count || 0) >= maxAttempts;
  }

  // ============================================
  // NETFLIX-GRADE: Popular Content Caching
  // ============================================

  /**
   * Cache popular/trending content
   * @param content - Content data
   * @param ttl - Cache for 1 hour (content doesn't change often)
   */
  async cachePopularContent(content: any, ttl: number = 3600): Promise<void> {
    await this.set('popular:content', content, ttl);
  }

  /**
   * Get popular content from cache
   */
  async getPopularContent<T>(): Promise<T | null> {
    return await this.get<T>('popular:content');
  }

  // ============================================
  // DPA 2019: OTP Storage (Auto-Expiration)
  // ============================================

  /**
   * Store OTP code
   * @param email - User email
   * @param otp - One-time password
   * @param ttl - OTP validity in seconds (default: 5 min)
   */
  async setOTP(email: string, otp: string, ttl: number = 300): Promise<void> {
    const key = `otp:${email}`;
    await this.set(key, otp, ttl);
  }

  /**
   * Verify OTP code
   * @param email - User email
   * @param otp - OTP to verify
   * @returns true if OTP is valid
   */
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const key = `otp:${email}`;
    const cachedOTP = await this.get<string>(key);
    
    if (cachedOTP === otp) {
      // Delete OTP after successful verification (one-time use)
      await this.delete(key);
      return true;
    }
    
    return false;
  }
}