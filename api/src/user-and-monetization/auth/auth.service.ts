/**
 * Auth Service (Orchestrator)
 * Purpose: Coordinate authentication flows
 * Location: api/src/user-and-monetization/auth/auth.service.ts
 *
 * NETFLIX-STYLE: Orchestrator pattern with 30-Day Remember Me
 * FIXED: requestOTP() checks email exists before sending
 * FIXED: refreshToken() expiresIn now matches JWT_EXPIRES_IN (7d = 604800s)
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { LoginService } from './services/login.service';
import { RegistrationService } from './services/registration.service';
import { PasswordService } from './services/password.service';
import { VerificationService } from './services/verification.service';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { SessionService } from './services/session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private loginService: LoginService,
    private registrationService: RegistrationService,
    private passwordService: PasswordService,
    private verificationService: VerificationService,
    private otpService: OtpService,
    private tokenService: TokenService,
    private refreshTokenService: RefreshTokenService,
    private sessionService: SessionService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 LOGIN
  // ═══════════════════════════════════════════════════════════════════════════

  async login(loginDto: LoginDto, ipAddress: string) {
    this.logger.log(`🔐 [LOGIN] Starting login flow for: ${loginDto.email}`);

    const result = await this.loginService.loginWithPassword(
      loginDto.email,
      loginDto.password,
      loginDto.deviceInfo,
      ipAddress,
    );

    this.logger.log(`✅ [LOGIN] Success for ${loginDto.email}`);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 REGISTER (Traditional)
  // ═══════════════════════════════════════════════════════════════════════════

  async register(registerDto: RegisterDto, ipAddress: string) {
    this.logger.log(`📝 [REGISTER] Starting registration for: ${registerDto.email}`);

    const result = await this.registrationService.registerWithPassword(
      registerDto.firstName,
      registerDto.lastName,
      registerDto.email,
      registerDto.phoneNumber,
      registerDto.password,
      registerDto.roleId || null,
      registerDto.deviceInfo,
      ipAddress,
    );

    this.logger.log(`✅ [REGISTER] Success for ${registerDto.email}`);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📧 EMAIL DISCOVERY (Check if email exists — returns action hint)
  // ═══════════════════════════════════════════════════════════════════════════

  async emailDiscovery(email: string) {
    this.logger.log(`📧 [EMAIL_DISCOVERY] Checking email: ${email}`);

    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.log(`ℹ️ [EMAIL_DISCOVERY] Email not found (new user): ${email}`);
      return {
        success: true,
        exists: false,
        hasPassword: false,
        isVerified: false,
        status: 'new',
        action: 'signup', // Frontend: call /auth/request-signup
        requiresOTP: false,
        canLoginWithPassword: false,
      };
    }

    this.logger.log(`✅ [EMAIL_DISCOVERY] Email exists: ${email}`);
    return {
      success: true,
      exists: true,
      hasPassword: !!user.password,
      isVerified: user.emailVerified,
      status: user.isActive ? 'active' : 'suspended',
      action: 'login', // Frontend: call /auth/otp-request
      userId: user._id.toString(),
      firstName: user.firstName,
      requiresOTP: true,
      canLoginWithPassword: !!user.password,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🆕 REQUEST SIGNUP (Netflix-style — for NEW users only)
  // ═══════════════════════════════════════════════════════════════════════════

  async requestSignup(email: string, ipAddress: string) {
    this.logger.log(`🆕 [REQUEST_SIGNUP] Starting signup for: ${email}`);

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`⚠️ [REQUEST_SIGNUP] Email already registered: ${email}`);
      throw new BadRequestException('Email already registered. Please login instead.');
    }

    // Rate limiting: max 3 verification emails per hour
    const canRequest = await this.verificationService.canRequestVerification(email);
    if (!canRequest) {
      this.logger.warn(`⚠️ [REQUEST_SIGNUP] Too many verification emails for: ${email}`);
      throw new BadRequestException(
        'Too many verification emails requested. Please try again later.',
      );
    }

    await this.verificationService.sendVerificationEmail(email, ipAddress);

    this.logger.log(`✅ [REQUEST_SIGNUP] Verification email sent to: ${email}`);
    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      expiresIn: 900, // 15 minutes — verification link lifetime
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ VERIFY TOKEN (Create account from email verification link)
  // ═══════════════════════════════════════════════════════════════════════════

  async verifyToken(token: string, deviceInfo: any, ipAddress: string) {
    this.logger.log(`✅ [VERIFY_TOKEN] Verifying signup token`);

    const result = await this.registrationService.registerWithEmailVerification(
      token,
      deviceInfo,
      ipAddress,
    );

    this.logger.log(`✅ [VERIFY_TOKEN] Token verified and account created`);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 OTP FLOWS (One-Time Password — for EXISTING users only)
  // ═══════════════════════════════════════════════════════════════════════════

  async requestOTP(email: string, purpose: string = 'login') {
    this.logger.log(`📬 [REQUEST_OTP] Requesting OTP for: ${email} (purpose: ${purpose})`);

    // CRITICAL: OTP is only for existing users
    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.error(`❌ [REQUEST_OTP] Email not found (new user): ${email}`);
      throw new BadRequestException(
        'Email not found. Please create an account first using the signup link.',
      );
    }

    this.logger.log(`✅ [REQUEST_OTP] User found, proceeding with OTP`);

    // Rate limiting: 60-second cooldown between requests
    const canResend = await this.otpService.canResend(email);

    if (!canResend) {
      this.logger.warn(`⚠️ [REQUEST_OTP] Rate limit exceeded for: ${email}`);
      throw new BadRequestException(
        'Please wait 60 seconds before requesting another code',
      );
    }

    await this.otpService.sendOTP(email, purpose);

    this.logger.log(`✅ [REQUEST_OTP] OTP sent to: ${email}`);
    return {
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 600,   // 10 minutes — OTP lifetime
      canResendIn: 60,  // 60-second cooldown
    };
  }

  async verifyOTP(email: string, otp: string, deviceInfo: any, ipAddress: string) {
    this.logger.log(`🔐 [VERIFY_OTP] Verifying OTP for: ${email}`);

    const result = await this.loginService.loginWithOTP(
      email,
      otp,
      deviceInfo,
      ipAddress,
    );

    this.logger.log(`✅ [VERIFY_OTP] OTP verified for: ${email}`);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔑 PASSWORD MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async forgotPassword(email: string) {
    this.logger.log(`🔑 [FORGOT_PASSWORD] Reset requested for: ${email}`);

    const result = await this.passwordService.requestPasswordReset(email);

    this.logger.log(`✅ [FORGOT_PASSWORD] Reset email sent to: ${email}`);
    return result;
  }

  async resetPassword(token: string, newPassword: string) {
    this.logger.log(`🔑 [RESET_PASSWORD] Attempting password reset`);

    const result = await this.passwordService.resetPassword(token, newPassword);

    this.logger.log(`✅ [RESET_PASSWORD] Password reset successful`);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔄 TOKEN REFRESH (30-Day Remember Me)
  //
  // Called automatically by AuthContext ~5 minutes before the access token
  // expires (every ~7 days with JWT_EXPIRES_IN=7d).
  // ═══════════════════════════════════════════════════════════════════════════

  async refreshToken(refreshTokenDto: RefreshTokenDto, ipAddress: string) {
    this.logger.log(`🔄 [REFRESH_TOKEN] Attempting to refresh access token`);

    try {
      // Step 1: Validate & rotate the refresh token (one-time use + reuse detection)
      const { token, userId, sessionId, deviceId } =
        await this.refreshTokenService.rotate(
          refreshTokenDto.refreshToken,
          ipAddress,
        );

      this.logger.log(`✅ [REFRESH_TOKEN] Refresh token validated and rotated`);

      // Step 2: Verify user still exists and is active
      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.error(`❌ [REFRESH_TOKEN] User not found: ${userId}`);
        await this.refreshTokenService.revoke(
          refreshTokenDto.refreshToken,
          'user_deleted',
        );
        throw new Error('User account no longer exists');
      }

      // Step 3: Verify user has a role assigned
      if (!user.roleId) {
        this.logger.error(`❌ [REFRESH_TOKEN] User has no role: ${userId}`);
        throw new Error('User role not configured');
      }

      // Step 4: Generate new access token (lifetime from JWT_EXPIRES_IN env var)
      const newAccessToken = this.tokenService.generateAccessToken(
        userId,
        user.roleId.toString(),
        sessionId,
        deviceId,
      );

      this.logger.log(
        `✅ [REFRESH_TOKEN] New access token issued (expiry from JWT_EXPIRES_IN)`,
      );

      // Step 5: Update session last activity — resets the 30-day inactivity clock
      await this.sessionService.updateLastActivity(sessionId);
      this.logger.log(
        `⏰ [REFRESH_TOKEN] Session activity updated (30-day timer extended)`,
      );

      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: token,          // New rotated refresh token (30-day window preserved)
        expiresIn: 7 * 24 * 60 * 60, // 604800s — matches JWT_EXPIRES_IN=7d
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error(`❌ [REFRESH_TOKEN] Error: ${error.message}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 👋 LOGOUT (Revoke tokens & end session)
  // ═══════════════════════════════════════════════════════════════════════════

  async logout(sessionId: string, refreshToken: string) {
    this.logger.log(`👋 [LOGOUT] Logging out session: ${sessionId}`);

    try {
      if (refreshToken) {
        await this.refreshTokenService.revoke(refreshToken, 'user_logout');
        this.logger.log(`🔄 [LOGOUT] Refresh token revoked`);
      }

      await this.sessionService.revoke(sessionId, 'user_logout');
      this.logger.log(`⏹️ [LOGOUT] Session ended`);

      this.logger.log(`✅ [LOGOUT] Logout successful`);
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error(`❌ [LOGOUT] Error: ${error.message}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔓 LOGOUT ALL DEVICES
  // ═══════════════════════════════════════════════════════════════════════════

  async logoutAllDevices(userId: string) {
    this.logger.log(
      `🔄 [LOGOUT_ALL] Logging out all devices for user: ${userId}`,
    );

    try {
      const revokedCount = await this.refreshTokenService.revokeAllUserTokens(
        userId,
        'user_logout_all',
      );
      this.logger.log(`🔄 [LOGOUT_ALL] ${revokedCount} refresh tokens revoked`);

      const sessions = await this.sessionService.getActiveSessions(userId);
      this.logger.log(
        `📋 [LOGOUT_ALL] Found ${sessions.length} active sessions`,
      );

      for (const session of sessions) {
        await this.sessionService.revoke(session.sessionId, 'user_logout_all');
      }
      this.logger.log(`⏹️ [LOGOUT_ALL] ${sessions.length} sessions ended`);

      this.logger.log(`✅ [LOGOUT_ALL] All devices logged out`);
      return {
        success: true,
        message: 'Logged out from all devices',
        sessionsRevoked: sessions.length,
        tokensRevoked: revokedCount,
      };
    } catch (error) {
      this.logger.error(`❌ [LOGOUT_ALL] Error: ${error.message}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 👤 GET USER PROFILE
  // ═══════════════════════════════════════════════════════════════════════════

  async getUserProfile(userId: string) {
    this.logger.log(`👤 [GET_PROFILE] Fetching profile for user: ${userId}`);

    try {
      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.error(`❌ [GET_PROFILE] User not found: ${userId}`);
        throw new Error('User not found');
      }

      const role = await this.roleService.findById(user.roleId?.toString());

      const userData = {
        id: user._id.toString(),
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        isActive: user.isActive,
        role: role?.name || 'user',
        permissions: role?.permissions || [],
      };

      this.logger.log(
        `✅ [GET_PROFILE] Profile retrieved for ${user.email} (role: ${userData.role})`,
      );
      return { success: true, user: userData };
    } catch (error) {
      this.logger.error(`❌ [GET_PROFILE] Error: ${error.message}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ VERIFY EMAIL (Legacy flow — kept for compatibility)
  // ═══════════════════════════════════════════════════════════════════════════

  async verifyEmail(token: string) {
    this.logger.log(`✅ [VERIFY_EMAIL] Verifying email with token`);

    try {
      const user = await this.userService.findByVerificationToken(token);

      if (!user) {
        this.logger.error(`❌ [VERIFY_EMAIL] Invalid or expired token`);
        throw new Error('Invalid or expired verification token');
      }

      await this.userService.updateUser(user._id.toString(), {
        emailVerified: true,
        verificationToken: undefined,
        verificationTokenExpiry: undefined,
      });

      const role = await this.roleService.findById(user.roleId.toString());

      this.logger.log(`✅ [VERIFY_EMAIL] Email verified for ${user.email}`);
      return {
        success: true,
        message: 'Email verified successfully',
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          emailVerified: true,
          isPremium: user.isPremium,
          subscriptionStatus: user.subscriptionStatus,
          role: role?.name || 'user',
        },
      };
    } catch (error) {
      this.logger.error(`❌ [VERIFY_EMAIL] Error: ${error.message}`);
      throw error;
    }
  }
}