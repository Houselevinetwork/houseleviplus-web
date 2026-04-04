'use client';

import { useState, FormEvent } from 'react';

const API_URL = 'http://localhost:4000';

interface AuthResponse {
  token: string;
  refreshToken: string;
  accessToken?: string;
}

interface EmailDiscoveryResponse {
  exists: boolean;
  hasPassword: boolean;
  isVerified: boolean;
  status: string;
  requiresOTP: boolean;
  canLoginWithPassword: boolean;
}

interface UseAuthReturn {
  step: 'email' | 'otp' | 'signup' | 'greeting';
  email: string;
  otp: string;
  loading: boolean;
  error: string;
  countdown: number;
  userExists: boolean | null;
  userName: string;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  handleEmailSubmit: (e: FormEvent) => Promise<void>;
  handleOTPSubmit: (e: FormEvent) => Promise<void>;
  handleSignupRequest: () => Promise<void>;
  handleResendOTP: () => Promise<void>;
  backToEmail: () => void;
}

export function useAuth(): UseAuthReturn {
  const [step, setStep] = useState<'email' | 'otp' | 'signup' | 'greeting'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if email exists
      const discoveryRes = await fetch(`${API_URL}/auth/email-discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!discoveryRes.ok) throw new Error('Failed to verify email');

      const discovery: EmailDiscoveryResponse = await discoveryRes.json();
      setUserExists(discovery.exists);

      if (discovery.exists) {
        // EXISTING USER - Always send OTP (never skip)
        const otpRes = await fetch(`${API_URL}/auth/otp-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, purpose: 'login' }),
        });

        if (!otpRes.ok) throw new Error('Failed to send verification code');

        setStep('otp');
        startCountdown();
      } else {
        // NEW USER - Show signup option
        setStep('signup');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRequest = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/request-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Failed to send verification email');

      const data = await res.json();
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) throw new Error('Invalid verification code');

      const data = await res.json() as AuthResponse;
      
      if (typeof window !== 'undefined') {
        const token = data.accessToken || data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Fetch user details to check subscription status
        try {
          const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (meRes.ok) {
            const userData = await meRes.json();
            const user = userData.user || userData;
            
            // Store name for greeting
            setUserName(user.firstName || 'there');

            // Check subscription status
            const hasSubscription = user.isPremium && user.subscriptionStatus === 'ACTIVE';

            if (!hasSubscription) {
              // No active subscription → redirect to choose-plan
              window.location.href = '/choose-plan';
            } else {
              // Has subscription → show greeting, then redirect to entertainment
              setStep('greeting');
              setTimeout(() => {
                window.location.href = '/entertainment';
              }, 2000);
            }
          } else {
            // Fallback if /me fails
            window.location.href = '/browse';
          }
        } catch (err) {
          console.error('Failed to fetch user info:', err);
          window.location.href = '/browse';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      await fetch(`${API_URL}/auth/otp-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' }),
      });
      startCountdown();
    } catch (err) {
      setError('Failed to resend code');
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const backToEmail = () => {
    setStep('email');
    setUserExists(null);
  };

  return {
    step,
    email,
    otp,
    loading,
    error,
    countdown,
    userExists,
    userName,
    setEmail,
    setOtp,
    handleEmailSubmit,
    handleOTPSubmit,
    handleSignupRequest,
    handleResendOTP,
    backToEmail,
  };
}
