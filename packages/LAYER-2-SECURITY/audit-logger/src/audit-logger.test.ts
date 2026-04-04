import { describe, test, expect } from '@jest/globals';
import { AuditLogger } from './audit-logger';

describe('Audit Logger', () => {
  test('should log action', () => {
    const logger = new AuditLogger();
    const log = logger.log('user_123', 'LOGIN', 'auth', 'success');

    expect(log.userId).toBe('user_123');
    expect(log.action).toBe('LOGIN');
  });

  test('should get user logs', () => {
    const logger = new AuditLogger();
    logger.log('user_123', 'LOGIN', 'auth', 'success');
    logger.log('user_123', 'ACCESS', 'profile', 'success');

    const logs = logger.getUserLogs('user_123');
    expect(logs.length).toBe(2);
  });

  test('should get logs by action', () => {
    const logger = new AuditLogger();
    logger.log('user_123', 'LOGIN', 'auth', 'success');
    logger.log('user_456', 'LOGIN', 'auth', 'success');
    logger.log('user_789', 'LOGOUT', 'auth', 'success');

    const loginLogs = logger.getLogsByAction('LOGIN');
    expect(loginLogs.length).toBe(2);
  });
});
