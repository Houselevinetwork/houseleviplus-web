import crypto from 'crypto';

declare global {
  namespace NodeJS {
    interface CipherCCMTypes {}
  }
}

export interface EncryptedData {
  iv: string;
  encryptedData: string;
  authTag: string;
}

export class AES256Encryption {
  private algorithm = 'aes-256-gcm';

  encrypt(plaintext: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = (cipher as any).getAuthTag();

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(encrypted: EncryptedData, key: Buffer): string {
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    (decipher as any).setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  generateKey(): Buffer {
    return crypto.randomBytes(32);
  }
}
