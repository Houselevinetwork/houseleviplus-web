import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document & {
  validatePassword(password: string): Promise<boolean>;
};

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  // 🆕 OPTIONAL - Collected after email verification
  @Prop({ required: false, default: '' })
  firstName: string;

  // 🆕 OPTIONAL - Collected after email verification
  @Prop({ required: false, default: '' })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // 🆕 OPTIONAL - Collected after email verification
  @Prop({ required: false, default: '', sparse: true })
  phoneNumber: string;

  // 🆕 OPTIONAL - OTP-only users have no password
  @Prop({ required: false, select: false, default: null })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: String, required: false })
  verificationToken?: string;

  @Prop({ type: Date, required: false })
  verificationTokenExpiry?: Date;

  @Prop({ type: String, required: false })
  passwordResetToken?: string;

  @Prop({ type: Date, required: false })
  passwordResetTokenExpiry?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: false })
  currentSubscriptionId?: Types.ObjectId;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ 
    type: String, 
    enum: ['free', 'active', 'expired', 'suspended'], 
    default: 'free' 
  })
  subscriptionStatus: string;

  @Prop({ type: Date, required: false })
  subscriptionExpiry?: Date;

  @Prop({ default: false })
  autoRenew: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: false })
  walletId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  // 🆕 Track profile completion
  @Prop({ default: false })
  profileComplete: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Only hash password if it exists and was modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};
