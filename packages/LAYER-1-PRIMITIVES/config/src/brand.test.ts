import { describe, test, expect } from '@jest/globals';
import { BRAND } from './brand';

describe('Brand', () => {
  test('should have colors', () => {
    expect(BRAND.colors.primary).toBe('#E8DCC4');
  });

  test('should have typography', () => {
    expect(BRAND.typography.sizes.base).toBe('16px');
  });

  test('should have spacing', () => {
    expect(BRAND.spacing[4]).toBe('16px');
  });

  test('should have radius', () => {
    expect(BRAND.radius.full).toBe('9999px');
  });
});
