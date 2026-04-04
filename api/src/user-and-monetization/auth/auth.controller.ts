// src/user-and-monetization/auth/auth.controller.ts - NETFLIX-GRADE REFACTORED
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Query, 
  Delete,
  Param,
  UseGuards,
  Request,
  Logger,
  Ip,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { SessionService } from './services/session.service';
import { DeviceService } from './services/device.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EmailDiscoveryDto } from './dto/email-discovery.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { SignupRequestDto } from './dto/signup-request.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Types } from 'mongoose';
import { DeviceFingerprintHelper } from './helpers/device-fingerprint.helper';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly sessionService: SessionService,
    private readonly deviceService: DeviceService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(@Body() registerDto: RegisterDto, @Request() req, @Ip() ip: string) {
    const ipAddress = ip || '127.0.0.1';
    const deviceInfo = DeviceFingerprintHelper.fromRequest(req);
    registerDto.deviceInfo = deviceInfo;
    
    const result = await this.authService.register(registerDto, ipAddress);
    
    return {
      success: result.success,
      message: result.message,
      user: result.user,
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  async login(@Body() loginDto: LoginDto, @Request() req, @Ip() ip: string) {
    const ipAddress = ip || '127.0.0.1';
    const deviceInfo = DeviceFingerprintHelper.fromRequest(req);
    
    this.logger.log(`Login attempt for: ${loginDto.email} from ${deviceInfo.browser} on ${deviceInfo.os}`);
    
    loginDto.deviceInfo = deviceInfo;
    const result = await this.authService.login(loginDto, ipAddress);
    
    const response = {
      success: result.success,
      message: result.message,
      user: result.user,
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn
    };
    
    if (!response.refreshToken) {
      this.logger.error('❌ CRITICAL: refreshToken missing from response!');
    } else {
      this.logger.log(`✅ Login SUCCESS for ${loginDto.email}`);
    }
    
    return response;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Ip() ip: string) {
    const ipAddress = ip || '127.0.0.1';
    this.logger.log(`Token refresh attempt from IP: ${ipAddress}`);
    return this.authService.refreshToken(refreshTokenDto, ipAddress);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async logout(@Request() req, @Body() body: { refreshToken?: string }) {
    this.logger.log(`Logout for session: ${req.user.sessionId}`);
    const refreshToken = body?.refreshToken || '';
    return this.authService.logout(req.user.sessionId, refreshToken);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async getActiveSessions(@Request() req) {
    const sessions = await this.sessionService.getActiveSessions(req.user.userId);
    
    return {
      success: true,
      sessions: sessions.map(session => ({
        sessionId: session.sessionId,
        deviceType: (session.deviceId as any)?.deviceType,
        deviceName: (session.deviceId as any)?.deviceName,
        lastSeenAt: session.lastSeenAt,
        ipAddress: session.ipAddress,
        country: session.country,
        isCurrent: session.sessionId === req.user.sessionId,
      })),
    };
  }

  @Post('sessions/:sessionId/revoke')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async revokeSession(@Request() req, @Param('sessionId') sessionId: string) {
    await this.sessionService.revoke(sessionId, 'user_requested');
    return { success: true, message: 'Session revoked successfully' };
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async getDevices(@Request() req) {
    this.logger.log(`📱 Fetching devices for user: ${req.user.userId}`);
    
    const devices = await this.deviceService.getUserDevices(req.user.userId);
    
    return {
      success: true,
      count: devices.length,
      devices: devices.map(device => ({
        id: device._id.toString(),
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        deviceName: device.deviceName,
        os: device.os,
        browser: device.browser,
        lastSeenAt: device.lastSeenAt,
        lastSeenIp: device.lastSeenIp,
        loginCount: device.loginCount,
        firstSeenAt: device.firstSeenAt,
        active: device.active,
        trusted: device.trusted,
      })),
      maxDevices: 3,
    };
  }

  @Delete('devices/:deviceId')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async removeDevice(@Request() req, @Param('deviceId') deviceId: string) {
    this.logger.log(`User ${req.user.userId} removing device: ${deviceId}`);
    
    await this.deviceService.removeDevice(req.user.userId, deviceId);
    await this.sessionService.revokeDeviceSessions(deviceId);
    
    return { success: true, message: 'Device removed successfully' };
  }

  @Get('verify-email')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  async verifyEmail(@Query() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto.token);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto.token, resetDto.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async getProfile(@Request() req) {
    try {
      this.logger.log(`Getting profile for user ID: ${req.user.userId}`);
      
      const user = await this.userService.findById(req.user.userId);
      
      if (!user) {
        this.logger.error(`User not found: ${req.user.userId}`);
        return { success: false, error: 'User not found' };
      }

      let roleId: string;
      
      if (user.roleId instanceof Types.ObjectId) {
        roleId = user.roleId.toString();
      } else if (typeof user.roleId === 'object' && user.roleId !== null) {
        roleId = ((user.roleId as any)._id as Types.ObjectId).toString();
      } else {
        roleId = String(user.roleId);
      }

      const role = await this.roleService.findById(roleId);
      
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

      this.logger.log(`Profile retrieved for ${user.email} (role: ${userData.role})`);

      return { success: true, user: userData };
    } catch (error) {
      this.logger.error(`Error getting profile: ${error.message}`, error.stack);
      return { success: false, error: 'Failed to retrieve profile', message: error.message };
    }
  }
@Post('check-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async checkEmail(@Body() dto: { email: string }) {
    this.logger.log(`📧 Checking email: ${dto.email}`);
    return this.authService.emailDiscovery(dto.email);
  }
  @Post('email-discovery')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async emailDiscovery(@Body() dto: EmailDiscoveryDto) {
    return this.authService.emailDiscovery(dto.email);
  }

  // 🆕 NETFLIX-STYLE SIGNUP FLOW
  @Post('request-signup')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async requestSignup(@Body() dto: SignupRequestDto, @Ip() ip: string) {
    const ipAddress = ip || '127.0.0.1';
    this.logger.log(`Signup request for: ${dto.email} from IP: ${ipAddress}`);
    return this.authService.requestSignup(dto.email, ipAddress);
  }

  @Post('verify-token')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyToken(@Body() dto: VerifyTokenDto, @Request() req, @Ip() ip: string) {
    const ipAddress = ip || '127.0.0.1';
    const deviceInfo = DeviceFingerprintHelper.fromRequest(req);
    this.logger.log(`Token verification attempt from IP: ${ipAddress}`);
    return this.authService.verifyToken(dto.token, deviceInfo, ipAddress);
  }

  @Post('otp-request')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async requestOTP(@Body() dto: OtpRequestDto) {
    return this.authService.requestOTP(dto.email, dto.purpose);
  }

  @Post('otp-verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyOTP(@Body() dto: OtpVerifyDto, @Request() req, @Ip() ip: string) {
    const ipAddress = ip || '127.0.0.1';
    const deviceInfo = DeviceFingerprintHelper.fromRequest(req);
    return this.authService.verifyOTP(dto.email, dto.otp, deviceInfo, ipAddress);
  }
}