/**
 * Tests for error types
 */

import { describe, test, expect } from '@jest/globals';
import { AppError, ValidationError, AuthenticationError, isAppError, isValidationError, isAuthenticationError } from './error';

describe('Error Types', () => {
  test('AppError type should have all required fields', () => {
    const error: AppError = {
      code: 'AUTH_001',
      message: 'Invalid credentials',
      userMessage: 'Email or password is incorrect',
      statusCode: 401,
      category: 'auth',
      severity: 'error',
      timestamp: new Date(),
    };

    expect(error.code).toBe('AUTH_001');
    expect(error.statusCode).toBe(401);
  });

  test('ValidationError should work', () => {
    const error: ValidationError = {
      code: 'VALIDATION_001',
      message: 'Validation failed',
      userMessage: 'Please check your input',
      statusCode: 400,
      category: 'validation',
      severity: 'warning',
      timestamp: new Date(),
      fields: {
        email: 'Email is required',
        password: 'Password must be at least 8 characters',
      },
    };

    expect(error.fields.email).toBe('Email is required');
  });

  test('isAppError type guard should work', () => {
    const error: AppError = {
      code: 'AUTH_001',
      message: 'Test error',
      userMessage: 'Test',
      statusCode: 400,
      category: 'auth',
      severity: 'error',
      timestamp: new Date(),
    };

    expect(isAppError(error)).toBe(true);
    expect(isAppError({})).toBe(false);
  });

  test('isValidationError type guard should work', () => {
    const error: ValidationError = {
      code: 'VALIDATION_001',
      message: 'Validation failed',
      userMessage: 'Invalid input',
      statusCode: 400,
      category: 'validation',
      severity: 'warning',
      timestamp: new Date(),
      fields: { field: 'error' },
    };

    expect(isValidationError(error)).toBe(true);
  });

  test('isAuthenticationError type guard should work', () => {
    const error: AuthenticationError = {
      code: 'AUTH_001',
      message: 'Auth failed',
      userMessage: 'Not authorized',
      statusCode: 401,
      category: 'auth',
      severity: 'error',
      timestamp: new Date(),
      reason: 'invalid_credentials',
    };

    expect(isAuthenticationError(error)).toBe(true);
  });
});
