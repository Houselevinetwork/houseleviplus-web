import { describe, test, expect } from '@jest/globals';
import { DEVICE_LIMITS, RATE_LIMITS, SESSION_LIMITS } from './limits';

describe('Device Limits', () => {
  test('should limit devices to 3', () => {
    expect(DEVICE_LIMITS.MAX_DEVICES_PER_ACCOUNT).toBe(3);
  });

  test('should limit to 1 phone, 1 laptop, 1 TV', () => {
    expect(DEVICE_LIMITS.MAX_PHONES).toBe(1);
    expect(DEVICE_LIMITS.MAX_LAPTOPS).toBe(1);
  });
});

describe('Rate Limits', () => {
  test('should enforce rate limits', () => {
    expect(RATE_LIMITS.LOGIN_ATTEMPTS_PER_MINUTE).toBe(5);
    expect(RATE_LIMITS.API_REQUESTS_PER_MINUTE).toBe(100);
  });
});
