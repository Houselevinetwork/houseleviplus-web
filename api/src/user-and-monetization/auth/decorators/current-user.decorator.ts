import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 👤 CurrentUserData Interface
 * 
 * Represents the authenticated user data extracted from JWT token
 * This is the payload that was signed when token was created
 */
export interface CurrentUserData {
  /** User ID (MongoDB ObjectId as string) */
  sub: string;
  
  /** User email */
  email: string;
  
  /** Issued at timestamp (optional) */
  iat?: number;
  
  /** Expiration timestamp (optional) */
  exp?: number;
}

/**
 * 👤 @CurrentUser() Decorator
 * 
 * Extracts the current authenticated user from the JWT token
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@CurrentUser() user: CurrentUserData) {
 *   console.log(user.sub);    // User ID
 *   console.log(user.email);  // User email
 * }
 * 
 * Returns the JWT payload: { sub, email, iat, exp }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    
    // request.user is populated by JwtStrategy after JWT validation
    if (!request.user) {
      throw new Error('User not found in request. Ensure @UseGuards(JwtAuthGuard) is applied.');
    }
    
    return request.user as CurrentUserData;
  },
);