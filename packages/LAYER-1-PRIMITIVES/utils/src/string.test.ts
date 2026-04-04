import { describe, test, expect } from '@jest/globals';
import { capitalize, slug, truncate, camelCase } from './string';

describe('String Utils', () => {
  test('capitalize should work', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('slug should convert to slug', () => {
    expect(slug('Hello World')).toBe('hello-world');
  });

  test('truncate should truncate strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  test('camelCase should convert', () => {
    expect(camelCase('hello-world')).toBe('helloWorld');
  });
});
