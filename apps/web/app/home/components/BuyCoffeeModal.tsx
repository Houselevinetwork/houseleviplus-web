'use client';

import { useState } from 'react';

interface Props {
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

const AMOUNTS = [
  { label: 'KES 200',  value: 200,  desc: 'A quick coffee' },
  { label: 'KES 500',  value: 500,  desc: 'A proper meal' },
  { label: 'KES 1000', value: 1000, desc: 'A full day of work' },
];

export default function BuyCoffeeModal({ onClose }: Props) {
  const [selected, setSelected] = useState<number>(500);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
        : '';

      // Get user info if logged in
      let user: any = null;
      if (token) {
        try {
          const me = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (me.ok) {
            const d = await me.json();
            user = d.user || d;
          }
        } catch {}
      }

      const res = await fetch(`${API_URL}/billing/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId:       user?._id || user?.id || 'guest',
          planId:       `donation-${selected}`,
          planName:     `HL+ Team Support — KES ${selected}`,
          billingCycle: 'once',
          amount:       selected,
          currency:     'KES',
          description:  `Support the HL+ Team — KES ${selected} donation`,
          callbackUrl:  `${WEB_URL}/payment/callback`,
          email:        user?.email       || '',
          phoneNumber:  user?.phoneNumber || '',
          firstName:    user?.firstName   || 'Supporter',
          lastName:     user?.lastName    || '',
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.redirectUrl) {
        // Store so callback page knows it was a donation
        localStorage.setItem('pendingPayment', JSON.stringify({
          transactionId:  data.data.transactionId,
          planName:       `HL+ Team Support`,
          amount:         `KES ${selected}`,
          isDonation:     true,
        }));
        window.location.href = data.data.redirectUrl;
      } else {
        throw new Error(data.message || 'Could not initiate payment');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', maxWidth: 400, width: '100%',
        padding: '48px 40px', position: 'relative', textAlign: 'center',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 20,
            background: 'none', border: 'none',
            fontSize: 22, cursor: 'pointer',
            color: 'rgba(0,0,0,0.35)', lineHeight: 1,
          }}
        >
          ×
        </button>

        <p style={{
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.35)', margin: '0 0 12px',
        }}>
          You just downloaded a memory
        </p>

        <h2 style={{
          fontSize: 24, fontWeight: 300,
          margin: '0 0 12px', letterSpacing: '-0.01em',
        }}>
          Support the HL+ Team
        </h2>

        <p style={{
          fontSize: 13, color: 'rgba(0,0,0,0.55)',
          lineHeight: 1.7, margin: '0 0 28px',
        }}>
          We capture these moments and keep them free to download.
          A small contribution keeps us going.
        </p>

        {/* Amount selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {AMOUNTS.map(a => (
            <button
              key={a.value}
              onClick={() => setSelected(a.value)}
              style={{
                flex: 1, padding: '12px 8px',
                background: selected === a.value ? '#000' : 'transparent',
                color: selected === a.value ? '#fff' : '#000',
                border: '1px solid ' + (selected === a.value ? '#000' : 'rgba(0,0,0,0.2)'),
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: 4,
                alignItems: 'center',
              }}
            >
              <span>{a.label}</span>
              <span style={{
                fontSize: 10, fontWeight: 400,
                opacity: selected === a.value ? 0.7 : 0.5,
              }}>
                {a.desc}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 16px' }}>{error}</p>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: '100%', height: 48,
            background: '#000', color: '#fff',
            border: 'none', fontSize: 13,
            fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s', marginBottom: 12,
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget.style.opacity = '0.8'); }}
          onMouseLeave={e => { if (!loading) (e.currentTarget.style.opacity = '1'); }}
        >
          {loading ? 'Redirecting to Pesapal...' : `Support with KES ${selected} ?`}
        </button>

        {/* Skip */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            width: '100%', height: 44,
            background: 'none',
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: 12, color: 'rgba(0,0,0,0.45)',
            cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.35)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)')}
        >
          Maybe next time
        </button>

        <p style={{
          fontSize: 10, color: 'rgba(0,0,0,0.3)',
          margin: '16px 0 0', lineHeight: 1.6,
        }}>
          Secured by Pesapal · PCI-DSS certified
        </p>
      </div>
    </div>
  );
}
