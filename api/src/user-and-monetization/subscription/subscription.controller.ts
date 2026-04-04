import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  async getPlans(@Ip() ip: string, @Request() req: any) {
    const ipAddress = req.headers['x-forwarded-for'] || ip || '127.0.0.1';
    const data = await this.subscriptionService.getAvailablePlans(ipAddress);
    return { success: true, data, message: 'Plans retrieved successfully' };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getStatus(@Request() req: any) {
    const subscription = await this.subscriptionService.getUserSubscription(req.user.userId);

    if (!subscription) {
      return { success: true, hasActiveSubscription: false, status: 'none', data: null };
    }

    return {
      success: true,
      hasActiveSubscription: subscription.isActive,
      status: subscription.isActive ? 'active' : 'expired',
      data: subscription.subscription,
      daysRemaining: subscription.daysRemaining,
    };
  }

  @Get('check/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkSubscription(@Param('userId') userId: string) {
    const result = await this.subscriptionService.checkSubscription(userId);
    return { success: true, data: result };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserSubscription(@Param('userId') userId: string, @Request() req: any) {
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return { success: false, data: null, message: 'Unauthorized' };
    }

    const subscription = await this.subscriptionService.getUserSubscription(userId);

    if (!subscription) {
      return { success: true, data: { subscription: null, isActive: false } };
    }

    return {
      success: true,
      data: {
        subscription: subscription.subscription,
        isActive: subscription.isActive,
        daysRemaining: subscription.daysRemaining,
      },
    };
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancel(@Body() cancelDto: CancelSubscriptionDto, @Request() req: any) {
    const subscription = await this.subscriptionService.cancel(cancelDto, req.user.userId);
    return { success: true, data: subscription, message: 'Subscription cancelled' };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    const subscription = await this.subscriptionService.findById(id);
    return { success: true, data: subscription };
  }
}