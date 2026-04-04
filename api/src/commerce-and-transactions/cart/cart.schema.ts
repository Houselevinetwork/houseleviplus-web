import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
class CartItem {
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

  @Prop({ default: Date.now })
  addedAt: Date;
}

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop({ default: 0 })
  itemCount: number;

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: Date.now, expires: 2592000 })
  expiresAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
