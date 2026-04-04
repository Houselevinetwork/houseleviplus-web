import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomePartnerDocument = HomePartner & Document;

@Schema({ timestamps: true, collection: 'home_partners' })
export class HomePartner {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: '' })
  logoKey: string;

  @Prop({ default: '' })
  websiteUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const HomePartnerSchema = SchemaFactory.createForClass(HomePartner);

HomePartnerSchema.index({ isActive: 1, displayOrder: 1 });
