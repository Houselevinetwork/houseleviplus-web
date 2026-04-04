// src/user-and-monetization/pesapal/dto/initiate-payment.dto.ts
import { PlanType } from './create-order.dto';

export interface InitiatePaymentDto {
  userId: string;
  planId: string;
  planName: string;
  billingCycle: PlanType;
  amount: number;
  currency?: string;
  description?: string;
  callbackUrl?: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
}
