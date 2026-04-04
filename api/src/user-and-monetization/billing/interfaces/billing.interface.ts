import { Types } from 'mongoose';

export interface IBilling {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  pesapalOrderId: Types.ObjectId;
  invoiceNumber: string;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  amount: number;
  tax: number;
  discount: number;
  totalAmount: number;
  currency: string;
  billingDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  description: string;
  notes?: string;
  invoicePdfUrl?: string;
  paymentMethod?: string;
  originalInvoiceId?: Types.ObjectId;
  isRefunded: boolean;
  refundAmount?: number;
  refundDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBillingResponse {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  invoiceNumber: string;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  amount: number;
  totalAmount: number;
  currency: string;
  billingDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  description: string;
  isRefunded: boolean;
}

export interface IBillingStats {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  refundedAmount: number;
}