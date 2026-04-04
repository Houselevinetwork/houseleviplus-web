import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionService } from '../subscription/subscription.service';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class PaymentEventListener {
  private readonly logger = new Logger(PaymentEventListener.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly billingService: BillingService,
  ) {}

  @OnEvent('payment.completed')
  async handlePaymentCompleted(payload: any) {
    try {
      this.logger.log(`💳 Payment Completed Event`);
      this.logger.log(`   Transaction ID: ${payload.transactionId}`);
      this.logger.log(`   Order Tracking: ${payload.orderTrackingId}`);

      const { userId, planId, transactionId } = payload;

      // Create subscription DTO
      const subscriptionDto = {
        userId: userId.toString(),
        planId: planId.toString(),
        transactionId: transactionId?.toString(),
        metadata: {
          ipAddress: payload.ipAddress,
          userAgent: payload.userAgent,
        },
      };

      // Plan details
      const planDetails = {
        planName: payload.planName,
        planType: payload.planType,
        amount: payload.amount,
        currency: payload.currency || 'KES',
      };

      // Create subscription
      const subscription = await this.subscriptionService.create(
        subscriptionDto,
        planDetails
      );

      // FIX: Access _id safely
      const subscriptionId = (subscription as any)._id?.toString();
      
      if (!subscriptionId) {
        throw new Error('Subscription ID not found');
      }

      this.logger.log(`✅ Subscription created: ${subscriptionId}`);

      // Activate the subscription
      await this.subscriptionService.activate({
        subscriptionId: subscriptionId,
        transactionId: transactionId?.toString(),
        paymentReference: payload.orderTrackingId,
      });

      this.logger.log(`✅ Subscription activated successfully`);
      
    } catch (error: any) {
      this.logger.error(`❌ Payment completion failed: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  @OnEvent('payment.failed')
  async handlePaymentFailed(payload: any) {
    try {
      this.logger.log(`❌ Payment Failed Event`);
      this.logger.log(`   Transaction ID: ${payload.transactionId}`);
      this.logger.log(`   Reason: ${payload.reason || 'Unknown'}`);
      
      // Could update billing status or send notification
      
    } catch (error: any) {
      this.logger.error(`Error handling payment failure: ${error.message}`);
    }
  }

  @OnEvent('payment.refunded')
  async handlePaymentRefunded(payload: any) {
    try {
      this.logger.log(`🔄 Payment Refunded Event`);
      this.logger.log(`   Transaction ID: ${payload.transactionId}`);
      this.logger.log(`   Amount: ${payload.amount}`);
      
      // Cancel subscription if exists
      if (payload.subscriptionId) {
        await this.subscriptionService.cancel({
          userId: payload.userId.toString(),
          reason: 'Payment refunded',
        }, payload.userId.toString());
        
        this.logger.log(`✅ Subscription cancelled due to refund`);
      }
      
    } catch (error: any) {
      this.logger.error(`Error handling refund: ${error.message}`);
    }
  }

  @OnEvent('payment.pending')
  async handlePaymentPending(payload: any) {
    this.logger.log(`⏳ Payment Pending Event`);
    this.logger.log(`   Transaction ID: ${payload.transactionId}`);
    this.logger.log(`   Status: Awaiting confirmation`);
  }
}