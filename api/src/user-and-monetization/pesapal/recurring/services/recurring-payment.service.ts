import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StartRecurringDto } from '../../dto/start-recurring.dto';
import { SubscriptionPlanValidatorService } from './subscription-plan-validator.service';

@Injectable()
export class RecurringPaymentService {
  constructor(
    @InjectModel('Payment') private paymentModel: Model<any>,
    private planValidator: SubscriptionPlanValidatorService,
  ) {}

  async createRecurringPayment(data: StartRecurringDto, user: any) {
    try {
      // Validate plan
      const plan = await this.planValidator.validate(
        data.subscriptionPlan,
        data.amount,
      );

      // Create PesaPal order object
      const pesapalOrder = this.buildPesapalOrder(data, plan, user);

      // Save to database
      const payment = await this.paymentModel.create({
        user_id: data.userId,
        amount: data.amount,
        currency: 'KES',
        payment_method: 'card',
        status: 'pending',
        is_recurring: true,
        recurring_frequency: data.frequency,
        subscription_details: {
          start_date: data.startDate,
          end_date: data.endDate,
          frequency: data.frequency,
        },
        pesapal_reference: pesapalOrder.id,
        created_at: new Date(),
      });

      return {
        success: true,
        payment_id: payment._id,
        pesapal_order: pesapalOrder,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create recurring payment: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private buildPesapalOrder(data: StartRecurringDto, plan: any, user: any) {
    return {
      id: `sub_${data.userId}_${Date.now()}`,
      currency: 'KES',
      amount: data.amount,
      description: `${plan.name} - Subscription`,
      account_number: data.userId,
      subscription_details: {
        start_date: this.formatDate(data.startDate),
        end_date: this.formatDate(data.endDate),
        frequency: data.frequency,
      },
      billing_address: {
        email_address: user.email,
        phone_number: user.phone,
        first_name: user.firstName,
        last_name: user.lastName,
        country_code: 'KE',
      },
    };
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

