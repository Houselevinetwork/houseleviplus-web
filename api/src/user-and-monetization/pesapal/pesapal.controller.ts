import { Controller, Post, Get, Body, Param, HttpCode, Logger, Query } from '@nestjs/common';
import { PesapalService } from './pesapal.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { CreateOrderDto } from './dto/pesapal.dto';

@Controller('pesapal')
export class PesapalController {
  private readonly logger = new Logger(PesapalController.name);

  constructor(
    private readonly pesapalService: PesapalService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('create-order')
  @HttpCode(200)
  async createOrder(@Body() dto: CreateOrderDto) {
    this.logger.log('➡️ Incoming order body:');
    this.logger.debug(JSON.stringify(dto));

    if (!dto.userId || !dto.email || !dto.amount) {
      this.logger.warn('❌ Missing required fields in CreateOrderDto');
      return { success: false, message: 'Missing required order fields' };
    }

    try {
      const result = await this.pesapalService.createOrder(dto);
      this.logger.log(`✅ Order created successfully: ${result.orderId}`);

      return {
        success: true,
        redirectUrl: result.redirectUrl,
        trackingId: result.trackingId,
        merchantReference: result.merchantReference,
        planName: dto.planName,
        userId: dto.userId,
      };
    } catch (error: any) {
      this.logger.error('❌ Error creating order:', error.stack || error.message);
      return { success: false, message: error.message || 'Unknown error creating order' };
    }
  }

  @Get('callback')
  async handleCallbackGet(@Query() query: any) {
    this.logger.log('📥 Pesapal GET callback query:');
    this.logger.debug(JSON.stringify(query));

    const orderTrackingId = query.OrderTrackingId || query.orderTrackingId;
    if (!orderTrackingId) return { success: false, message: 'Missing OrderTrackingId in query' };

    try {
      const result = await this.pesapalService.handlePaymentCallback(orderTrackingId);
      this.logger.log(`✅ Callback processed for order: ${orderTrackingId}`);
      return { success: true, result };
    } catch (error: any) {
      this.logger.error('❌ Error processing callback:', error.stack || error.message);
      return { success: false, message: error.message };
    }
  }

  @Post('callback')
  @HttpCode(200)
  async handleCallbackPost(@Body() body: any) {
    this.logger.log('📥 Pesapal POST callback body:');
    this.logger.debug(JSON.stringify(body));

    const orderTrackingId = body.OrderTrackingId || body.orderTrackingId;
    if (!orderTrackingId) return { success: false, message: 'Missing OrderTrackingId in body' };

    try {
      const result = await this.pesapalService.handlePaymentCallback(orderTrackingId);
      this.logger.log(`✅ IPN processed for order: ${orderTrackingId}`);
      return { success: true, result };
    } catch (error: any) {
      this.logger.error('❌ Error processing IPN:', error.stack || error.message);
      return { success: false, message: error.message };
    }
  }

  @Get('order/:trackingId/status')
  async getOrderStatus(@Param('trackingId') trackingId: string) {
    this.logger.log(`🔍 Checking status for trackingId: ${trackingId}`);

    try {
      const status = await this.pesapalService.getTransactionStatus(trackingId);
      this.logger.debug(`📦 Status response: ${JSON.stringify(status)}`);

      return {
        success: true,
        status: status.payment_status || status.status || 'UNKNOWN',
        raw: status,
      };
    } catch (error: any) {
      this.logger.error('❌ Error getting status:', error.stack || error.message);
      return { success: false, status: 'ERROR', message: error.message };
    }
  }

  @Post('verify')
  @HttpCode(200)
  async verifyPayment(
    @Body()
    body: {
      orderTrackingId: string;
      userId: string;
      planType: 'monthly' | 'quarterly' | 'half_year' | 'yearly';
      amount: number;
      planId?: string;
    },
  ) {
    const { orderTrackingId, userId, planType, amount, planId } = body;

    if (!orderTrackingId || !userId) {
      this.logger.warn('❌ Missing orderTrackingId or userId for verification');
      return { success: false, message: 'Missing orderTrackingId or userId' };
    }

    this.logger.log(`✅ Verifying payment for orderTrackingId: ${orderTrackingId}`);

    try {
      const status = await this.pesapalService.getTransactionStatus(orderTrackingId);
      this.logger.debug(`📦 Pesapal status response: ${JSON.stringify(status)}`);

      const paymentStatus =
        status?.payment_status_description || status?.payment_status || status?.status || status?.paymentStatus;

      const normalizedStatus = (paymentStatus || '').toUpperCase();
      const isCompleted = ['COMPLETED', 'PAID', 'SUCCESS'].includes(normalizedStatus);

      if (isCompleted) {
        this.logger.log(`✅ Payment verified as COMPLETED for order: ${orderTrackingId}`);

        // Create subscription using the correct method
        const subscription = await this.subscriptionService.create(
          {
            userId,
            planId: planId || `${planType}_plan`,
            metadata: { orderTrackingId },
          },
          {
            planName: this.getPlanName(planType),
            planType,
            amount,
            currency: 'KES',
          },
        );

        // Get subscription ID safely
        const subscriptionId = (subscription as any)._id?.toString();

        // Activate the subscription
        if (subscriptionId) {
          await this.subscriptionService.activateSubscription(subscriptionId);
          this.logger.log(`✅ Subscription activated with ID: ${subscriptionId}`);
        }

        return {
          success: true,
          status: normalizedStatus,
          message: 'Payment verified and subscription activated',
          orderTrackingId,
          userId,
          planType,
          subscriptionId,
        };
      } else if (normalizedStatus === 'PENDING') {
        return { success: false, status: 'PENDING', message: 'Payment is still pending', orderTrackingId };
      } else {
        return { success: false, status: normalizedStatus, message: 'Payment failed or invalid', orderTrackingId };
      }
    } catch (error: any) {
      this.logger.error(`❌ Error verifying payment: ${error.stack || error.message}`);
      return { success: false, status: 'ERROR', message: 'Error verifying payment', error: error.message };
    }
  }

  @Get('orders/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    this.logger.log(`📋 Fetching orders for user: ${userId}`);

    try {
      const orders = await this.pesapalService.getUserOrders(userId);
      return { success: true, orders };
    } catch (error: any) {
      this.logger.error('❌ Error fetching orders:', error.stack || error.message);
      return { success: false, message: error.message };
    }
  }

  @Get('order/:orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    this.logger.log(`📦 Fetching order: ${orderId}`);

    try {
      const order = await this.pesapalService.getOrderById(orderId);
      return { success: true, order };
    } catch (error: any) {
      this.logger.error('❌ Error fetching order:', error.stack || error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Helper method to get plan name from plan type
   */
  private getPlanName(planType: string): string {
    const planNames: Record<string, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      half_year: 'Half Year',
      yearly: 'Annual',
    };
    return planNames[planType] || 'Monthly';
  }
}
