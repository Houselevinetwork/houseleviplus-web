// backend/src/user-and-monetization/auth/guards/optional-jwt-auth.guard.ts
// CREATE THIS NEW FILE

import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CanActivate } from '@nestjs/common';

/**
 * 🔓 Optional JWT Auth Guard
 * 
 * Allows public access but attaches user info if JWT token is present
 * Used for content discovery endpoints that work for both:
 * - Logged-in users (gets personalized recommendations)
 * - Anonymous users (gets general catalog)
 * 
 * Usage:
 * @UseGuards(OptionalJwtAuthGuard)
 * @Get('content/home')
 * async getHome(@Request() req) {
 *   const userId = req.user?.userId; // undefined if anonymous
 * }
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // No token = public access (req.user will be undefined)
      return true;
    }

    try {
      // Verify token and attach user to request
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret: jwtSecret });
      
      // Attach user payload to request
      request['user'] = payload;
    } catch (error) {
      // Invalid token = treat as anonymous (don't throw error)
      // This allows degraded access for users with expired tokens
    }

    // Always allow request to proceed
    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1];
  }
}