import { describe, test, expect } from '@jest/globals';
import { JWTManager } from './jwt-manager';

describe('JWT Manager', () => {
  test('should create and verify token', () => {
    const jwtManager = new JWTManager('test-secret');
    const payload = {
      userId: 'user_123',
      deviceId: 'device_123',
      sessionId: 'session_123',
    };

    const token = jwtManager.sign(payload, 3600);
    const verified = jwtManager.verify(token);

    expect(verified).toBeDefined();
    expect(verified?.userId).toBe('user_123');
  });

  test('should reject invalid token', () => {
    const jwtManager = new JWTManager('test-secret');
    const verified = jwtManager.verify('invalid.token.here');

    expect(verified).toBeNull();
  });

  test('should handle expired token', () => {
    const jwtManager = new JWTManager('test-secret');
    const payload = {
      userId: 'user_123',
      deviceId: 'device_123',
      sessionId: 'session_123',
    };

    const token = jwtManager.sign(payload, -1); // Expired immediately
    const verified = jwtManager.verify(token);

    expect(verified).toBeNull();
  });
});
