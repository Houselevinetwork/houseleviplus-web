'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

const API_URL = 'http://localhost:4000';

type Step   = 'disclosure' | 'method' | 'processing';
type Method = 'card' | 'mpesa' | null;

interface LegalSummaries {
  billing: {
    title: string;
    points: string[];
  };
  privacy: {
    title: string;
    points: string[];
  };
}

export default function PaymentPage() {
  const router = useRouter();

  const [plan, setPlan]           = useState<any>(null);
  const [step, setStep]           = useState<Step>('disclosure');
  const [method, setMethod]       = useState<Method>(null);
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [user, setUser]           = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [legalSummaries, setLegalSummaries] = useState<LegalSummaries | null>(null);

  useEffect(() => {
    // 1. Load plan
    const stored = localStorage.getItem('selectedPlan');
    if (!stored) { router.push('/choose-plan'); return; }
    setPlan(JSON.parse(stored));

    // 2. Check auth
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('postLoginRedirect', '/payment');
      router.push('/login');
      return;
    }

    // 3. Fetch user
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success || d.user || d._id || d.id) {
          setUser(d.user || d);
        } else {
          localStorage.removeItem('token');
          localStorage.setItem('postLoginRedirect', '/payment');
          router.push('/login');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.setItem('postLoginRedirect', '/payment');
        router.push('/login');
      })
      .finally(() => setAuthChecked(true));

    // 4. Fetch legal summaries from API
    fetch(`${API_URL}/legal/summaries`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setLegalSummaries(d.data);
      })
      .catch(err => console.error('Failed to load legal summaries:', err));
  }, []);

  const handlePay = async () => {
    if (!method || !plan || !user) return;
    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/billing/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId:       user._id || user.id,
          planId:       plan.id,
          planName:     plan.planName,
          billingCycle: plan.planType || 'monthly',
          amount:       plan.amount,
          currency:     plan.currency || 'KES',
          description:  `House Levi+ ${plan.planName} Plan`,
          callbackUrl:  `${window.location.origin}/payment/callback`,
          email:        user.email        || '',
          phoneNumber:  user.phoneNumber  || '',
          firstName:    user.firstName    || '',
          lastName:     user.lastName     || '',
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.redirectUrl) {
        localStorage.setItem('pendingPayment', JSON.stringify({
          transactionId:  data.data.transactionId,
          subscriptionId: data.data.subscriptionId,
          billingId:      data.data.billingId,
          planName:       plan.planName,
          amount:         plan.displayPrice,
          method,
        }));
        window.location.href = data.data.redirectUrl;
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('method');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked || !plan) {
    return (
      <div className="pay-loading">
        <div className="pay-spinner" />
      </div>
    );
  }

  return (
    <main className="pay-page">
      <div className="pay-wrap">

        {/* Plan Summary Bar */}
        <div className="pay-plan-bar">
          <span className="pay-plan-name">{plan.planName} Plan</span>
          <div className="pay-plan-bar-right">
            <span className="pay-plan-price">
              {plan.displayPrice}<span>/mo</span>
            </span>
            <button className="pay-change-plan" onClick={() => router.push('/choose-plan')}>
              Change
            </button>
          </div>
        </div>

        {/* ─── STEP 1: LEGAL DISCLOSURE ─── */}
        {step === 'disclosure' && (
          <section className="pay-section">
            <p className="pay-eyebrow">Step 1 of 2</p>
            <h1 className="pay-title">Before you subscribe</h1>
            <p className="pay-lead">
              Please read the following carefully. Your agreement is required to continue.
            </p>

            {!legalSummaries ? (
              <div className="pay-loading-legal">
                <div className="pay-spinner" />
                <p>Loading terms...</p>
              </div>
            ) : (
              <div className="pay-disclosure">

                {/* Billing Terms */}
                <div className="pay-block">
                  <h2>{legalSummaries.billing.title}</h2>
                  <ul>
                    {legalSummaries.billing.points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                  <p className="pay-read-more">
                    <a href="/terms" target="_blank">Read full Billing Terms →</a>
                  </p>
                </div>

                {/* Privacy & DPA */}
                <div className="pay-block">
                  <h2>{legalSummaries.privacy.title}</h2>
                  <ul>
                    {legalSummaries.privacy.points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                  <p className="pay-read-more">
                    <a href="/privacy" target="_blank">Read full Privacy Policy →</a>
                    {' · '}
                    <a href="/dpa" target="_blank">Data Processing Agreement →</a>
                  </p>
                </div>

                {/* Plan Features */}
                <div className="pay-block pay-block--blue">
                  <h2>What's included — {plan.planName}</h2>
                  <ul>
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            <label className="pay-agree">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <span>
                I confirm I am 18 years or older. I have read and agree to the{' '}
                <a href="/terms" target="_blank">Billing Terms</a>,{' '}
                <a href="/privacy" target="_blank">Privacy Policy</a>, and{' '}
                <a href="/dpa" target="_blank">Data Processing Agreement</a>.
                I understand my subscription renews automatically and I can cancel anytime.
              </span>
            </label>

            <div className="pay-actions">
              <button
                className="pay-btn pay-btn--primary"
                disabled={!agreed || !legalSummaries}
                onClick={() => setStep('method')}
              >
                Continue to Payment →
              </button>
            </div>
          </section>
        )}

        {/* ─── STEP 2: PAYMENT METHOD ─── */}
        {step === 'method' && (
          <section className="pay-section">
            <p className="pay-eyebrow">Step 2 of 2</p>
            <h1 className="pay-title">Choose payment method</h1>

            <div className="pay-methods">

              <button
                className={`pay-method ${method === 'card' ? 'pay-method--active' : ''}`}
                onClick={() => setMethod('card')}
              >
                <span className="pay-method-icon">💳</span>
                <div className="pay-method-body">
                  <strong>Card</strong>
                  <span>Visa · Mastercard · American Express</span>
                  <span className="pay-tag pay-tag--green">✓ Recommended — enables auto-renewal</span>
                </div>
                <span className="pay-radio">{method === 'card' ? '●' : '○'}</span>
              </button>

              <button
                className={`pay-method ${method === 'mpesa' ? 'pay-method--active' : ''}`}
                onClick={() => setMethod('mpesa')}
              >
                <span className="pay-method-icon">📱</span>
                <div className="pay-method-body">
                  <strong>M-Pesa</strong>
                  <span>Lipa Na M-Pesa · STK Push to your number</span>
                  <span className="pay-tag pay-tag--amber">⚠ Manual renewal — reminders will be sent</span>
                </div>
                <span className="pay-radio">{method === 'mpesa' ? '●' : '○'}</span>
              </button>

            </div>

            {method === 'mpesa' && (
              <div className="pay-mpesa-notice">
                <strong>Note about M-Pesa renewals</strong>
                <p>
                  M-Pesa does not support automatic recurring charges. Each month we will send you
                  an SMS and email reminder <strong>3 days</strong> and <strong>1 day</strong> before
                  your subscription expires. If payment is not received, your account enters a{' '}
                  <strong>3-day grace period</strong> before access is paused.
                  We strongly recommend using a card for uninterrupted access.
                </p>
              </div>
            )}

            {error && <p className="pay-error">{error}</p>}

            <div className="pay-actions">
              <button
                className="pay-btn pay-btn--primary"
                disabled={!method || loading}
                onClick={handlePay}
              >
                {loading ? 'Redirecting to Pesapal…' : `Pay ${plan.displayPrice} securely →`}
              </button>
              <button className="pay-btn pay-btn--ghost" onClick={() => setStep('disclosure')}>
                ← Back
              </button>
            </div>

            <p className="pay-secure">
              🔒 Secured by Pesapal · PCI-DSS certified · House Levi+ never stores your card details
            </p>
          </section>
        )}

        {/* ─── PROCESSING ─── */}
        {step === 'processing' && (
          <section className="pay-section pay-section--center">
            <div className="pay-spinner pay-spinner--lg" />
            <h2 className="pay-proc-title">Redirecting to Pesapal…</h2>
            <p className="pay-proc-sub">Please do not close this window or press back.</p>
          </section>
        )}

      </div>
    </main>
  );
}