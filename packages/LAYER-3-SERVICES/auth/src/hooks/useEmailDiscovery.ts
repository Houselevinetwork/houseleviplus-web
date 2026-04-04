'use client';

import { useState } from 'react';

const API_URL = 'http://localhost:4000';

interface EmailDiscoveryResponse {
  exists: boolean;
  hasPassword: boolean;
  isVerified: boolean;
  status: string;
  requiresOTP: boolean;
  canLoginWithPassword: boolean;
}

export function useEmailDiscovery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailDiscoveryResponse | null>(null);

  const checkEmail = async (email: string): Promise<EmailDiscoveryResponse> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/email-discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Failed to check email');

      const data = await res.json();
      setResult(data);
      return data;
    } catch (err: any) {
      const msg = err.message || 'Failed to check email';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { checkEmail, loading, error, result };
}
