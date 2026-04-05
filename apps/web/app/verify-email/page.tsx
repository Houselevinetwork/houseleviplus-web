'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL || 'http://localhost:4000';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw new Error('Verification failed');
      }

      const data = await res.json();

      // Save tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      setStatus('success');
      setMessage('Account created successfully!');

      // âœ… FIXED: Redirect to home page (/) instead of /choose-plan
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Verification failed. Link may be expired.');
    }
  };

  return (
    <div className="login-root">
      {/* Logo at TOP LEFT */}
      <button
        className="login-logo"
        onClick={() => (window.location.href = '/')}
        type="button"
        aria-label="Home"
      >
        HOUSE LEVI<span>+</span>
      </button>

      {/* CENTERED FORM */}
      <div className="login-form-wrap">
        <div>
          {/* VERIFYING STATE */}
          {status === 'verifying' && (
            <div className="login-form">
              <h2 className="login-title">Verifying Email</h2>
              <p className="login-subtitle">
                Please wait while we verify your email address...
              </p>
              
              <div className="verify-spinner"></div>
            </div>
          )}
          
          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="login-form">
              <div className="verify-success-icon">âœ“</div>
              
              <h2 className="login-title">Welcome to House Levi+!</h2>
              
              <p className="login-subtitle">
                {message}
              </p>
              
              <p className="verify-redirect-text">
                Redirecting to home...
              </p>
            </div>
          )}
          
          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="login-form">
              <div className="verify-error-icon">âœ•</div>
              
              <h2 className="login-title">Verification Failed</h2>
              
              <p className="login-subtitle">
                {message}
              </p>
              
              <a href="/login" className="btn-text">
                â† Back to login
              </a>
            </div>
          )}
        </div>
      </div>

      {/* VERIFY-SPECIFIC CSS */}
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
          width: 64px;
          height: 64px;
          background: #4caf50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 32px;
          color: #ffffff;
          font-weight: 700;
        }

        .verify-error-icon {
          width: 64px;
          height: 64px;
          background: #f44336;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 32px;
          color: #ffffff;
          font-weight: 700;
        }

        .verify-redirect-text {
          font-size: 0.875rem;
          color: #999999;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
}
