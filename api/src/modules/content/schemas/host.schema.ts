// api/src/modules/content/schemas/host.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Host extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;           // e.g. "wakhata-levi", "sisibo", "hl-special"

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  avatarUrl: string;      // circular photo shown in Browse by Host row

  @Prop({ default: '' })
  bannerUrl: string;      // used on the host detail page

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;      // admin controls display order

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const HostSchema = SchemaFactory.createForClass(Host);
HostSchema.index({ slug: 1 }, { unique: true });
HostSchema.index({ isActive: 1, sortOrder: 1 });