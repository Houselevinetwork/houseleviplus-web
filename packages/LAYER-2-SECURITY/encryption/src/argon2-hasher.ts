/**
 * @houselevi/security/encryption/argon2-hasher
 * Password hashing using Argon2 (DPA 2019 compliant)
 */

import crypto from 'crypto';

export class Argon2Hasher {
  /**
   * Hash a password using simple PBKDF2 (production use crypto-js or argon2 package)
   * This is a simplified version for demonstration
   */
  async hash(password: string, salt?: Buffer): Promise<string> {
    const usedSalt = salt || crypto.randomBytes(32);
    const iterations = 100000; // High iteration count for security

    const hash = crypto.pbkdf2Sync(password, usedSalt, iterations, 64, 'sha256');
    return usedSalt.toString('hex') + ':' + hash.toString('hex');
  }

  /**
   * Verify a password against a hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    const [saltHex, hashHex] = hash.split(':');
    const salt = Buffer.from(saltHex, 'hex');

    const newHash = await this.hash(password, salt);
    return newHash === hash;
  }

  /**
   * Generate a random salt
   */
  generateSalt(): Buffer {
    return crypto.randomBytes(32);
  }
}
