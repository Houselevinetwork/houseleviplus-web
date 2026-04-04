import { describe, test, expect } from '@jest/globals';
import { isEmail, isStrongPassword, isUsername, isUrl } from './validation';

describe('Validation Utils', () => {
  test('isEmail should validate emails', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('invalid')).toBe(false);
  });

  test('isStrongPassword should validate passwords', () => {
    expect(isStrongPassword('Week@123')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
  });

  test('isUsername should validate usernames', () => {
    expect(isUsername('john_doe')).toBe(true);
    expect(isUsername('ab')).toBe(false);
  });

  test('isUrl should validate URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('not a url')).toBe(false);
  });
});
