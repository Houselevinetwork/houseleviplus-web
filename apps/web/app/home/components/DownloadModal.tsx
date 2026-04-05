'use client';

interface Props {
  imageUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Exact same pattern as Navbar.tsx redirectToLogin
const AUTH_UI_URL =
  process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL ||
  process.env.NEXT_PUBLIC_AUTHORIZE_UI_URL     ||
  'http://localhost:3003';

function redirectToLogin() {
  const state = Math.random().toString(36).substring(2, 15);
  const nonce = Math.random().toString(36).substring(2, 15);
  // Store gallery intent so we can show a toast when they return
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('hl_post_login_redirect', window.location.href);
    sessionStorage.setItem('hl_post_login_action', 'download');
  }
  window.location.href = `${AUTH_UI_URL}/login?state=${state}&nonce=${nonce}`;
}

export default function DownloadModal({ imageUrl, onClose, onSuccess }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', maxWidth: 420, width: '100%',
        padding: '48px 40px', position: 'relative',
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
          Ã—
        </button>

        <p style={{
          fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.35)', margin: '0 0 16px',
        }}>
          Download Photo
        </p>

        <h2 style={{
          fontSize: 26, fontWeight: 300,
          margin: '0 0 16px', letterSpacing: '-0.01em',
        }}>
          Sign in to download
        </h2>

        <p style={{
          fontSize: 14, color: 'rgba(0,0,0,0.6)',
          lineHeight: 1.75, margin: '0 0 32px',
        }}>
          No password needed â€” just your email address.
          We&apos;ll send a one-time code and you&apos;re in instantly.
        </p>

        <button
          onClick={redirectToLogin}
          style={{
            width: '100%', height: 48,
            background: '#000', color: '#fff',
            border: 'none', fontSize: 13,
            fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Continue with Email
        </button>

        <p style={{
          fontSize: 11, color: 'rgba(0,0,0,0.35)',
          textAlign: 'center', margin: '16px 0 0',
          lineHeight: 1.6,
        }}>
          You&apos;ll be redirected to sign in, then brought back here.
        </p>
      </div>
    </div>
  );
}
