'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Invalid verification link'); return; }
    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch(API_URL + '/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('Verification failed');
      const data = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      setStatus('success');
      setMessage('Account created successfully!');
      setTimeout(() => { router.push('/choose-plan'); }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Verification failed. Link may be expired.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>HOUSE LEVI<span style={styles.plus}>+</span></h1>
        {status === 'verifying' && <div style={styles.content}><div style={styles.spinner}></div><p style={styles.text}>Verifying your email...</p></div>}
        {status === 'success' && <div style={styles.content}><div style={styles.successIcon}>✓</div><h2 style={styles.successTitle}>Welcome to House Levi+!</h2><p style={styles.text}>{message}</p><p style={styles.subtext}>Redirecting to plan selection...</p></div>}
        {status === 'error' && <div style={styles.content}><div style={styles.errorIcon}>✕</div><h2 style={styles.errorTitle}>Verification Failed</h2><p style={styles.text}>{message}</p><a href="/login" style={styles.link}>← Back to login</a></div>}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)', padding: '20px' },
  card: { background: '#ffffff', borderRadius: '12px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center' as const, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  logo: { fontSize: '2rem', fontWeight: '300' as const, letterSpacing: '-0.03em', marginBottom: '32px', color: '#000000' },
  plus: { color: '#4169E1' },
  content: { marginTop: '24px' },
  spinner: { width: '48px', height: '48px', border: '4px solid #f3f3f3', borderTop: '4px solid #4169E1', borderRadius: '50%', margin: '0 auto 24px' },
  successIcon: { width: '64px', height: '64px', background: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px', color: '#ffffff' },
  errorIcon: { width: '64px', height: '64px', background: '#f44336', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px', color: '#ffffff' },
  successTitle: { fontSize: '1.5rem', fontWeight: '500' as const, marginBottom: '16px', color: '#000000' },
  errorTitle: { fontSize: '1.5rem', fontWeight: '500' as const, marginBottom: '16px', color: '#000000' },
  text: { fontSize: '1rem', color: '#666666', marginBottom: '12px' },
  subtext: { fontSize: '0.875rem', color: '#999999' },
  link: { display: 'inline-block', marginTop: '24px', color: '#4169E1', textDecoration: 'none', fontSize: '1rem' },
};