/**
 * @houselevi/security/encryption/jwt-manager
 * JWT token creation and validation
 */

import crypto from 'crypto';

export interface JWTPayload {
  userId: string;
  deviceId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export class JWTManager {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a JWT token
   */
  sign(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds: number = 1800): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const base64UrlEncode = (obj: any) => {
      return Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    const headerEncoded = base64UrlEncode(header);
    const payloadEncoded = base64UrlEncode(fullPayload);
    const message = `${headerEncoded}.${payloadEncoded}`;

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${message}.${signature}`;
  }

  /**
   * Verify and decode JWT token
   */
  verify(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const message = `${parts[0]}.${parts[1]}`;
      const signature = crypto
        .createHmac('sha256', this.secret)
        .update(message)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      if (signature !== parts[2]) return null;

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token expired
      }

      return payload;
    } catch {
      return null;
    }
  }
}
