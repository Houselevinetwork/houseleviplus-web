import { http } from '../utils/http-client';

export const subscriptionService = {
  getPlans: () =>
    http.get<Array<{
      id: string;
      name: string;
      displayName: string;
      priceKsh: number;
      priceUsd: number;
      features: string[];
      recommended?: boolean;
    }>>('/subscription/plans'),

  getMySubscription: () =>
    http.get<{ status: 'guest' | 'free' | 'premium'; expiresAt?: string } | null>('/subscription/me'),

  checkout: (planId: string) =>
    http.post<{ checkoutUrl: string }>('/subscription/checkout', { planId }),

  cancel: () =>
    http.post<{ message: string }>('/subscription/cancel'),
};
