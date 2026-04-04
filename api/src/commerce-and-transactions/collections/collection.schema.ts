import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Collection extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  icon: string;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
