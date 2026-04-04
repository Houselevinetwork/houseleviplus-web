import { describe, test, expect } from '@jest/globals';
import { FingerprintGenerator } from './fingerprint-generator';

describe('Fingerprint Generator', () => {
  test('should generate fingerprint', () => {
    const generator = new FingerprintGenerator();
    const fingerprint = generator.generate({
      os: 'iOS',
      browser: 'Safari',
      screenResolution: '1170x2532',
      timezone: 'UTC',
      language: 'en-US',
    });

    expect(fingerprint.hash).toBeDefined();
    expect(fingerprint.hash.length).toBe(64);
  });

  test('should verify matching fingerprints', () => {
    const generator = new FingerprintGenerator();
    const fp1 = generator.generate({
      os: 'iOS',
      browser: 'Safari',
      screenResolution: '1170x2532',
      timezone: 'UTC',
      language: 'en-US',
    });

    const fp2 = generator.generate({
      os: 'iOS',
      browser: 'Safari',
      screenResolution: '1170x2532',
      timezone: 'UTC',
      language: 'en-US',
    });

    expect(generator.verify(fp1, fp2)).toBe(true);
  });

  test('should calculate similarity', () => {
    const generator = new FingerprintGenerator();
    const fp1 = generator.generate({
      os: 'iOS',
      browser: 'Safari',
      screenResolution: '1170x2532',
      timezone: 'UTC',
      language: 'en-US',
    });

    const fp2 = generator.generate({
      os: 'iOS',
      browser: 'Chrome',
      screenResolution: '1170x2532',
      timezone: 'UTC',
      language: 'en-US',
    });

    const similarity = generator.calculateSimilarity(fp1, fp2);
    expect(similarity).toBe(80); // 4 out of 5 matches
  });
});
