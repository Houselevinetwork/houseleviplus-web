// src/user-and-monetization/auth/interfaces/auth.interface.ts
import { Document } from 'mongoose';

export interface AuthDocument extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
  walletId: string;
  subscriptionId?: string;
  validatePassword(password: string): Promise<boolean>;
}
