'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('[VerifyEmail] API_URL:', API_URL);
    console.log('[VerifyEmail] Token found:', !!token);

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link — no token found.');
      return;
    }
    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      console.log('[VerifyEmail] Calling:', `${API_URL}/auth/verify-token`);

      const res = await fetch(`${API_URL}/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      console.log('[VerifyEmail] Response status:', res.status);

      if (!res.ok) {
        let errorMessage = `Server error: ${res.status}`;
        try {
          const errData = await res.json();
          errorMessage = errData.message || errData.error || errorMessage;
        } catch {
          // response body wasn't JSON
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('[VerifyEmail] Success, received tokens:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      setStatus('success');
      setMessage('Account created successfully!');
      setTimeout(() => {
        window.location.href = data.redirectTo || '/';
      }, 2000);
    } catch (error: any) {
      console.error('[VerifyEmail] Error:', error.message);
      setStatus('error');
      setMessage(error.message || 'Verification failed. Link may be expired.');
    }
  };

  return (
    <div className="login-root">
      <button
        className="login-logo"
        onClick={() => (window.location.href = '/')}
        type="button"
        aria-label="Home"
      >
        HOUSE LEVI<span>+</span>
      </button>

      <div className="login-form-wrap">
        <div>
          {status === 'verifying' && (
            <div className="login-form">
              <h2 className="login-title">Verifying Email</h2>
              <p className="login-subtitle">
                Please wait while we verify your email address...
              </p>
              <div className="verify-spinner"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="login-form">
              <div className="verify-success-icon">&#10003;</div>
              <h2 className="login-title">Welcome to House Levi+!</h2>
              <p className="login-subtitle">{message}</p>
              <p className="verify-redirect-text">Redirecting...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="login-form">
              <div className="verify-error-icon">&#10007;</div>
              <h2 className="login-title">Verification Failed</h2>
              <p className="login-subtitle">{message}</p>
              <a href="/login" className="btn-text">
                &#8592; Back to login
              </a>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .verify-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0066ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 32px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .verify-success-icon {
          width: 64px; height: 64px; background: #4caf50;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 24px;
          font-size: 32px; color: #ffffff; font-weight: 700;
        }
        .verify-error-icon {
          width: 64px; height: 64px; background: #f44336;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 24px;
          font-size: 32px; color: #ffffff; font-weight: 700;
        }
        .verify-redirect-text {
          font-size: 0.875rem; color: #999999; margin-top: 16px;
        }
      `}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: '100vh', background: '#0f1923' }} />}
    >
      <VerifyEmailInner />
    </Suspense>
  );
}