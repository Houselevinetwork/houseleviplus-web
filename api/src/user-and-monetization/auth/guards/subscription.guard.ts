// src/user-and-monetization/auth/guards/subscription.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { SubscriptionService } from '../../subscription/subscription.service';

/**
 * 🔐 SUBSCRIPTION GUARD - Netflix-Grade Content Access Control
 * 
 * PURPOSE:
 * - Enforces active subscription requirement for premium content
 * - Real-time database validation (NOT from JWT payload)
 * - Blocks access immediately when subscription expires
 * 
 * USAGE:
 * @UseGuards(JwtAuthGuard, SubscriptionGuard)
 * @Get('premium-video')
 * async getVideo() { }
 * 
 * SECURITY MODEL:
 * - JWT validates identity (who you are)
 * - SubscriptionGuard validates entitlement (what you can access)
 * - Subscription status checked on EVERY request
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user']; // Set by JwtAuthGuard

    if (!user || !user.userId) {
      this.logger.warn('❌ No user found in request - JwtAuthGuard not applied?');
      throw new ForbiddenException('Authentication required');
    }

    try {
      // 🔐 CRITICAL: Real-time subscription check
      const subscriptionCheck = await this.subscriptionService.checkSubscription(user.userId);

      if (!subscriptionCheck.hasActiveSubscription) {
        this.logger.warn(`❌ Subscription required for user: ${user.userId}`);
        throw new ForbiddenException({
          statusCode: 403,
          message: 'Active subscription required to access this content',
          error: 'SUBSCRIPTION_REQUIRED',
          details: {
            hasActiveSubscription: false,
            redirectTo: '/subscribe',
          },
        });
      }

      // ✅ Attach subscription details to request (for logging/analytics)
      request['subscription'] = subscriptionCheck.subscription;

      this.logger.debug(`✅ Subscription verified for user: ${user.userId}`);
      return true;
      
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`❌ Subscription check failed: ${error.message}`);
      throw new ForbiddenException('Unable to verify subscription status');
    }
  }
}