/**
 * Token Service
 * Purpose: JWT token generation and validation
 * Location: api/src/user-and-monetization/auth/services/token.service.ts
 *
 * SINGLE RESPONSIBILITY: Token operations only
 * Netflix-style: Focused, testable, reusable
 *
 * TOKEN LIFETIMES (read from .env):
 *   Access Token  → JWT_EXPIRES_IN          (default: 7d)
 *   OTP codes     → handled in otp.service  (10 minutes)
 *   Verify links  → handled in verification  (15 minutes)
 *   Refresh Token → handled in refresh-token.service (30 days)
 */

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate Access Token
   *
   * Reads expiry from env in this priority order:
   *   1. JWT_ACCESS_TOKEN_EXPIRY  (most specific)
   *   2. JWT_EXPIRES_IN           (your current .env value: 7d)
   *   3. '7d'                     (safe fallback)
   *
   * NOTE: OTP (10m) and verification links (15m) are intentionally
   * short-lived and are managed by their own services — NOT here.
   */
  generateAccessToken(
    userId: string,
    roleId: string,
    sessionId: string,
    deviceId: string,
  ): string {
    const payload = {
      userId,
      roleId,
      sessionId,
      deviceId,
      hasDeviceId: true,
      hasSessionId: true,
      iat: Math.floor(Date.now() / 1000),
    };

    const secret = this.configService.get<string>('JWT_SECRET');

    // Read from env — cast to JwtSignOptions['expiresIn'] because
    // ConfigService returns plain string but @nestjs/jwt expects
    // the branded StringValue type from the 'ms' package.
    const expiresIn = (
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY') ||
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      '7d'
    ) as JwtSignOptions['expiresIn'];

    this.logger.debug(`Generating access token — expiresIn: ${expiresIn}`);

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      this.logger.error(`Failed to decode token: ${error.message}`);
      return null;
    }
  }

  /**
   * Verify token is valid
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      return this.jwtService.verify(token, { secret });
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }
}