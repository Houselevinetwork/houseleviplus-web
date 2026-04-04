import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true })
  variantTitle: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  subtotal: number;
}

@Schema({ _id: true })
class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  zipCode?: string;

  @Prop({ required: true })
  country: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  shippingCost: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'KES', enum: ['KES', 'USD'] })
  currency: string;

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ required: true, enum: ['Kenya', 'Africa', 'International'] })
  shippingLocation: string;

  @Prop()
  estimatedDelivery?: Date;

  @Prop({ default: 'pesapal' })
  paymentMethod: string;

  @Prop()
  pesapalReference?: string;

  @Prop({ enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' })
  paymentStatus: string;

  @Prop({ enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' })
  orderStatus: string;

  @Prop()
  trackingNumber?: string;

  @Prop()
  trackingUrl?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
