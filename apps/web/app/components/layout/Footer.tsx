'use client';

import { useRouter } from 'next/navigation';
import './footer.css';

const SOCIALS = [
  { label: 'Facebook',  href: 'https://web.facebook.com/houseleviplus',
    icon: <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  { label: 'Instagram', href: 'https://www.instagram.com/houseleviplus/',
    icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  },
  { label: 'TikTok', href: 'https://www.tiktok.com/@houseleviplus',
    icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.74a4.85 4.85 0 01-1.02-.05z"/></svg>,
  },
  { label: 'X', href: 'https://x.com/houseleviplus',
    icon: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
];

const APP_BADGES = [
  { label: 'App Store',   sub: 'Download on the', href: '#',
    icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
  },
  { label: 'Google Play', sub: 'Get it on', href: '#',
    icon: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M3.18 23.76c.35.2.76.2 1.12.02l12.5-7.01-2.8-2.8-10.82 9.79zM.29 1.32C.11 1.7 0 2.14 0 2.64v18.72c0 .5.11.94.29 1.32l.09.09 10.49-10.49v-.25L.38 1.23l-.09.09zM20.13 10.5l-2.81-1.58-3.13 3.13 3.13 3.13 2.82-1.59c.81-.45.81-1.64-.01-2.09zM4.3.22L16.8 7.23l-2.8 2.8L3.18.24C3.54.06 3.95.07 4.3.22z"/></svg>,
  },
];

const LEGAL = [
  { label: 'Privacy Policy',   path: '/privacy' },
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Cookie Policy',    path: '/cookies' },
  { label: 'Accessibility',    path: '/accessibility' },
];

const DpaIcon = () => (
  <abbr title="Data Protection Act Compliant" className="footer-dpa" aria-label="DPA Compliant">
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2L4 6v6c0 5 3.5 9.3 8 10.3C16.5 21.3 20 17 20 12V6l-8-4z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>DPA Compliant</span>
  </abbr>
);

export function Footer() {
  const router = useRouter();

  return (
    <footer className="footer">
      <div className="footer-wrap">

        {/* -- 3-column grid: Brand | Legal links | Socials + Badges -- */}
        <div className="footer-grid">

          {/* Left: Brand */}
          <div className="footer-brand">
            <button onClick={() => router.push('/')} className="footer-logo">
              HOUSE LEVI<span className="footer-logo-plus">+</span>
            </button>
            <p className="footer-sub">
              Authentic African stories,<br />premium streaming experience
            </p>
          </div>

          {/* Center: Legal links vertical */}
          <div className="footer-legal-links">
            {LEGAL.map(l => (
              <button key={l.path} onClick={() => router.push(l.path)} className="footer-legal-link">
                {l.label}
              </button>
            ))}
          </div>

          {/* Right: Socials + App badges */}
          <div className="footer-right">
            <div className="footer-socials">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="footer-icon" aria-label={s.label}>
                  {s.icon}
                  <span className="footer-icon-glow" aria-hidden />
                </a>
              ))}
            </div>
            <div className="footer-badges">
              {APP_BADGES.map(b => (
                <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer"
                  className="footer-badge" aria-label={b.label}>
                  <span className="footer-badge-icon">{b.icon}</span>
                  <span className="footer-badge-text">
                    <span className="footer-badge-sub">{b.sub}</span>
                    <span className="footer-badge-name">{b.label}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* -- Divider -- */}
        <div className="footer-rule" />

        {/* -- Bottom bar -- */}
        <div className="footer-bottom">
          <p className="footer-copy">
            2026 House Levitika Plus Ltd. All rights reserved.
            <span className="footer-sep" aria-hidden></span>
            <button onClick={() => router.push('/cookies')} className="footer-cookie-link">
          Cookie Policy
            </button>
          </p>
          <DpaIcon />
        </div>

      </div>
    </footer>
  );
}
