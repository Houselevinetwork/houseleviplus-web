import { describe, test, expect } from '@jest/globals';
import { RateLimiter } from './rate-limiter';

describe('Rate Limiter', () => {
  test('should allow requests within limit', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowSeconds: 60 });

    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed('user_123')).toBe(true);
    }
  });

  test('should block requests exceeding limit', () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowSeconds: 60 });

    limiter.isAllowed('user_123');
    limiter.isAllowed('user_123');
    limiter.isAllowed('user_123');

    expect(limiter.isAllowed('user_123')).toBe(false);
  });

  test('should track remaining requests', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowSeconds: 60 });

    limiter.isAllowed('user_123');
    limiter.isAllowed('user_123');

    expect(limiter.getRemaining('user_123')).toBe(3);
  });

  test('should reset limit', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowSeconds: 60 });

    limiter.isAllowed('user_123');
    limiter.isAllowed('user_123');

    limiter.reset('user_123');

    expect(limiter.isAllowed('user_123')).toBe(true);
  });
});
