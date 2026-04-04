import { http } from '../utils/http-client';

export const billingService = {
  getInvoices: () =>
    http.get<Array<{ id: string; amount: number; currency: string; paidAt: string; downloadUrl: string }>>('/billing/invoices'),

  initiatePayment: (payload: { planId: string; provider: 'stripe' | 'mpesa' | 'pesapal'; phone?: string }) =>
    http.post<{ checkoutUrl?: string; transactionId?: string }>('/billing/pay', payload),

  getPaymentStatus: (transactionId: string) =>
    http.get<{ status: 'pending' | 'success' | 'failed' }>(`/billing/status/${transactionId}`),
};
