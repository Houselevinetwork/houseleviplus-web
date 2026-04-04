import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: true })
  emailVerified: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
