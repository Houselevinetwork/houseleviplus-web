import { describe, test, expect } from '@jest/globals';
import { SessionService } from './session-service';

describe('Session Service', () => {
  test('should create session', () => {
    const service = new SessionService();
    const session = service.createSession('user_123', 'device_123', 'token_abc');

    expect(session.userId).toBe('user_123');
    expect(session.isActive).toBe(true);
  });

  test('should revoke session', () => {
    const service = new SessionService();
    const session = service.createSession('user_123', 'device_123', 'token_abc');

    service.revokeSession(session.id);
    const retrieved = service.getSession(session.id);

    expect(retrieved?.isActive).toBe(false);
  });

  test('should revoke all user sessions', () => {
    const service = new SessionService();
    service.createSession('user_123', 'device_1', 'token_1');
    service.createSession('user_123', 'device_2', 'token_2');

    const count = service.revokeUserSessions('user_123');
    expect(count).toBe(2);
  });
});
