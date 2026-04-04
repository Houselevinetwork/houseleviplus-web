import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document, Types } from 'mongoose';

export type AuthDocument = Auth & Document & {
  validatePassword(password: string): Promise<boolean>;
};

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  // ✅ Email verification (optional fields)
  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: String, required: false })
  verificationToken?: string;

  @Prop({ type: Date, required: false })
  verificationTokenExpiry?: Date;

  // ✅ Password reset (optional fields)
  @Prop({ type: String, required: false })
  passwordResetToken?: string;

  @Prop({ type: Date, required: false })
  passwordResetTokenExpiry?: Date;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Wallet' })
  wallet?: Types.ObjectId;

  // ✅ SUBSCRIPTION FIELDS (NEW)
  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: false })
  subscription?: Types.ObjectId;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ default: 'free' }) // 'free' | 'premium' | 'suspended'
  subscriptionStatus: string;

  @Prop({ type: Date, required: false })
  subscriptionExpiry?: Date;

  @Prop({ default: true })
  autoRenew: boolean;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);

// ✅ ADD METHODS TO SCHEMA
AuthSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};