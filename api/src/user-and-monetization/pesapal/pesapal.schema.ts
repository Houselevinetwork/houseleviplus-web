import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PesapalOrder extends Document {
  declare _id: Types.ObjectId;   // ✅ Correct fix

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['monthly', 'quarterly', 'half_year', 'yearly'] })
  planType: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  orderStatus: string;

  @Prop()
  pesapalOrderTrackingId?: string;

  @Prop()
  pesapalOrderMerchantRef?: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ required: true })
  customerFirstName: string;

  @Prop({ required: true })
  customerLastName: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PesapalOrderSchema = SchemaFactory.createForClass(PesapalOrder);
