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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/subscriptions/plans`);
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (plan: Plan) => {
    const token = localStorage.getItem('token');
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    if (!token) {
      localStorage.setItem('postLoginRedirect', '/payment');
      router.push('/login');
      return;
    }
    setSelecting(plan.id);
    router.push('/payment');
  };

  if (loading) return (
    <div className="cp-loading">
      <div className="cp-spinner" />
    </div>
  );

  return (
    <div className="cp-container">
      <main className="cp-page">

        {/* â”€â”€ Header: title left Â· banner right â”€â”€ */}
        <section className="cp-header">

          {/* Left: Pricing + step */}
          <div className="cp-header-left">
            <h1 className="cp-title">Pricing</h1>
            <p className="cp-step">Step 2 of 3 &mdash; Choose your plan</p>
          </div>

          {/* Right: banner */}
          <div className="cp-banner">
            <div className="cp-banner-left">
              <svg className="cp-banner-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <div className="cp-banner-copy">
                <span className="cp-banner-headline">Not ready to subscribe?</span>
                <span className="cp-banner-sub">Explore free content â€” no card needed.</span>
              </div>
            </div>
            <button className="cp-banner-cta" onClick={() => router.push('/entertainment')}>
              Explore Free Content
            </button>
          </div>

        </section>

        {/* â”€â”€ Cards Grid â”€â”€ */}
        <section className="cp-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`cp-card${plan.isPopular ? ' cp-card--popular' : ''}`}
            >
              {plan.badge && (
                <div className="cp-card-badge">
                  <span>{plan.badge}</span>
                </div>
              )}

              <div className="cp-card-content">
                <header className="cp-card-head">
                  <h2 className="cp-card-name">{plan.planName}</h2>
                  <div className="cp-card-pricing-row">
                    <span className="cp-card-price">{plan.displayPrice}</span>
                    {plan.displayPrice !== 'Free' && plan.displayPrice !== 'Custom' && (
                      <span className="cp-card-per">/mo</span>
                    )}
                  </div>
                </header>

                <div className="cp-card-divider" />

                <ul className="cp-card-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>
                      <svg className="cp-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                  <li>
                    <svg className="cp-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{plan.quality} video quality</span>
                  </li>
                  <li>
                    <svg className="cp-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{plan.devices === 1 ? '1 screen' : `${plan.devices} screens`} at a time</span>
                  </li>
                  <li>
                    <svg className="cp-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{plan.resolution} resolution</span>
                  </li>
                </ul>
              </div>

              <button
                className="cp-card-cta"
                onClick={() => handleSelect(plan)}
                disabled={selecting !== null}
              >
                {selecting === plan.id ? 'Please waitâ€¦' : plan.ctaText}
              </button>
            </article>
          ))}
        </section>

      </main>
    </div>
  );
}
