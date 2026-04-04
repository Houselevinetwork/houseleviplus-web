// backend/src/user-and-monetization/auth/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 🔒 JWT Auth Guard (Required Authentication)
 * 
 * Blocks access if user is not authenticated with valid JWT token
 * Used for protected endpoints that require login
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@Request() req) {
 *   const userId = req.user.userId; // Always defined
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom authentication logic here if needed
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw an unauthorized exception
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing authentication token');
    }
    return user;
  }
}