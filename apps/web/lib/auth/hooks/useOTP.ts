/**
 * useOTP Hook - Send and verify OTP codes
 * Location: packages/LAYER-3-SERVICES/auth/src/hooks/useOTP.ts
 */

import { useState, useCallback } from 'react';
import { OTPRequestResponse, OTPVerifyResponse } from '../types/auth.types';

export function useOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  const requestOTP = useCallback(
    async (email: string): Promise<OTPRequestResponse> => {
      try {
        setLoading(true);
        setError(null);

        if (!canResend) {
          throw new Error(`Wait ${resendTimer} seconds before requesting another code`);
        }

        // TODO: Replace with actual API call
        // const response = await authClient.requestOTP(email);
        
        const response: OTPRequestResponse = {
          success: true,
          message: 'Verification code sent to your email',
          expiresIn: 600,
          canResendIn: 60,
        };

        setOtpSent(true);
        setCanResend(false);
        setResendTimer(response.canResendIn ?? 60);

        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send code';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [canResend, resendTimer]
  );

  const verifyOTP = useCallback(
    async (email: string, otp: string): Promise<OTPVerifyResponse> => {
      try {
        setLoading(true);
        setError(null);

        if (!otp || otp.length !== 6) {
          throw new Error('Invalid verification code');
        }

        // TODO: Replace with actual API call
        // const response = await authClient.verifyOTP(email, otp);
        
        const response: OTPVerifyResponse = {
          success: true,
          message: 'Login successful',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'refresh_token_xyz',
          expiresIn: 7200,
        };

        setOtpSent(false);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid code';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { requestOTP, verifyOTP, loading, error, otpSent, canResend, resendTimer };
}
