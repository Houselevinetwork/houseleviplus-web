import { describe, test, expect } from '@jest/globals';
import { clamp, percentage } from './number';

describe('Number Utils', () => {
  test('clamp should clamp values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test('percentage should calculate percentage', () => {
    expect(percentage(50, 100)).toBe(50);
  });
});
