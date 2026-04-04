'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

const API_URL = 'http://localhost:4000';

interface Plan {
  id: string;
  planName: string;
  displayPrice: string;
  quality: string;
  resolution: string;
  devices: number;
  badge: string | null;
  isPopular: boolean;
  color: string;
  ctaText: string;
  features: string[];
  country: string;
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const [plans, setPlans]       = useState<Plan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [country, setCountry]   = useState('');

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res  = await fetch(`${API_URL}/subscriptions/plans`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
        if (data.data[0]) setCountry(data.data[0].country);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (plan: Plan) => {
    // Check if user is logged in before allowing plan selection
    const token = localStorage.getItem('token');

    // Save plan regardless — so it's waiting after login if needed
    localStorage.setItem('selectedPlan', JSON.stringify(plan));

    if (!token) {
      // Not logged in → save intended destination, send to login
      localStorage.setItem('postLoginRedirect', '/payment');
      router.push('/login');
      return;
    }

    // Logged in → go straight to payment
    setSelecting(plan.id);
    router.push('/payment');
  };

  const handleExploreFree = () => router.push('/browse');

  if (loading) return (
    <div className="cp-loading">
      <div className="cp-spinner" />
    </div>
  );

  return (
    <main className="cp-page">

      <section className="cp-intro">
        <p className="cp-eyebrow">Step 1 of 2</p>
        <h1 className="cp-title">Choose your plan</h1>
        <p className="cp-subtitle">
          {country ? `Prices shown in local currency · ${country}` : 'Monthly subscription · Cancel anytime'}
        </p>
      </section>

      <section className="cp-free-banner">
        <div className="cp-free-inner">
          <div className="cp-free-text">
            <span className="cp-free-label">Not ready to subscribe?</span>
            <span className="cp-free-desc">Explore a curated selection of free content — no card required.</span>
          </div>
          <button className="cp-free-btn" onClick={handleExploreFree}>
            Explore Free Content
          </button>
        </div>
      </section>

      <section className="cp-grid">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`cp-card ${plan.isPopular ? 'cp-card--popular' : ''}`}
            style={{ '--accent': plan.color } as React.CSSProperties}
          >
            {plan.badge && (
              <div className="cp-card-badge">{plan.badge}</div>
            )}

            <header className="cp-card-head">
              <h2 className="cp-card-name">{plan.planName}</h2>
              <div className="cp-card-price">
                {plan.displayPrice}
                <span className="cp-card-per">/mo</span>
              </div>
              <span className="cp-card-quality">{plan.quality}</span>
            </header>

            <dl className="cp-card-meta">
              <div className="cp-card-meta-row">
                <dt>Simultaneous screens</dt>
                <dd>{plan.devices}</dd>
              </div>
              <div className="cp-card-meta-row">
                <dt>Resolution</dt>
                <dd>{plan.resolution}</dd>
              </div>
            </dl>

            <ul className="cp-card-features">
              {plan.features.map((f, i) => (
                <li key={i}>
                  <span className="cp-check" aria-hidden>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`cp-card-cta ${plan.isPopular ? 'cp-card-cta--primary' : ''}`}
              onClick={() => handleSelect(plan)}
              disabled={selecting !== null}
            >
              {selecting === plan.id ? 'Please wait…' : plan.ctaText}
            </button>
          </article>
        ))}
      </section>

      <p className="cp-note">
        HD, Full HD, 4K and HDR availability subject to your internet service and device.
        Only people who live with you may use your account simultaneously.
      </p>

    </main>
  );
}