import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillingDocument = Billing & Document;

export enum BillingStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEAR = 'half_year',
  ANNUALLY = 'annually',
}

@Schema({ timestamps: true })
export class Billing {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', index: true })
  subscriptionId?: Types.ObjectId;

  /**
   * Important:
   * Pesapal transactionId is ALWAYS a string (trackingId/orderTrackingId), not a Mongo ObjectId.
   */
  @Prop({ type: String })
  transactionId?: string;

  @Prop({ required: true, unique: true, sparse: true })
  invoiceNumber: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'KES' })
  currency: string;

  /**
   * Only accept your 4 supported billing cycles.
   */
  @Prop({
    required: true,
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @Prop({
    type: String,
    enum: BillingStatus,
    default: BillingStatus.PENDING,
    index: true,
  })
  status: BillingStatus;

  @Prop()
  description?: string;

  /**
   * Pesapal reference — MUST be indexed.
   */
  @Prop({ index: true })
  paymentReference?: string;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop()
  notes?: string;

  /**
   * Metadata now stored as a Map for better MongoDB consistency.
   */
  @Prop({ type: Map, of: Object })
  metadata?: Record<string, any>;
}

export const BillingSchema = SchemaFactory.createForClass(Billing);

// Compound indexes only (removed duplicate single-field indexes)
BillingSchema.index({ userId: 1, createdAt: -1 });
BillingSchema.index({ status: 1, createdAt: -1 });