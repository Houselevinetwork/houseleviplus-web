import { describe, test, expect } from '@jest/globals';
import { AES256Encryption } from './aes-encryption';
import crypto from 'crypto';

describe('AES256 Encryption', () => {
  test('should encrypt and decrypt data', () => {
    const encryption = new AES256Encryption();
    const key = encryption.generateKey();
    const plaintext = 'Hello World';

    const encrypted = encryption.encrypt(plaintext, key);
    const decrypted = encryption.decrypt(encrypted, key);

    expect(decrypted).toBe(plaintext);
  });

  test('should generate unique IVs', () => {
    const encryption = new AES256Encryption();
    const key = encryption.generateKey();
    const plaintext = 'Test';

    const encrypted1 = encryption.encrypt(plaintext, key);
    const encrypted2 = encryption.encrypt(plaintext, key);

    expect(encrypted1.iv).not.toBe(encrypted2.iv);
  });
});
