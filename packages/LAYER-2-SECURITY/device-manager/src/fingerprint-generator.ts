/**
 * @houselevi/security/device-manager/fingerprint-generator
 * Generate device fingerprints for identification
 */

import crypto from 'crypto';

export interface Fingerprint {
  os: string;
  browser: string;
  screenResolution: string;
  timezone: string;
  language: string;
  hash: string;
}

export class FingerprintGenerator {
  /**
   * Generate device fingerprint hash
   */
  generate(fingerprint: Omit<Fingerprint, 'hash'>): Fingerprint {
    const data = JSON.stringify(fingerprint);
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    return {
      ...fingerprint,
      hash,
    };
  }

  /**
   * Verify fingerprint matches
   */
  verify(current: Fingerprint, stored: Fingerprint): boolean {
    return current.hash === stored.hash;
  }

  /**
   * Calculate fingerprint similarity (0-100)
   */
  calculateSimilarity(fingerprint1: Fingerprint, fingerprint2: Fingerprint): number {
    let matches = 0;
    let total = 5; // OS, browser, screen, timezone, language

    if (fingerprint1.os === fingerprint2.os) matches++;
    if (fingerprint1.browser === fingerprint2.browser) matches++;
    if (fingerprint1.screenResolution === fingerprint2.screenResolution) matches++;
    if (fingerprint1.timezone === fingerprint2.timezone) matches++;
    if (fingerprint1.language === fingerprint2.language) matches++;

    return (matches / total) * 100;
  }
}
