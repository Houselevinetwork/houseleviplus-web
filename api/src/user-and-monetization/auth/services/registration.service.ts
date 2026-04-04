/**
 * Registration Service
 * Purpose: Handle user registration and signup
 * Location: api/src/user-and-monetization/auth/services/registration.service.ts
 * 
 * SINGLE RESPONSIBILITY: User signup only
 * Netflix-style: Two signup flows - traditional & email verification
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { RoleService } from '../../role/role.service';
import { SessionService } from './session.service';
import { DeviceService } from './device.service';
import { RefreshTokenService } from './refresh-token.service';
import { TokenService } from './token.service';
import { VerificationService } from './verification.service';
import * as crypto from 'crypto';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private sessionService: SessionService,
    private deviceService: DeviceService,
    private refreshTokenService: RefreshTokenService,
    private tokenService: TokenService,
    private verificationService: VerificationService,
  ) {}

  /**
   * Traditional registration (with password)
   */
  async registerWithPassword(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    roleId: string | null,
    deviceInfo: any,
    ipAddress: string,
  ) {
    // Check if email exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

// Get role
let role;
if (roleId) {
  role = await this.roleService.findById(roleId);
  if (!role) {
    throw new BadRequestException('Invalid role specified');
  }
} else {
  role = await this.roleService.findOrCreateDefaultRole();
}

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    // Normalize phone
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Create user
    const user = await this.userService.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phoneNumber: normalizedPhone,
      password,
      roleId: role._id,
      verificationToken,
      verificationTokenExpiry,
      emailVerified: false,
      isPremium: false,
      subscriptionStatus: 'free',
      isActive: true,
    });

    this.logger.log(`User registered: ${email}`);

    // Create session and tokens
    return this.createRegistrationResponse(user, role, deviceInfo, ipAddress);
  }

  /**
   * Email verification signup (Netflix-style)
   * User clicks verification link from email
   */
  async registerWithEmailVerification(
    token: string,
    deviceInfo: any,
    ipAddress: string,
  ) {
    // Verify token and get email
    const email = await this.verificationService.verifyToken(token);

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Account already exists. Please login.');
    }

    // Get default role
    const role = await this.roleService.findOrCreateDefaultRole();

    // Create user (no password - OTP only)
    const user = await this.userService.create({
      email: email.toLowerCase(),
      emailVerified: true, // Already verified via email link
      roleId: role._id,
      isPremium: false,
      subscriptionStatus: 'free',
      isActive: true,
      firstName: '',
      lastName: '',
      phoneNumber: '',
    });

    this.logger.log(`User registered via email verification: ${email}`);

    // Create session and tokens
    const response = await this.createRegistrationResponse(user, role, deviceInfo, ipAddress);

    // Add redirect instruction
    return {
      ...response,
      redirectTo: '/choose-plan',
    };
  }

  /**
   * Create registration response (shared logic)
   */
  private async createRegistrationResponse(user: any, role: any, deviceInfo: any, ipAddress: string) {
    // Register device
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

    // Create session
    const session = await this.sessionService.create({
      userId: user._id.toString(),
      deviceId: device._id.toString(),
      ipAddress,
      userAgent: deviceInfo.browser,
    });

    // Generate tokens
    const { token: refreshToken } = await this.refreshTokenService.generate(
      user._id.toString(),
      session._id.toString(),
      device._id.toString(),
      ipAddress,
    );

    const accessToken = this.tokenService.generateAccessToken(
      user._id.toString(),
      user.roleId.toString(),
      session.sessionId,
      device._id.toString(),
    );

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        role: role.name,
      },
      accessToken,
      refreshToken,
      expiresIn: 600,
    };
  }

  /**
   * Normalize phone number to Kenya format
   */
  private normalizePhoneNumber(phone: string): string {
    let normalized = phone.replace(/[\s\-\(\)]/g, '');

    if (normalized.startsWith('0')) {
      normalized = '254' + normalized.substring(1);
    } else if (normalized.startsWith('7') || normalized.startsWith('1')) {
      normalized = '254' + normalized;
    } else if (normalized.startsWith('+254')) {
      normalized = normalized.substring(1);
    }

    return normalized;
  }
}