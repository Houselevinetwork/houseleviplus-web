import { describe, test, expect } from '@jest/globals';
import { ERROR_CODES, ERROR_MESSAGES } from './errors';

describe('Error Codes', () => {
  test('AUTH error codes should be defined', () => {
    expect(ERROR_CODES.AUTH_INVALID_CREDENTIALS).toBe('AUTH_001');
  });

  test('Error messages exist', () => {
    expect(ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]).toBeDefined();
  });

  test('Device error codes exist', () => {
    expect(ERROR_CODES.DEVICE_LIMIT_EXCEEDED).toBe('DEVICE_002');
  });
});
