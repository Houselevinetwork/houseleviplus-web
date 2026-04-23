'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthPromptModal } from '../common/AuthPromptModal';
import './navbar.css';

// ─── Types ────────────────────────────────────────────────────────
type SubStatus = 'guest' | 'free' | 'premium';

// ─── Production URLs ──────────────────────────────────────────────
const AUTHORIZE_URL = process.env.NEXT_PUBLIC_AUTHORIZE_UI_URL ?? 'https://authorize.houselevi.com';
const GOPREMIUM_URL = process.env.NEXT_PUBLIC_GOPREMIUM_URL    ?? 'https://gopremium.houselevi.com';
const SHOP_URL      = 'https://store.houselevi.com';
const LIFESTYLE_URL = 'https://lifestyle.houselevi.com';

// ─── Nav items ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',           path: '/home',            internal: true  },
  { label: 'Premium Access', path: '/premium-access',  internal: true  },
  { label: 'Shop',           path: SHOP_URL,           internal: false },
  { label: 'HL+ Lifestyle',  path: LIFESTYLE_URL,      internal: false },
  { label: 'HL Live TV',     path: '/live-tv',          internal: true  },
];

function redirectToGoPremium() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
  window.location.href = token
    ? `${GOPREMIUM_URL}/choose-plans?t=${encodeURIComponent(token)}`
    : `${GOPREMIUM_URL}/choose-plans`;
}

/** Read session cookie set by authorize.houselevi.com */
function getSessionToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)hl_session=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Minimal user data from JWT payload (base64 decode middle segment) */
function parseSessionUser(token: string): Record<string, string> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch { return null; }
}

// ─── Icons ────────────────────────────────────────────────────────
const Icon = {
  Search: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5l4 4" strokeLinecap="round"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
    </svg>
  ),
  Cart: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
      <line x1="9" y1="7" x2="15" y2="7" strokeLinecap="round"/>
    </svg>
  ),
  Crown: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} fill="#F6F4F0" viewBox="0 0 24 24">
      <path d="M2 19l2-10 5 5 3-8 3 8 5-5 2 10H2z"/>
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

// ─── Search overlay ───────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const handleSearch = () => {
    if (q.trim()) window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <div className="nav-search-overlay" onClick={onClose}>
      <div className="nav-search-box" onClick={e => e.stopPropagation()}>
        <div className="nav-search-inner">
          <Icon.Search />
          <input
            ref={inputRef}
            className="nav-search-input"
            placeholder="Search movies, shows, podcasts..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="nav-search-close" onClick={onClose}><Icon.Close /></button>
        </div>
        {q.length > 1 && (
          <p className="nav-search-hint">
            Press <kbd>Enter</kbd> to search for <strong>&ldquo;{q}&rdquo;</strong>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Cart count (reads localStorage, cross-tab aware) ─────────────
function useCartCount(isAuthenticated: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setCount(0); return; }
    const update = () => {
      try {
        const stored = localStorage.getItem('hl_cart');
        const items  = stored ? JSON.parse(stored) : [];
        setCount(items.reduce((s: number, i: { qty?: number }) => s + (i.qty ?? 0), 0));
      } catch { /* ignore */ }
    };
    update();
    window.addEventListener('hl_cart_updated', update);
    return () => window.removeEventListener('hl_cart_updated', update);
  }, [isAuthenticated]);

  return count;
}

function getUserInitials(user: Record<string, string> | null): string {
  if (user?.firstName && user?.lastName)
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  if (user?.given_name && user?.family_name)
    return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
  if (user?.firstName) return user.firstName[0].toUpperCase();
  if (user?.email)     return user.email[0].toUpperCase();
  return 'HL';
}

// ─── Main Navbar ──────────────────────────────────────────────────
export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();

  // Auth state — reads from localStorage (set by callback page) with cookie fallback
  const [sessionToken,    setSessionToken]    = useState<string | null>(null);
  const [user,            setUser]            = useState<Record<string, string> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [accountOpen,   setAccountOpen]   = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const cartCount  = useCartCount(isAuthenticated);

  // ─── Auth loader — reads localStorage first, falls back to cookie ──
  const loadAuth = useCallback(() => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken') ||
      getSessionToken(); // cookie fallback

    setSessionToken(token);
    setIsAuthenticated(!!token);

    if (token) {
      // Try to get richer user data from stored user object first
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }
      } catch { /* fall through to JWT parse */ }
      setUser(parseSessionUser(token));
    } else {
      setUser(null);
    }
  }, []);

  // Read session on mount + react to login/logout events
  useEffect(() => {
    loadAuth();

    // Fires when another tab writes to localStorage (cross-tab login/logout)
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'token' ||
        e.key === 'accessToken' ||
        e.key === 'user' ||
        e.key === null // localStorage.clear() was called
      ) {
        loadAuth();
      }
    };

    // Fires on the SAME tab after the callback page stores the token and
    // dispatches this custom event — window.storage does NOT fire same-tab
    const handleAuthUpdated = () => loadAuth();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('hl_auth_updated', handleAuthUpdated);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hl_auth_updated', handleAuthUpdated);
    };
  }, [loadAuth]);

  const subscriptionStatus: SubStatus = !isAuthenticated
    ? 'guest'
    : user?.isPremium === 'true' ? 'premium' : 'free';

  const userInitials = getUserInitials(user);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen || mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen, mobileOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const go = (path: string) => {
    if (path.startsWith('http')) { window.location.href = path; return; }
    router.push(path);
  };

  const redirectToLogin = useCallback(() => {
    const state = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 15);
    window.location.href = `${AUTHORIZE_URL}/login?state=${state}&nonce=${nonce}&redirect=${encodeURIComponent(window.location.origin + '/home')}`;
  }, []);

  const handleLogoClick = useCallback(() => {
    sessionStorage.setItem('splashShown', 'true');
    router.push('/home');
  }, [router]);

const handleMoodTVClick = useCallback((closeMobile = false) => {
    if (closeMobile) setMobileOpen(false);
    if (!isAuthenticated) { setShowMoodModal(true); } else { go('/live-tv'); }
  }, [isAuthenticated]);

  const handleCtaClick = () => {
    if (subscriptionStatus === 'premium') return;
    if (subscriptionStatus === 'guest') redirectToLogin();
    else redirectToGoPremium();
  };

  const handleSignOut = () => {
    // Clear session cookie (houselevi.com domain)
    document.cookie = 'hl_session=; Max-Age=0; path=/; domain=.houselevi.com';
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('hl_cart');
    sessionStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUser(null);
    setSessionToken(null);
    // Notify other tabs
    window.dispatchEvent(new Event('hl_auth_updated'));
    router.push('/home');
  };

  const ctaConfig = {
    guest:   { label: 'Join HL+',    mod: '' },
    free:    { label: 'Go Premium',  mod: 'nav-cta--subscribe' },
    premium: { label: 'HL+ Premium', mod: 'nav-cta--premium' },
  };
  const cta = ctaConfig[subscriptionStatus];

  const handleCartClick = () => {
    if (!isAuthenticated) { redirectToLogin(); return; }
    window.location.href = `${SHOP_URL}/cart`;
  };

  const renderNavItem = (item: typeof NAV_ITEMS[0], mobile = false) => {
    const isActive = item.internal && pathname === item.path;
    const className = mobile
      ? `nav-mobile-link${isActive ? ' nav-mobile-link--active' : ''}`
      : `nav-link${isActive ? ' nav-link--active' : ''}`;

    if (item.path === '/live-tv') {
      return (
        <button key={item.path} className={className}
          onClick={() => { if (mobile) setMobileOpen(false); handleMoodTVClick(); }}>
          {item.label}
        </button>
      );
    }

    return (
      <button key={item.path} className={className}
        onClick={() => { if (mobile) setMobileOpen(false); go(item.path); }}>
        {item.label}
      </button>
    );
  };

  return (
    <>
      <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <div className="nav-container">

          {/* Logo */}
          <button onClick={handleLogoClick} className="nav-logo">
            HOUSE LEVI<span className="nav-logo-plus">+</span>
          </button>

          {/* Desktop nav */}
          <nav className="nav-desktop-menu">
            <button
              onClick={() => go('/watch')}
              className={`nav-link${pathname === '/watch' ? ' nav-link--active' : ''}`}
            >
              Watch
            </button>
            {NAV_ITEMS.slice(1).map(item => renderNavItem(item, false))}
          </nav>

          {/* Desktop right actions */}
          <div className="nav-desktop-actions">
            <button className="nav-action-btn" title="Search" onClick={() => setSearchOpen(true)}>
              <Icon.Search />
              <span className="nav-action-label">Search</span>
            </button>

            <button className="nav-action-btn" title="Download App" onClick={() => go('/download')}>
              <Icon.Download />
              <span className="nav-action-label">App</span>
            </button>

            <button
              className="nav-action-btn nav-cart"
              title={isAuthenticated ? 'Shopping Cart' : 'Sign in to use cart'}
              onClick={handleCartClick}
            >
              <Icon.Cart />
              {isAuthenticated && cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount}</span>
              )}
            </button>

            <div className="nav-divider" />

            {isAuthenticated && (
              <div ref={accountRef} className="nav-account-wrapper">
                <button
                  className="nav-action-btn nav-avatar-btn"
                  title="My Account"
                  onClick={() => setAccountOpen(o => !o)}
                >
                  <div className="nav-avatar-initials">
                    {userInitials}
                    {subscriptionStatus === 'premium' && (
                      <span className="nav-crown"><Icon.Crown size={9} /></span>
                    )}
                  </div>
                </button>

                {accountOpen && (
                  <div className="nav-account-menu">
                    <div className="nav-account-header">
                      <div className="nav-account-avatar">{userInitials}</div>
                      <div>
                        <p className="nav-account-name">
                          {user?.firstName ?? user?.given_name ?? user?.email?.split('@')[0]}{' '}
                          {user?.lastName ?? user?.family_name ?? ''}
                        </p>
                        <p className="nav-account-tier">
                          {subscriptionStatus === 'premium' ? 'Premium Member' : 'Free Plan'}
                        </p>
                      </div>
                    </div>
                    <div className="nav-account-divider" />

                    <button className="nav-account-item"
                      onClick={() => { go('/dashboard/account'); setAccountOpen(false); }}>
                      My Account
                    </button>
                    <button className="nav-account-item"
                      onClick={() => { go('/help'); setAccountOpen(false); }}>
                      <Icon.Help /> Help Center
                    </button>

                    <div className="nav-account-divider" />
                    <button className="nav-account-item"
                      onClick={() => { window.location.href = SHOP_URL; setAccountOpen(false); }}>
                      HL+ Shop
                    </button>
                    <button className="nav-account-item"
                      onClick={() => { window.location.href = LIFESTYLE_URL; setAccountOpen(false); }}>
                      HL+ Lifestyle
                    </button>

                    {subscriptionStatus !== 'premium' && (
                      <>
                        <div className="nav-account-divider" />
                        <button
                          className="nav-account-item nav-account-item--upgrade"
                          onClick={() => { setAccountOpen(false); redirectToGoPremium(); }}
                        >
                          Go Premium
                        </button>
                      </>
                    )}

                    <div className="nav-account-divider" />
                    <button className="nav-account-item nav-account-item--danger"
                      onClick={() => { setAccountOpen(false); handleSignOut(); }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              className={`nav-cta ${cta.mod}`}
              onClick={handleCtaClick}
              disabled={subscriptionStatus === 'premium'}
            >
              {subscriptionStatus === 'premium' && <Icon.Crown size={12} />}
              {cta.label}
            </button>
          </div>

          {/* Mobile actions */}
          <div className="nav-mobile-actions">
            <button className="nav-mobile-btn" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? 'Close' : 'Menu'}
            </button>
            <button
              className={`nav-cta nav-cta--mobile ${cta.mod}`}
              onClick={handleCtaClick}
              disabled={subscriptionStatus === 'premium'}
            >
              {subscriptionStatus === 'premium' && <Icon.Crown size={11} />}
              {cta.label}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <>
            <div className="nav-mobile-backdrop" onClick={() => setMobileOpen(false)} />
            <div className="nav-mobile-menu">
              <button className="nav-mobile-link"
                onClick={() => { go('/watch'); setMobileOpen(false); }}>
                Watch
              </button>
              {NAV_ITEMS.slice(1).map(item => renderNavItem(item, true))}

              <div className="nav-mobile-utils">
                <button className="nav-mobile-util"
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>
                  <Icon.Search /> Search
                </button>
                <button className="nav-mobile-util"
                  onClick={() => { go('/download'); setMobileOpen(false); }}>
                  <Icon.Download /> Get App
                </button>
              </div>
              <div className="nav-mobile-divider" />

              {isAuthenticated ? (
                <>
                  <button className="nav-mobile-link"
                    onClick={() => { window.location.href = `${SHOP_URL}/cart`; setMobileOpen(false); }}>
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </button>
                  <button className="nav-mobile-link"
                    onClick={() => { go('/dashboard/account'); setMobileOpen(false); }}>
                    My Account
                  </button>
                  <button className="nav-mobile-link"
                    onClick={() => { go('/help'); setMobileOpen(false); }}>
                    Help Center
                  </button>
                  {subscriptionStatus !== 'premium' && (
                    <button className="nav-mobile-link nav-mobile-link--upgrade"
                      onClick={() => { setMobileOpen(false); redirectToGoPremium(); }}>
                      Go Premium
                    </button>
                  )}
                  <button className="nav-mobile-link nav-mobile-link--danger"
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button className="nav-mobile-link"
                    onClick={() => { setMobileOpen(false); redirectToLogin(); }}>
                    Sign In
                  </button>
                  <button className="nav-mobile-link nav-mobile-link--upgrade"
                    onClick={() => { setMobileOpen(false); redirectToLogin(); }}>
                    Join HL+
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      <AuthPromptModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        contentTitle="HL Live TV - 24/7 Live"
        moodTV
      />
    </>
  );
}