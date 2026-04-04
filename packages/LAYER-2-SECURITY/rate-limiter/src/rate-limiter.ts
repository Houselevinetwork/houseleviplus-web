/**
 * @houselevi/security/rate-limiter/rate-limiter
 * Rate limiting implementation
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(private config: RateLimitConfig) {}

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowSeconds * 1000;

    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length < this.config.maxRequests) {
      timestamps.push(now);
      this.requests.set(key, timestamps);
      return true;
    }

    return false;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowSeconds * 1000;

    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    return Math.max(0, this.config.maxRequests - timestamps.length);
  }

  /**
   * Reset limit for key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
}
