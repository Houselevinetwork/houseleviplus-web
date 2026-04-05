'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Status = 'verifying' | 'completed' | 'failed';

// âœ… STEP 1: Extract component that uses useSearchParams (required for Next.js 13+)
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    exchangeCodeForToken();
  }, [searchParams]);

  const exchangeCodeForToken = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        setStatus('failed');
        setError('No authorization code received. Please try signing in again.');
        return;
      }

      // Call your backend API to exchange code for token
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        const data = await response.json();
        setStatus('failed');
        setError(data.error || 'Failed to complete sign in. Please try again.');
        return;
      }

      const data = await response.json();

      // Store token in localStorage
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }

      // Optional: Store user info if returned
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Optional: Store refresh token if available
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      setStatus('completed');

      // Small delay to ensure token is stored before redirect
      setTimeout(() => {
        router.push('/home');
      }, 500);
    } catch (err: any) {
      setStatus('failed');
      setError(err.message || 'An error occurred during sign in. Please try again.');
    }
  };

  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px 20px' }}>
        {/* Logo */}
        <p
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '60px',
            color: '#000000',
          }}
        >
          HOUSE LEVI<span style={{ color: '#0066ff' }}>+</span>
        </p>

        {/* VERIFYING */}
        {status === 'verifying' && (
          <div>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '3px solid #f0f0f0',
                borderTop: '3px solid #0066ff',
                borderRadius: '50%',
                margin: '0 auto 30px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#000000' }}>
              Completing sign inâ€¦
            </h1>
            <p style={{ fontSize: '16px', color: '#666666', lineHeight: '1.5' }}>
              Please wait while we verify your account.
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* SUCCESS */}
        {status === 'completed' && (
          <div>
            <div
              style={{
                width: '60px',
                height: '60px',
                background: '#e8f5e9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px',
                fontSize: '32px',
              }}
            >
              âœ“
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#000000' }}>
              Sign in successful!
            </h1>
            <p style={{ fontSize: '16px', color: '#666666', lineHeight: '1.5', marginBottom: '30px' }}>
              Welcome back! Redirecting you nowâ€¦
            </p>
            <button
              onClick={() => router.push('/home')}
              style={{
                padding: '12px 24px',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Go to home â†’
            </button>
          </div>
        )}

        {/* FAILED */}
        {status === 'failed' && (
          <div>
            <div
              style={{
                width: '60px',
                height: '60px',
                background: '#ffebee',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px',
                fontSize: '32px',
              }}
            >
              âœ•
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#000000' }}>
              Sign in failed
            </h1>
            <p style={{ fontSize: '16px', color: '#c62828', lineHeight: '1.5', marginBottom: '30px' }}>
              {error || 'Something went wrong. Please try again.'}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => router.push('/home')}
                style={{
                  padding: '12px 24px',
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <button
                onClick={() => router.push('/home')}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#0066ff',
                  border: '1px solid #0066ff',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Go home
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// âœ… STEP 2: Wrap in Suspense in the main export (required for useSearchParams)
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#ffffff',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, marginBottom: '40px', color: '#000000' }}>
              HOUSE LEVI<span style={{ color: '#0066ff' }}>+</span>
            </p>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '3px solid #f0f0f0',
                borderTop: '3px solid #0066ff',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
