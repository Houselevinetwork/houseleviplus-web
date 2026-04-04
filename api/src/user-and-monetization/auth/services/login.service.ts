/**
 * Login Service
 * Purpose: Handle user login operations
 * Location: api/src/user-and-monetization/auth/services/login.service.ts
 *
 * SINGLE RESPONSIBILITY: Login flow only
 * Netflix-style: Password & OTP login
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { RoleService } from '../../role/role.service';
import { SessionService } from './session.service';
import { DeviceService } from './device.service';
import { RefreshTokenService } from './refresh-token.service';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';

// Converts a string like '7d', '30d', '1h' into seconds
function parseDurationToSeconds(duration: string): number {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  if (isNaN(value)) return 7 * 24 * 60 * 60; // fallback: 7 days
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default:  return 7 * 24 * 60 * 60;
  }
}

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private sessionService: SessionService,
    private deviceService: DeviceService,
    private refreshTokenService: RefreshTokenService,
    private tokenService: TokenService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) {}

  /**
   * Login with password
   */
  async loginWithPassword(
    email: string,
    password: string,
    deviceInfo: any,
    ipAddress: string,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is suspended');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createLoginResponse(user, deviceInfo, ipAddress);
  }

  /**
   * Login with OTP
   */
  async loginWithOTP(
    email: string,
    otp: string,
    deviceInfo: any,
    ipAddress: string,
  ) {
    // Verify OTP (10-minute window enforced inside OtpService)
    await this.otpService.verifyOTP(email, otp);

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found. Please sign up first.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is suspended');
    }

    return this.createLoginResponse(user, deviceInfo, ipAddress);
  }

  /**
   * Create login response (shared logic)
   */
  private async createLoginResponse(user: any, deviceInfo: any, ipAddress: string) {
    // Register / update device
    const device = await this.deviceService.registerOrUpdate({
      userId: user._id.toString(),
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      appVersion: deviceInfo.appVersion,
      ipAddress,
    });

    // Create session (30-day expiry handled inside SessionService)
    const session = await this.sessionService.create({
      userId: user._id.toString(),
      deviceId: device._id.toString(),
      ipAddress,
      userAgent: deviceInfo.browser,
    });

    // Generate refresh token (30-day expiry hardcoded in RefreshTokenService)
    const { token: refreshToken } = await this.refreshTokenService.generate(
      user._id.toString(),
      session._id.toString(),
      device._id.toString(),
      ipAddress,
    );

    // Generate access token (expiry from JWT_EXPIRES_IN env var, default 7d)
    const accessToken = this.tokenService.generateAccessToken(
      user._id.toString(),
      user.roleId.toString(),
      session.sessionId,
      device._id.toString(),
    );

    // Update last login timestamp
    await this.userService.updateLastLogin(user._id.toString());

    // Get role name
    const role = await this.roleService.findById(user.roleId.toString());

    // ✅ FIXED: read expiry from env so the frontend knows the real lifetime.
    // parseDurationToSeconds('7d') → 604800  (7 days in seconds)
    const jwtExpiry =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY') ||
      this.configService.get<string>('JWT_EXPIRES_IN') ||
      '7d';
    const expiresIn = parseDurationToSeconds(jwtExpiry);

    this.logger.log(
      `✅ Login successful for ${user.email} — token expires in ${jwtExpiry} (${expiresIn}s)`,
    );

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        role: role?.name || 'user',
      },
      accessToken,
      refreshToken,         // 30-day token for silent re-auth
      expiresIn,            // ✅ now matches JWT_EXPIRES_IN (e.g. 604800 for 7d)
    };
  }
}