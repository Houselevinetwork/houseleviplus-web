import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StartRecurringDto } from '../dto/start-recurring.dto';
import { HandleIpnDto } from '../dto/handle-ipn.dto';
import { CancelRecurringDto } from '../dto/cancel-recurring.dto';
import { RecurringPaymentService } from './services/recurring-payment.service';
import { RecurringVerificationService } from './services/recurring-verification.service';
import { RecurringSubscriptionService } from './services/recurring-subscription.service';
import { RecurringCancellationService } from './services/recurring-cancellation.service';

@Injectable()
export class PesapalRecurringService {
  constructor(
    @InjectModel('Payment') private paymentModel: Model<any>,
    private paymentService: RecurringPaymentService,
    private verificationService: RecurringVerificationService,
    private subscriptionService: RecurringSubscriptionService,
    private cancellationService: RecurringCancellationService,
  ) {}

  /**
   * Start a recurring payment
   */
  async startRecurringPayment(dto: StartRecurringDto, user: any) {
    return this.paymentService.createRecurringPayment(dto, user);
  }

  /**
   * Handle PesaPal IPN Webhook
   */
  async handleRecurringIPN(data: HandleIpnDto) {
    try {
      if (data.OrderNotificationType !== 'RECURRING') {
        return { status: 400, message: 'Not a recurring payment notification' };
      }

      // Verify with PesaPal
      const paymentDetails = await this.verificationService.verifyPayment(
        data.OrderTrackingId,
      );

      // Find and update payment
      const payment = await this.paymentModel.findOne({
        pesapal_reference: data.OrderTrackingId,
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Update payment status
      await this.subscriptionService.updatePaymentStatus(
        payment._id,
        paymentDetails,
      );

      // Update subscription if successful
      if (paymentDetails.payment_status_description === 'Completed') {
        await this.subscriptionService.updateSubscriptionAfterCharge(
          payment.subscription_id,
          payment.recurring_frequency,
        );
      }

      return {
        orderNotificationType: 'RECURRING',
        orderTrackingId: data.OrderTrackingId,
        orderMerchantReference: data.OrderMerchantReference,
        status: 200,
      };
    } catch (error) {
      console.error('IPN handling error:', error);
      return { status: 500, message: 'Failed to process IPN' };
    }
  }

  /**
   * Cancel a recurring subscription
   */
  async cancelRecurringPayment(data: CancelRecurringDto) {
    return this.cancellationService.cancelSubscription(data);
  }
}
