import * as crypto from 'crypto';

export class PKCEHelper {
  /**
   * Generate code challenge from verifier
   * S256: base64url(SHA256(verifier))
   */
  static generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Verify code challenge
   */
  static verifyCodeChallenge(verifier: string, challenge: string): boolean {
    const computed = this.generateCodeChallenge(verifier);
    return computed === challenge;
  }

  /**
   * Generate random code verifier (43-128 chars)
   */
  static generateCodeVerifier(): string {
    return crypto.randomBytes(64).toString('base64url');
  }
}
