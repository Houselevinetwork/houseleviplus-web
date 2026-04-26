'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.houselevi.com';

type Status = 'verifying' | 'completed' | 'failed';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');

      if (!code) {
        setStatus('failed');
        setError('No authorization code received. Please try signing in again.');
        return;
      }

      // Store token in houselevi.com localStorage — this is the correct origin.
      // AuthProvider on /home initializes fresh after the redirect and reads these.
      localStorage.setItem('token', code);
      localStorage.setItem('accessToken', code);
      sessionStorage.setItem('accessToken', code);

      // Pre-fetch user profile to warm localStorage cache.
      // AuthProvider will re-fetch too, but this speeds up the first render.
      try {
        const payload = JSON.parse(atob(code.split('.')[1]));
        if (payload.userId) {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${code}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const userData = data.user || data;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch {
        // Token decode or profile fetch failed — non-fatal.
        // AuthProvider will fetch the profile itself on /home.
      }

      setStatus('completed');

      // Redirect immediately — no setTimeout.
      // window.location.href causes a full page reload so AuthProvider
      // re-initializes from scratch and reads the token we just stored above.
      window.location.href = '/home';

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
        background: '#000000',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px 20px' }}>

        <p style={{ fontSize: '24px', fontWeight: 700, marginBottom: '60px', color: '#ffffff' }}>
          HOUSE LEVI<span style={{ color: '#4169e1' }}>+</span>
        </p>

        {/* VERIFYING */}
        {status === 'verifying' && (
          <div>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '3px solid #333',
                borderTop: '3px solid #ffffff',
                borderRadius: '50%',
                margin: '0 auto 30px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
              Completing sign in...
            </h1>
            <p style={{ fontSize: '16px', color: '#999999', lineHeight: '1.5' }}>
              Please wait while we verify your account.
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
              ✓
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
              Sign in successful!
            </h1>
            <p style={{ fontSize: '16px', color: '#999999', lineHeight: '1.5', marginBottom: '30px' }}>
              Welcome back! Redirecting you now...
            </p>
            <button
              onClick={() => { window.location.href = '/home'; }}
              style={{
                padding: '12px 24px',
                background: '#4169e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Go to Home →
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
              ✕
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
              Sign in failed
            </h1>
            <p style={{ fontSize: '16px', color: '#ff6b6b', lineHeight: '1.5', marginBottom: '30px' }}>
              {error || 'Something went wrong. Please try again.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { window.location.href = 'https://authorize.houselevi.com/login'; }}
                style={{
                  padding: '12px 24px',
                  background: '#4169e1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/home'; }}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#4169e1',
                  border: '1px solid #4169e1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

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
            background: '#000000',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, marginBottom: '40px', color: '#ffffff' }}>
              HOUSE LEVI<span style={{ color: '#4169e1' }}>+</span>
            </p>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '3px solid #333',
                borderTop: '3px solid #ffffff',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}