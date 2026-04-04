import { Types } from 'mongoose';

export interface ISubscription {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  planName: string;
  billingCycle: 'monthly' | 'quarterly' | 'half_year' | 'yearly';
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended';
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;
  transactionId?: Types.ObjectId;
  paymentReference?: string;
  autoRenew: boolean;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  cancellationReason?: string;
  metadata?: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    promoCode?: string;
    discount?: number;
  };
  statusHistory: Array<{
    date: Date;
    status: string;
    reason?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriptionResponse {
  subscription: ISubscription;
  daysRemaining: number;
  isActive: boolean;
}

export interface ISubscriptionCheck {
  hasActiveSubscription: boolean;
  subscription?: ISubscription;
  message: string;
}

export interface ICreateSubscriptionPayload {
  userId: string;
  planId: string;
  transactionId?: string;
  paymentReference?: string;
  metadata?: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    promoCode?: string;
    discount?: number;
  };
}

export interface IUpdateSubscriptionPayload {
  status?: 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended';
  autoRenew?: boolean;
  cancellationReason?: string;
}

export interface ICancelSubscriptionPayload {
  userId: string;
  reason?: string;
}