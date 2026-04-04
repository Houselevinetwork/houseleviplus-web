// src/user-and-monetization/pesapal/dto/create-order.dto.ts
export type PlanType = 'monthly' | 'quarterly' | 'half_year' | 'yearly';

export interface BillingAddressDto {
  email_address: string;
  phone_number: string;
  first_name: string;
  last_name: string;
}

export interface CreateOrderDto {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id?: string;
  billing_address: BillingAddressDto;
  planType: PlanType;
}
