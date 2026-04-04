// backend/src/user-and-monetization/auth/strategies/jwt.strategy.ts - FIXED
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-me',
    });
  }

  async validate(payload: any) {
    // Find user in database to verify they still exist and are active
    const user = await this.userService.findById(payload.userId || payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // ✅ CRITICAL FIX: Use roleId from JWT payload, NOT from database
    // The JWT already contains the correct roleId as a string
    // Fetching from database might give us a populated object or ObjectId
    
    return {
      userId: user._id.toString(),
      email: user.email,
      roleId: payload.roleId,  // ✅ FIXED: Use from JWT, not from database
      isPremium: user.isPremium || false,
      subscriptionStatus: user.subscriptionStatus || 'free',
      deviceId: payload.deviceId || null,
      sessionId: payload.sessionId || null,
      hasDeviceId: !!payload.deviceId,
      hasSessionId: !!payload.sessionId,
    };
  }
}