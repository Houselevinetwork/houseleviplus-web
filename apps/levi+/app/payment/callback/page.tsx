'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import './callback.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

type Status = 'verifying' | 'completed' | 'failed' | 'pending';

// ✅ STEP 1: Extract the component that uses useSearchParams
function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pendingPayment');
    if (stored) setPending(JSON.parse(stored));
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    // Pesapal sends these query params on redirect
    const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId');
    const merchantReference = searchParams.get('OrderMerchantReference') || searchParams.get('merchantReference');

    if (!orderTrackingId) {
      setStatus('failed');
      setMessage('Payment reference not found. Please contact support.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/billing/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderTrackingId, merchantReference }),
      });

      const data = await res.json();

      if (data.success) {
        const result = data.data;
        if (result.status === 'completed') {
          setStatus('completed');
          localStorage.removeItem('pendingPayment');
          // Redirect to browse after 3 seconds
          setTimeout(() => router.push('/browse'), 3000);
        } else if (result.status === 'pending') {
          setStatus('pending');
          setMessage('Your payment is still processing. We will notify you by email once confirmed.');
        } else {
          setStatus('failed');
          setMessage(result.message || 'Payment was not successful. Please try again.');
        }
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (err: any) {
      setStatus('failed');
      setMessage(err.message || 'Could not verify payment. Please contact support.');
    }
  };

  return (
    <main className="cb-page">
      <div className="cb-wrap">
        <p className="cb-logo">
          HOUSE LEVI<span>+</span>
        </p>

        {/* VERIFYING */}
        {status === 'verifying' && (
          <div className="cb-card">
            <div className="cb-spinner" />
            <h1 className="cb-title">Verifying your payment…</h1>
            <p className="cb-sub">Please wait — this takes a few seconds.</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === 'completed' && (
          <div className="cb-card">
            <div className="cb-icon cb-icon--success">✓</div>
            <h1 className="cb-title">Payment successful!</h1>
            <p className="cb-sub">
              Welcome to House Levi+. Your <strong>{pending?.planName || ''}</strong> subscription is now active.
            </p>
            {pending?.amount && <p className="cb-amount">Amount paid: <strong>{pending.amount}</strong></p>}
            <p className="cb-redirect">Redirecting you to browse in 3 seconds…</p>
            <button className="cb-btn" onClick={() => router.push('/browse')}>
              Start watching now →
            </button>
          </div>
        )}

        {/* PENDING */}
        {status === 'pending' && (
          <div className="cb-card">
            <div className="cb-icon cb-icon--pending">⏳</div>
            <h1 className="cb-title">Payment processing</h1>
            <p className="cb-sub">{message}</p>
            <div className="cb-actions">
              <button className="cb-btn" onClick={verifyPayment}>
                Check again
              </button>
              <button className="cb-btn cb-btn--ghost" onClick={() => router.push('/choose-plan')}>
                Back to plans
              </button>
            </div>
          </div>
        )}

        {/* FAILED */}
        {status === 'failed' && (
          <div className="cb-card">
            <div className="cb-icon cb-icon--failed">✕</div>
            <h1 className="cb-title">Payment unsuccessful</h1>
            <p className="cb-sub">{message || 'Something went wrong with your payment.'}</p>
            <div className="cb-actions">
              <button className="cb-btn" onClick={() => router.push('/payment')}>
                Try again
              </button>
              <button className="cb-btn cb-btn--ghost" onClick={() => router.push('/choose-plan')}>
                Change plan
              </button>
            </div>
            <p className="cb-support">
              Need help? Email <a href="mailto:support@houselevi.com">support@houselevi.com</a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// ✅ STEP 2: Wrap in Suspense in the main export
export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="cb-page">
          <div className="cb-wrap">
            <p className="cb-logo">
              HOUSE LEVI<span>+</span>
            </p>
            <div className="cb-card">
              <div className="cb-spinner" />
              <h1 className="cb-title">Loading payment status…</h1>
            </div>
          </div>
        </main>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}