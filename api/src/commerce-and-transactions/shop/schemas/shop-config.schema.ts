import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Location: api/src/commerce-and-transactions/shop/schemas/shop-config.schema.ts
 * 
 * Stores hero, announcements, and other shop-wide config
 */

@Schema({ timestamps: true })
export class ShopConfig {
  @Prop({ type: String, default: '' })
  heroUrl: string;

  @Prop({ type: String, enum: ['image', 'video'], default: 'image' })
  heroType: 'image' | 'video';

  @Prop({ type: String, default: 'HOUSELEVI+' })
  heroHeadline: string;

  @Prop({
    type: [String],
    default: ['Free shipping on orders over $150'],
  })
  announcements: string[];
}

export type ShopConfigDocument = ShopConfig & Document;
export const ShopConfigSchema = SchemaFactory.createForClass(ShopConfig);