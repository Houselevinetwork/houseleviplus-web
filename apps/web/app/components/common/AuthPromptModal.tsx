'use client';
/**
 * Location: apps/web/app/components/common/AuthPromptModal.tsx
 *
 * Netflix-style auth prompt. Appears OVER the current page (page stays
 * visible + dimmed). Never redirects without user consent.
 *
 * Props:
 *   isOpen        â€” controls visibility
 *   onClose       â€” called when user dismisses
 *   contentTitle  â€” name of what they tried to watch (optional)
 *   isPremium     â€” true â†’ "Premium Content" copy
 *   moodTV        â€” true â†’ "Live TV" copy
 */

import { useEffect, useRef } from 'react';

interface AuthPromptModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  contentTitle?: string;
  isPremium?:    boolean;
  moodTV?:       boolean;
}

function redirectToAuth(intent: 'login' | 'signup', returnTo: string) {
  const state = Math.random().toString(36).substring(2, 15);
  const nonce = Math.random().toString(36).substring(2, 15);
  const base  = process.env.NEXT_PUBLIC_AUTHORIZE_UI_URL || 'http://localhost:3003';
  window.location.href =
    `${base}/login?state=${state}&nonce=${nonce}&intent=${intent}&returnTo=${encodeURIComponent(returnTo)}`;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  contentTitle,
  isPremium = false,
  moodTV    = false,
}: AuthPromptModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const returnTo = typeof window !== 'undefined' ? window.location.pathname : '/watch';

  // Copy varies by context
  const heading = moodTV
    ? 'Watch Live TV'
    : isPremium
    ? 'Premium Content'
    : 'Sign in to watch';

  const subtext = moodTV
    ? 'HL Mood TV is a members-only 24/7 live channel. Sign in for free to tune in.'
    : isPremium
    ? 'This is exclusive premium content. Sign in and upgrade your plan to unlock it.'
    : 'Create a free account or sign in to start watching House Levi+.';

  // Icon varies by context
  const icon = moodTV ? (
    // TV / live icon
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
      <rect x="2" y="7" width="20" height="15" rx="2"/>
      <path d="M17 2l-5 5-5-5"/>
    </svg>
  ) : (
    // Play icon
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @keyframes apm-fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes apm-slide-up { from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .apm-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: apm-fade-in 0.2s ease both;
        }
        .apm-card {
          background: #141212;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          max-width: 440px; width: 100%;
          padding: 40px 36px 32px;
          position: relative;
          animation: apm-slide-up 0.25s ease both;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
        }
        .apm-close {
          position: absolute; top: 16px; right: 16px;
          width: 32px; height: 32px;
          background: transparent; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); border-radius: 50%;
          transition: background 0.15s, color 0.15s; padding: 0;
        }
        .apm-close:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
        .apm-icon {
          width: 48px; height: 48px; border-radius: 50%;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 0 20px;
        }
        .apm-heading {
          font-family: 'Bebas Neue', 'DM Sans', Arial, sans-serif;
          font-size: 28px; font-weight: 400; letter-spacing: 0.04em;
          color: #fff; margin: 0 0 8px; line-height: 1.1;
        }
        .apm-sub {
          font-family: 'DM Sans', Arial, sans-serif;
          font-size: 14px; color: rgba(255,255,255,0.55);
          margin: 0 0 28px; line-height: 1.5;
        }
        .apm-content-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px; margin-bottom: 24px;
        }
        .apm-content-pill span {
          font-family: 'DM Sans', Arial, sans-serif;
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .apm-actions { display: flex; flex-direction: column; gap: 10px; }
        .apm-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 14px 20px; border-radius: 4px;
          font-family: 'DM Sans', Arial, sans-serif;
          font-size: 15px; font-weight: 700; cursor: pointer;
          transition: background 0.2s, transform 0.15s; border: none;
          letter-spacing: 0.02em;
        }
        .apm-btn:active { transform: scale(0.98); }
        .apm-btn--signin  { background: #fff; color: #0A0909; }
        .apm-btn--signin:hover  { background: rgba(255,255,255,0.88); }
        .apm-btn--signup  { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.25); }
        .apm-btn--signup:hover  { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.45); }
        .apm-btn--later   { background: transparent; color: rgba(255,255,255,0.4); font-size: 13px; font-weight: 500; padding: 8px; margin-top: 2px; }
        .apm-btn--later:hover { color: rgba(255,255,255,0.7); }
        .apm-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0; }
        .apm-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .apm-divider-text { font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 0.08em; text-transform: uppercase; }
        .apm-free-note { font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 16px; line-height: 1.5; }
        @media(max-width:480px){ .apm-card{padding:32px 24px 24px} .apm-heading{font-size:24px} }
      `}</style>

      <div
        ref={overlayRef}
        className="apm-overlay"
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
      >
        <div className="apm-card">

          {/* Close */}
          <button className="apm-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          {/* Icon */}
          <div className="apm-icon">{icon}</div>

          {/* Heading + sub */}
          <h2 className="apm-heading">{heading}</h2>
          <p className="apm-sub">{subtext}</p>

          {/* Content title pill */}
          {contentTitle && (
            <div className="apm-content-pill">
              {moodTV
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37"><polygon points="5,3 19,12 5,21"/></svg>
              }
              <span>{contentTitle}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="apm-actions">
            <button
              className="apm-btn apm-btn--signin"
              onClick={() => redirectToAuth('login', returnTo)}
            >
              Sign In
            </button>

            <div className="apm-divider">
              <div className="apm-divider-line" />
              <span className="apm-divider-text">or</span>
              <div className="apm-divider-line" />
            </div>

            <button
              className="apm-btn apm-btn--signup"
              onClick={() => redirectToAuth('signup', returnTo)}
            >
              Create Free Account
            </button>

            <button className="apm-btn apm-btn--later" onClick={onClose}>
              Maybe later
            </button>
          </div>

          <p className="apm-free-note">
            Free to join Â· No credit card required Â· Cancel anytime
          </p>

        </div>
      </div>
    </>
  );
}
