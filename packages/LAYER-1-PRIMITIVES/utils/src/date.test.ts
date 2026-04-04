import { describe, test, expect } from '@jest/globals';
import { formatDate, isExpired, addDays } from './date';

describe('Date Utils', () => {
  test('formatDate should format dates', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toContain('01');
  });

  test('isExpired should detect expired dates', () => {
    const past = new Date(Date.now() - 1000);
    expect(isExpired(past)).toBe(true);
  });

  test('addDays should add days', () => {
    const date = new Date('2024-01-15');
    const result = addDays(date, 1);
    expect(result.getDate()).toBe(16);
  });
});
