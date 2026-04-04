import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEAR = 'half_year',
  YEARLY = 'yearly',
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true }) // FIX: Changed from ObjectId to String
  planId: string;

  @Prop({ required: true })
  planName: string;

  @Prop({ required: true, enum: BillingCycle })
  billingCycle: BillingCycle;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'KES' })
  currency: string;

  @Prop({ 
    type: String, 
    enum: SubscriptionStatus, 
    default: SubscriptionStatus.PENDING,
    index: true 
  })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop()
  nextBillingDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  transactionId?: Types.ObjectId;

  @Prop()
  paymentReference?: string;

  @Prop({ default: false })
  autoRenew: boolean;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Object })
  metadata?: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    promoCode?: string;
    discount?: number;
  };

  @Prop({ type: [{ date: Date, status: String, reason: String }] })
  statusHistory: Array<{
    date: Date;
    status: SubscriptionStatus;
    reason?: string;
  }>;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Indexes for performance
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1, status: 1 });
SubscriptionSchema.index({ createdAt: -1 });

// Pre-save hook to update status history
SubscriptionSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    this.statusHistory.push({
      date: new Date(),
      status: this.status,
      reason: 'Status updated',
    });
  }
  next();
});