"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

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

export default function ChoosePlansPage() {
  const [plans,     setPlans]     = useState<Plan[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    // Read token passed from web app via ?t= param and store locally.
    // localStorage is not shared between origins (ports count as different
    // origins) so the web app must hand the token over via URL.
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t");
    if (t) {
      localStorage.setItem("token", decodeURIComponent(t));
      // Remove token from URL so it is not visible or bookmarked
      window.history.replaceState({}, "", "/choose-plans");
    }

    // Fetch subscription plans
    fetch(`${API_URL}/subscriptions/plans`)
      .then(r => r.json())
      .then(d => { if (d.success) setPlans(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (plan: Plan) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("selectedPlan", JSON.stringify(plan));
    setSelecting(plan.id);
    window.location.href = "/payment";
  };

  const handleLogoClick = () => {
    if (typeof window !== "undefined") window.location.href = WEB_URL;
  };

  const handleExplore = () => {
    if (typeof window !== "undefined") window.location.href = `${WEB_URL}/watch`;
  };

  if (loading) {
    return (
      <div className="gp-root">
        <button className="gp-logo" onClick={handleLogoClick} type="button">
          HOUSE LEVI<span>+</span>
        </button>
        <div className="cp-loading">
          <div className="cp-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="gp-root">
      <button className="gp-logo" onClick={handleLogoClick} type="button">
        HOUSE LEVI<span>+</span>
      </button>

      <div className="cp-container">
        <main className="cp-page">

          <section className="cp-header">
            <div className="cp-header-left">
              <h1 className="cp-title">Pricing</h1>
              <p className="cp-step">Step 1 of 3 - Choose your plan</p>
            </div>
            <div className="cp-banner">
              <div className="cp-banner-left">
                <svg className="cp-banner-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <div className="cp-banner-copy">
                  <span className="cp-banner-headline">Not ready to subscribe?</span>
                  <span className="cp-banner-sub">Explore free content, no card needed.</span>
                </div>
              </div>
              <button className="cp-banner-cta" onClick={handleExplore}>
                Explore Free Content
              </button>
            </div>
          </section>

          <section className="cp-grid">
            {plans.map(plan => (
              <article
                key={plan.id}
                className={`cp-card${plan.isPopular ? " cp-card--popular" : ""}`}
              >
                {plan.badge && (
                  <div className="cp-card-badge"><span>{plan.badge}</span></div>
                )}

                <div className="cp-card-content">
                  <header className="cp-card-head">
                    <h2 className="cp-card-name">{plan.planName}</h2>
                    <div className="cp-card-pricing-row">
                      <span className="cp-card-price">{plan.displayPrice}</span>
                      {plan.displayPrice !== "Free" && plan.displayPrice !== "Custom" && (
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
                      <span>
                        {plan.devices === 1 ? "1 screen" : `${plan.devices} screens`} at a time
                      </span>
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
                  {selecting === plan.id ? "Please wait..." : plan.ctaText}
                </button>
              </article>
            ))}
          </section>

        </main>
      </div>
    </div>
  );
}