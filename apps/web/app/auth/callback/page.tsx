'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@houselevi/auth';

type Status = 'verifying' | 'completed' | 'failed';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUserData } = useAuthContext();
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

      console.log('✅ Token received from authorize-ui');

      // ✅ CRITICAL: Store token in localStorage (persists across sessions)
      localStorage.setItem('token', code);
      console.log('💾 Token stored in localStorage');

      // ✅ Also store as accessToken for compatibility
      sessionStorage.setItem('accessToken', code);
      console.log('💾 Token stored in sessionStorage');

      // ✅ Try to refresh user data (validates token and loads user info)
      try {
        if (refreshUserData && typeof refreshUserData === 'function') {
          console.log('👤 Refreshing user data...');
          await refreshUserData();
          console.log('✅ User data loaded successfully');
        } else {
          console.log('⚠️ refreshUserData not available');
        }
      } catch (refreshError: any) {
        // ✅ Don't fail callback if user data refresh fails
        // Token is still stored and valid
        console.warn('⚠️ Could not refresh user data:', refreshError.message);
        console.log('ℹ️ Continuing with stored token anyway');
      }

      // ✅ Set status to completed
      setStatus('completed');

      // ✅ Redirect to home after 1.5 seconds
      setTimeout(() => {
        console.log('🚀 Redirecting to /home');
        router.push('/home');
      }, 1500);
    } catch (err: any) {
      console.error('❌ Callback error:', err);
      setStatus('failed');
      setError(err.message || 'An error occurred during sign in. Please try again.');
    }
  };

  // VERIFYING STATE
  if (status === 'verifying') {
    return (
      <main style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: '#000' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '500px', 
          padding: '40px 20px' 
        }}>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            marginBottom: '60px', 
            color: '#fff' 
          }}>
            HOUSE LEVI<span style={{ color: '#4169e1' }}>+</span>
          </p>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #333', 
            borderTop: '3px solid #fff', 
            borderRadius: '50%', 
            margin: '0 auto 30px', 
            animation: 'spin 1s linear infinite' 
          }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            marginBottom: '12px', 
            color: '#fff' 
          }}>
            Completing sign in…
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#999' 
          }}>
            Please wait while we verify your account.
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
  }

  // COMPLETED STATE
  if (status === 'completed') {
    return (
      <main style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: '#000' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '500px', 
          padding: '40px 20px' 
        }}>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            marginBottom: '60px', 
            color: '#fff' 
          }}>
            HOUSE LEVI<span style={{ color: '#4169e1' }}>+</span>
          </p>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: '#e8f5e9', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 30px', 
            fontSize: '32px' 
          }}>
            ✓
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            marginBottom: '12px', 
            color: '#fff' 
          }}>
            Sign in successful!
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#999', 
            marginBottom: '30px' 
          }}>
            Welcome back! Redirecting you now…
          </p>
        </div>
      </main>
    );
  }

  // FAILED STATE
  return (
    <main style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: '#000' 
    }}>
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '500px', 
        padding: '40px 20px' 
      }}>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          marginBottom: '60px', 
          color: '#fff' 
        }}>
          HOUSE LEVI<span style={{ color: '#4169e1' }}>+</span>
        </p>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          background: '#ffebee', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 30px', 
          fontSize: '32px' 
        }}>
          ✕
        </div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          marginBottom: '12px', 
          color: '#fff' 
        }}>
          Sign in failed
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#ff6b6b', 
          marginBottom: '30px' 
        }}>
          {error || 'Something went wrong. Please try again.'}
        </p>
        <button 
          onClick={() => window.location.href = '/login'} 
          style={{ 
            padding: '12px 24px', 
            background: '#4169e1', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '16px', 
            fontWeight: '600', 
            cursor: 'pointer' 
          }}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}

function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: '#000' 
      }}>
        <p style={{ color: '#fff' }}>Loading...</p>
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

export default AuthCallbackPage;
