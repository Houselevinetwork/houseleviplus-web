import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ShippingRate extends Document {
  @Prop({ required: true, enum: ['Kenya', 'Africa', 'International'] })
  location: string;

  @Prop({ required: true })
  flatRate: number;

  @Prop()
  minOrderValue?: number;

  @Prop({ default: 3 })
  estimatedDays: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ShippingSchema = SchemaFactory.createForClass(ShippingRate);
