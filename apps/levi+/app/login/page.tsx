'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isLoading) return;
    setIsLoading(true);
    setError(null);

    // Auto-detect device type using backend-accepted values:
    // phone | laptop | tv | tablet | unknown
    const ua = navigator.userAgent;
    const deviceType = /iPhone|iPod|Android.*Mobile/i.test(ua)
      ? 'phone'
      : /iPad|Android(?!.*Mobile)/i.test(ua)
      ? 'tablet'
      : 'laptop';

    const deviceName =
      deviceType === 'phone'
        ? 'Levi+ Mobile Admin'
        : deviceType === 'tablet'
        ? 'Levi+ Tablet Admin'
        : 'Levi+ Admin Panel';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
          password,
          deviceInfo: {
            deviceId: crypto.randomUUID(),
            deviceType,
            deviceName,
            os: navigator.platform,
            browser: ua,
            appVersion: '1.0.0',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Access denied.');
        return;
      }

      if (data.user?.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        return;
      }

      // Store in localStorage for app use
      localStorage.setItem('admin_token', data.accessToken);
      localStorage.setItem('admin_refresh', data.refreshToken);

      // Store in cookie for middleware route guard
      document.cookie = `admin_token=${data.accessToken}; path=/; max-age=600; SameSite=Strict`;

      router.push('/dashboard');
    } catch (err: any) {
      setError('Unable to connect. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100%;
          overflow: hidden;
          background: #f8f6f2;
        }

        .login-page {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%;
          height: 100dvh;
          background: #f8f6f2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }

        .login-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 480px;
        }

        .wordmark {
          font-family: 'Arial Black', sans-serif;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: #111111;
          text-transform: uppercase;
          line-height: 1;
          text-align: center;
          font-size: clamp(26px, 5.5vw, 52px);
          margin-bottom: 10px;
        }

        .wordmark-plus {
          color: #1b3d7b;
          font-size: 0.72em;
          vertical-align: super;
        }

        .verse {
          font-family: Georgia, serif;
          font-style: italic;
          color: #1a1a1a;
          text-align: center;
          font-size: clamp(10px, 1.4vw, 13px);
          white-space: nowrap;
          margin-bottom: clamp(28px, 5vh, 52px);
          line-height: 1;
        }

        .verse-bold {
          font-style: normal;
          font-weight: 700;
          color: #1b3d7b;
        }

        .verse-ref {
          font-family: Arial, sans-serif;
          font-size: 0.88em;
          font-style: normal;
          letter-spacing: 0.15em;
          color: #999;
          font-weight: 400;
        }

        .input-wrap {
          position: relative;
          width: 100%;
          margin-bottom: 10px;
        }

        .pwd-input {
          width: 100%;
          background: #ffffff;
          color: #1a1a1a;
          font-family: Arial, sans-serif;
          font-size: 14px;
          padding: 14px 90px 14px 18px;
          outline: none;
          border-radius: 1px;
          transition: border-color 0.2s;
        }

        .pwd-input:focus { border-color: #1b3d7b !important; }

        .show-hide-btn {
          position: absolute;
          right: 46px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          border-right: 1px solid #e8e5e0;
          cursor: pointer;
          font-size: 8px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #bbb;
          font-family: Arial, sans-serif;
          padding: 0 10px 0 0;
          height: 18px;
        }

        .arrow-btn {
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 44px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          border-radius: 0 1px 1px 0;
        }

        .error-box {
          width: 100%;
          padding: 9px 14px;
          border-left: 2px solid #a0291e;
          background: rgba(160,41,30,0.04);
        }

        .error-text {
          font-size: 11px;
          color: #a0291e;
          font-family: Arial, sans-serif;
        }

        .page-footer {
          position: fixed;
          bottom: 16px;
          left: 0; right: 0;
          text-align: center;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #d8d4cc;
          font-family: Arial, sans-serif;
        }

        .spinner {
          width: 12px; height: 12px;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 420px) {
          .verse {
            white-space: normal;
            font-size: 11px;
          }
        }
      `}</style>

      <div className="login-page">

        {/* Blue top bar */}
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: '#1b3d7b',
          zIndex: 100,
        }} />

        <div className="login-inner">

          {/* Wordmark */}
          <div className="wordmark">
            HOUSE LEVI
            <span className="wordmark-plus">+</span>
          </div>

          {/* Verse — all one line */}
          <p className="verse">
            &ldquo;And to Levi, I give no inheritance &mdash;{' '}
            <span className="verse-bold">the Levites shall be mine</span>
            &rdquo;{' '}
            <span className="verse-ref">— Deut. 10:9</span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>

            <div className="input-wrap">
              <input
                className="pwd-input"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Password"
                required
                autoComplete="current-password"
                autoFocus
                style={{
                  border: `1px solid ${error ? '#a0291e' : '#d8d4cc'}`,
                }}
              />

              <button
                type="button"
                className="show-hide-btn"
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>

              <button
                type="submit"
                className="arrow-btn"
                disabled={isLoading || !password}
                style={{
                  background: password && !isLoading ? '#1b3d7b' : '#ece9e4',
                  cursor: password && !isLoading ? 'pointer' : 'default',
                }}
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={password ? '#ffffff' : '#bbb'}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <div className="error-box">
                <span className="error-text">{error}</span>
              </div>
            )}

          </form>
        </div>

        <div className="page-footer">
          House Levi <span style={{ color: '#1b3d7b' }}>+</span>
          &nbsp;&middot;&nbsp; Levi+ v1.0
        </div>

      </div>
    </>
  );
}