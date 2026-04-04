'use client';

/**
 * apps/web/app/about-premium/page.tsx
 *
 * Psychology: Netflix-style anchoring layout.
 * Premium VIP shown last (anchor high), Standard highlighted as "Most Popular"
 * so it looks like the smart choice between a cheap entry and an expensive top tier.
 *
 * Flow:
 *   Guest        ? picks plan ? redirects to login ? back to checkout with plan pre-selected
 *   Free user    ? picks plan ? redirects directly to gopremium/choose-plans?plan=X
 *   Premium user ? sees "You're premium" badge, can upgrade
 */

import { useState } from 'react';
import { useAuthContext } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const GO_PREMIUM = process.env.NEXT_PUBLIC_GOPREMIUM_URL   ?? 'http://localhost:3004';
const AUTH_URL   = process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL ?? 'http://localhost:3003';

function redirectToLogin(planId: string) {
  const state = Math.random().toString(36).substring(2, 15);
  const nonce = Math.random().toString(36).substring(2, 15);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('hl_post_login_plan', planId);
  }
  window.location.href = `${AUTH_URL}/login?state=${state}&nonce=${nonce}`;
}

function redirectToCheckout(planId: string) {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
    : '';
  const url = token
    ? `${GO_PREMIUM}/choose-plans?plan=${planId}&t=${encodeURIComponent(token)}`
    : `${GO_PREMIUM}/choose-plans?plan=${planId}`;
  window.location.href = url;
}

// -- Plan data (mirrors subscription.service.ts exactly) ----------------------
const PLANS = [
  {
    id:       'mobile_plan',
    name:     'Mobile',
    price:    5,
    currency: 'KES',
    devices:  1,
    quality:  '480p',
    badge:    null,
    color:    '#4169E1',
    features: [
      'All series and movies',
      'Mobile phone & tablet only',
      '480p video quality',
      '1 screen at a time',
      'Download for offline viewing',
      'Cancel anytime',
    ],
  },
  {
    id:       'basic_plan',
    name:     'Basic',
    price:    399,
    currency: 'KES',
    devices:  1,
    quality:  '720p HD',
    badge:    null,
    color:    '#2196F3',
    features: [
      'All series and movies',
      'TV, computer, phone & tablet',
      '720p HD video quality',
      '1 screen at a time',
      'Download for offline viewing',
      'Cancel anytime',
    ],
  },
  {
    id:       'standard_plan',
    name:     'Standard',
    price:    499,
    currency: 'KES',
    devices:  2,
    quality:  '1080p Full HD',
    badge:    'Most Popular',
    color:    '#9C27B0',
    features: [
      'All series and movies',
      'TV, computer, phone & tablet',
      '1080p Full HD video quality',
      '2 screens at a time',
      'Download for offline viewing',
      'Early access to new releases',
      'Cancel anytime',
    ],
  },
  {
    id:       'premium_vip_plan',
    name:     'Premium VIP',
    price:    700,
    currency: 'KES',
    devices:  4,
    quality:  '4K Ultra HD + HDR',
    badge:    'Best Value',
    color:    '#FF6B35',
    features: [
      'All series and movies',
      'TV, computer, phone & tablet',
      '4K Ultra HD + HDR quality',
      'Immersive spatial audio',
      '4 screens at a time',
      'Download on 6 devices',
      'Exclusive VIP event invitations',
      'Merchandise discounts',
      'Producer credits on select content',
      'Priority customer support',
    ],
  },
];

// -- Comparison table rows -----------------------------------------------------
const COMPARE_ROWS: { label: string; values: string[] }[] = [
  { label: 'Monthly price',    values: ['KES 5',   'KES 399',   'KES 499',         'KES 700'] },
  { label: 'Video quality',    values: ['480p',    '720p HD',   '1080p Full HD',   '4K + HDR'] },
  { label: 'Screens at once',  values: ['1',       '1',         '2',               '4'] },
  { label: 'Devices',          values: ['Phone/Tablet', 'All devices', 'All devices', 'All devices'] },
  { label: 'Downloads',        values: ['1 device','1 device',  '2 devices',       '6 devices'] },
  { label: 'Spatial audio',    values: ['—',       '—',         '—',               '?'] },
  { label: 'Early releases',   values: ['—',       '—',         '?',               '?'] },
  { label: 'VIP events',       values: ['—',       '—',         '—',               '?'] },
  { label: 'Priority support', values: ['—',       '—',         '—',               '?'] },
];

// -- FAQ data ------------------------------------------------------------------
const FAQS = [
  {
    q: 'Can I change my plan at any time?',
    a: 'Yes. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'How does billing work?',
    a: 'You are charged monthly on the date you signed up. We support card payments (Visa, Mastercard, Amex) and M-Pesa. Card payments auto-renew; M-Pesa requires manual renewal each month.',
  },
  {
    q: 'Can I share my account?',
    a: 'A House Levi+ account is for people who live together in a single household. The number of simultaneous screens depends on your plan — Standard allows 2, Premium VIP allows 4.',
  },
  {
    q: 'What happens when I cancel?',
    a: 'You can cancel anytime with no cancellation fee. Your access continues until the end of your current billing period. We never charge after cancellation.',
  },
  {
    q: 'Is there a free trial?',
    a: 'We offer a 7-day free trial on the Standard plan for new members. No credit card required to start — you only pay if you decide to continue.',
  },
  {
    q: 'What devices can I watch on?',
    a: 'House Levi+ works on smart TVs, computers, phones, and tablets. The Mobile plan is limited to phones and tablets only.',
  },
];

// -- Check icon ----------------------------------------------------------------
function Check({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AboutPremiumPage() {
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const userIsPremium = isAuthenticated &&
    user?.isPremium &&
    user?.subscriptionStatus === 'ACTIVE';

  function handleGetPlan(planId: string) {
    if (!isAuthenticated) {
      redirectToLogin(planId);
    } else {
      redirectToCheckout(planId);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    }}>

      {/* -- Hero ----------------------------------------------------------- */}
      <div style={{
        textAlign: 'center',
        padding: 'clamp(60px, 10vw, 120px) 40px 80px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
      }}>
        <p style={{
          fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)', margin: '0 0 20px',
        }}>
          House Levi+
        </p>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 300,
          letterSpacing: '-0.02em', lineHeight: 1.05,
          margin: '0 0 24px', color: '#fff',
        }}>
          Unlimited African stories.<br />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>One subscription.</span>
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(255,255,255,0.55)',
          maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7,
        }}>
          Premium originals, live events, exclusive series and early releases.
          Watch on any device. Cancel anytime.
        </p>

        {userIsPremium ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', border: '1px solid rgba(255,255,255,0.15)',
            fontSize: 13, color: 'rgba(255,255,255,0.6)',
          }}>
            <Check size={14} /> You have an active Premium subscription
          </div>
        ) : (
          <button
            onClick={() => handleGetPlan('standard_plan')}
            style={{
              padding: '14px 40px', background: '#fff', color: '#000',
              border: 'none', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Get started
          </button>
        )}

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
          7-day free trial on Standard · No commitment · Cancel anytime
        </p>
      </div>

      {/* -- Pricing cards -------------------------------------------------- */}
      <div style={{ padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)' }}>
        <p style={{
          textAlign: 'center', fontSize: 11,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', marginBottom: 48,
        }}>
          Choose your plan
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16, maxWidth: 1100, margin: '0 auto',
        }}>
          {PLANS.map(plan => {
            const isPopular = plan.id === 'standard_plan';
            return (
              <div
                key={plan.id}
                style={{
                  border: isPopular
                    ? '2px solid rgba(255,255,255,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                  padding: '32px 24px 28px',
                  background: isPopular ? 'rgba(255,255,255,0.04)' : 'transparent',
                  display: 'flex', flexDirection: 'column', position: 'relative',
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%',
                    transform: 'translateX(-50%) translateY(-50%)',
                    background: '#fff', color: '#000',
                    fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '4px 12px', whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan name */}
                <p style={{
                  fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)', margin: '0 0 8px',
                }}>
                  {plan.name}
                </p>

                {/* Price */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 38, fontWeight: 300, color: '#fff' }}>
                    KES {plan.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>
                    /mo
                  </span>
                </div>

                {/* Quality */}
                <p style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.45)',
                  margin: '0 0 24px', letterSpacing: '0.04em',
                }}>
                  {plan.quality} · {plan.devices} screen{plan.devices > 1 ? 's' : ''}
                </p>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      fontSize: 13, color: 'rgba(255,255,255,0.65)',
                      marginBottom: 10, lineHeight: 1.4,
                    }}>
                      <span style={{ color: '#fff', marginTop: 2, flexShrink: 0 }}>
                        <Check size={13} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {userIsPremium ? (
                  <div style={{
                    textAlign: 'center', fontSize: 12,
                    color: 'rgba(255,255,255,0.3)', padding: '12px 0',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    Current plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleGetPlan(plan.id)}
                    style={{
                      width: '100%', padding: '12px',
                      background: isPopular ? '#fff' : 'transparent',
                      color: isPopular ? '#000' : 'rgba(255,255,255,0.7)',
                      border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                      fontSize: 12, fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!isPopular) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.5)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                      } else {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isPopular) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
                      } else {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                      }
                    }}
                  >
                    Get {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p style={{
          textAlign: 'center', fontSize: 11,
          color: 'rgba(255,255,255,0.2)', marginTop: 28, lineHeight: 1.7,
        }}>
          Prices shown in Kenyan Shillings. Taxes may apply depending on your location.
          <br />
          M-Pesa and card payments accepted. Cancel anytime — no hidden fees.
        </p>
      </div>

      {/* -- Comparison table ----------------------------------------------- */}
      <div style={{
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{
          textAlign: 'center', fontSize: 11,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', marginBottom: 40,
        }}>
          Compare plans
        </p>

        <div style={{ maxWidth: 900, margin: '0 auto', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left', padding: '12px 16px',
                  fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                  fontWeight: 400, borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  Feature
                </th>
                {PLANS.map(p => (
                  <th key={p.id} style={{
                    textAlign: 'center', padding: '12px 8px',
                    fontSize: p.id === 'standard_plan' ? 13 : 12,
                    fontWeight: p.id === 'standard_plan' ? 600 : 400,
                    color: p.id === 'standard_plan' ? '#fff' : 'rgba(255,255,255,0.5)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, i) => (
                <tr key={row.label} style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                  <td style={{
                    padding: '14px 16px', fontSize: 13,
                    color: 'rgba(255,255,255,0.55)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {row.label}
                  </td>
                  {row.values.map((val, j) => (
                    <td key={j} style={{
                      textAlign: 'center', padding: '14px 8px',
                      fontSize: 13,
                      color: val === '—'
                        ? 'rgba(255,255,255,0.18)'
                        : j === 2
                          ? '#fff'
                          : 'rgba(255,255,255,0.65)',
                      fontWeight: j === 2 ? 500 : 400,
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -- What you get section ------------------------------------------- */}
      <div style={{
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', marginBottom: 16,
        }}>
          What's included
        </p>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 300,
          letterSpacing: '-0.01em', margin: '0 0 60px', color: '#fff',
        }}>
          Everything on one platform
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40, maxWidth: 1000, margin: '0 auto', textAlign: 'left',
        }}>
          {[
            { icon: '?', title: 'Premium originals', desc: 'Exclusive series and films produced by HL+, nowhere else.' },
            { icon: '??', title: 'Live events',        desc: 'Watch theatre, concerts and cultural events as they happen.' },
            { icon: '?', title: 'Offline viewing',    desc: 'Download content and watch without internet connection.' },
            { icon: '??', title: 'All devices',        desc: 'Smart TV, laptop, phone or tablet — your choice.' },
            { icon: '??', title: 'Early releases',     desc: 'Standard and above get new content days before public.' },
            { icon: '?', title: 'VIP access',         desc: 'Premium VIP members get event invitations and merch discounts.' },
          ].map(item => (
            <div key={item.title}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{
                fontSize: 15, fontWeight: 500, color: '#fff',
                margin: '0 0 8px', letterSpacing: '-0.01em',
              }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* -- FAQ ------------------------------------------------------------ */}
      <div style={{
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        maxWidth: 800, margin: '0 auto',
      }}>
        <p style={{
          fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', marginBottom: 16, textAlign: 'center',
        }}>
          Frequently asked
        </p>
        <h2 style={{
          fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
          margin: '0 0 48px', textAlign: 'center', color: '#fff',
        }}>
          Questions
        </h2>

        {FAQS.map((faq, i) => (
          <div
            key={i}
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left', background: 'none',
                border: 'none', padding: '20px 0', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 16,
              }}
            >
              <span style={{ fontSize: 15, color: '#fff', fontWeight: 400, lineHeight: 1.4 }}>
                {faq.q}
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.4)', fontSize: 20, lineHeight: 1,
                flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.2s',
              }}>
                +
              </span>
            </button>
            {openFaq === i && (
              <p style={{
                fontSize: 14, color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.75, padding: '0 0 20px', margin: 0,
              }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* -- Bottom CTA ----------------------------------------------------- */}
      <div style={{
        textAlign: 'center',
        padding: 'clamp(60px, 8vw, 100px) 40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 48px)', fontWeight: 300,
          letterSpacing: '-0.02em', margin: '0 0 16px', color: '#fff',
        }}>
          Ready to watch?
        </h2>
        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.45)',
          margin: '0 0 36px', lineHeight: 1.6,
        }}>
          Join thousands of viewers already watching on House Levi+.
        </p>
        {!userIsPremium && (
          <button
            onClick={() => handleGetPlan('standard_plan')}
            style={{
              padding: '14px 48px', background: '#fff', color: '#000',
              border: 'none', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Start watching
          </button>
        )}
        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,0.2)',
          marginTop: 16, lineHeight: 1.7,
        }}>
          7-day free trial on Standard plan · Cancel anytime · No hidden fees
        </p>
      </div>

      <div style={{ height: 80 }} />
    </main>
  );
}
