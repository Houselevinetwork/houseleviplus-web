import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface SubscriptionPlan {
  name: string;
  price: number;
}

@Injectable()
export class SubscriptionPlanValidatorService {
  private readonly plans: Record<string, number> = {
    mobile: 499,
    standard: 999,
    premium: 1499,
  };

  async validate(planName: string, amount: number): Promise<SubscriptionPlan> {
    if (!this.plans[planName] || this.plans[planName] !== amount) {
      throw new HttpException(
        'Invalid subscription plan or amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      name: planName.toUpperCase(),
      price: amount,
    };
  }

  getPlanPrice(planName: string): number | null {
    return this.plans[planName] || null;
  }

  getAllPlans(): Record<string, number> {
    return this.plans;
  }
}
