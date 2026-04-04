import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CancelRecurringDto } from '../../dto/cancel-recurring.dto';

@Injectable()
export class RecurringCancellationService {
  constructor(
    @InjectModel('Payment') private paymentModel: Model<any>,
    @InjectModel('Subscription') private subscriptionModel: Model<any>,
  ) {}

  async cancelSubscription(data: CancelRecurringDto) {
    try {
      const subscription = await this.subscriptionModel.findById(
        data.subscriptionId,
      );

      if (!subscription) {
        throw new HttpException(
          'Subscription not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Mark subscription as cancelled
      subscription.status = 'cancelled';
      subscription.cancelled_at = new Date();
      subscription.cancellation_reason =
        data.reason || 'User requested cancellation';
      await subscription.save();

      // Cancel all related pending payments
      await this.paymentModel.updateMany(
        { subscription_id: data.subscriptionId, status: 'pending' },
        { status: 'cancelled' },
      );

      // TODO: Call PesaPal API to cancel recurring
      // await this.pesapalService.cancelWithPesaPal(subscription.correlation_id);

      return {
        success: true,
        message: 'Subscription cancelled successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to cancel subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

