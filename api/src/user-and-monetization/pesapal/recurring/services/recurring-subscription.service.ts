import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PesapalRecurringResponse } from '../../interfaces/pesapal-response.interface';

@Injectable()
export class RecurringSubscriptionService {
  constructor(
    @InjectModel('Payment') private paymentModel: Model<any>,
    @InjectModel('Subscription') private subscriptionModel: Model<any>,
  ) {}

  /**
   * Update payment record after PesaPal charges
   */
  async updatePaymentStatus(
    paymentId: string,
    pesapalResponse: PesapalRecurringResponse,
  ) {
    return this.paymentModel.findByIdAndUpdate(
      paymentId,
      {
        status: pesapalResponse.payment_status_description,
        pesapal_confirmation: pesapalResponse.confirmation_code,
        last_charged_at: new Date(),
        subscription_transaction_info:
          pesapalResponse.subscription_transaction_info,
      },
      { new: true },
    );
  }

  /**
   * Update subscription if payment successful
   */
  async updateSubscriptionAfterCharge(
    subscriptionId: string,
    frequency: string,
  ) {
    const nextChargeDate = this.calculateNextChargeDate(
      new Date(),
      frequency,
    );

    return this.subscriptionModel.findByIdAndUpdate(
      subscriptionId,
      {
        status: 'active',
        last_charged_at: new Date(),
        next_charge_date: nextChargeDate,
      },
      { new: true },
    );
  }

  private calculateNextChargeDate(lastCharge: Date, frequency: string): Date {
    const next = new Date(lastCharge);

    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }
}

