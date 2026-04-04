import { describe, test, expect } from '@jest/globals';
import { ENV } from './env';

describe('Environment', () => {
  test('should have NODE_ENV', () => {
    expect(ENV.NODE_ENV).toBeDefined();
  });

  test('should have API_URL', () => {
    expect(ENV.API_URL).toBeDefined();
  });

  test('should have storage keys', () => {
    expect(ENV.JWT_STORAGE_KEY).toBe('levi_jwt_token');
  });

  test('should have features', () => {
    expect(ENV.FEATURES).toBeDefined();
  });
});
