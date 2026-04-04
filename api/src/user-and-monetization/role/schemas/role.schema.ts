import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, lowercase: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // e.g., ['read:content', 'write:content', 'manage:users']
}

export const RoleSchema = SchemaFactory.createForClass(Role);