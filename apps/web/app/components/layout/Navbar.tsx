'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@houselevi/auth';
import { AuthPromptModal } from '../common/AuthPromptModal';
import './navbar.css';

// Types
type SubStatus = 'guest' | 'free' | 'premium';

// Nav items - Watch is rendered separately first
const NAV_ITEMS = [
  { label: 'Home',           path: '/home' },
  { label: 'Premium Access', path: '/premium-access' },
  { label: 'Shop',           path: '/shop' },
  { label: 'Travel',         path: '/travel' },
  { label: 'HL Live TV',     path: '/live-tv' },
];

const GO_PREMIUM_URL =
  process.env.NEXT_PUBLIC_GOPREMIUM_URL || 'https://gopremium.houselevi.com';

function redirectToGoPremium() {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || ''
      : '';
  const dest = token
    ? `${GO_PREMIUM_URL}/choose-plans?t=${encodeURIComponent(token)}`
    : `${GO_PREMIUM_URL}/choose-plans`;
  window.location.href = dest;
}

// Icons
const Icon = {
  Search: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5l4 4" strokeLinecap="round" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  ),
  Cart: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
      <line x1="9" y1="7" x2="15" y2="7" strokeLinecap="round" />
    </svg>
  ),
  Crown: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} fill="#FFD700" viewBox="0 0 24 24">
      <path d="M2 19l2-10 5 5 3-8 3 8 5-5 2 10H2z" />
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
};

// Search Overlay
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

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
          />
          <button className="nav-search-close" onClick={onClose}><Icon.Close /></button>
        </div>
        {q.length > 1 && (
          <p className="nav-search-hint">
            Press <kbd>Enter</kbd> to search for <strong>"{q}"</strong>
          </p>
        )}
      </div>
    </div>
  );
}

// Cart count hook - authenticated users only
function useCartCount() {
  const { isAuthenticated } = useAuthContext();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setCount(0); return; }
    const updateCount = () => {
      try {
        const stored = localStorage.getItem('hl_cart');
        const items  = stored ? JSON.parse(stored) : [];
        setCount(items.reduce((sum: number, item: any) => sum + (item.qty || 0), 0));
      } catch { /* ignore */ }
    };
    updateCount();
    window.addEventListener('hl_cart_updated', updateCount);
    return () => window.removeEventListener('hl_cart_updated', updateCount);
  }, [isAuthenticated]);

  return count;
}

// User initials helper
function getUserInitials(user: any): string {
  if (user?.firstName && user?.lastName)
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  if (user?.firstName) return user.firstName[0].toUpperCase();
  if (user?.email)     return user.email[0].toUpperCase();
  return 'HL';
}

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthContext();
  const cartCount = useCartCount();

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [accountOpen,   setAccountOpen]   = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const subscriptionStatus: SubStatus = !isAuthenticated
    ? 'guest'
    : user?.isPremium && user?.subscriptionStatus === 'ACTIVE'
      ? 'premium'
      : 'free';

  const userInitials = getUserInitials(user);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
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

  const go = (path: string) => router.push(path);

  const redirectToLogin = useCallback(() => {
    const state = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 15);
    window.location.href = `${process.env.NEXT_PUBLIC_AUTHORIZE_UI_URL || "https://authorize.houselevi.com"}/login?state=${state}&nonce=${nonce}`;
  }, []);

  const handleMoodTVClick = useCallback((closeMobile = false) => {
    if (closeMobile) setMobileOpen(false);
    if (!isAuthenticated) {
      setShowMoodModal(true);
    } else {
      go('/mood-tv');
    }
  }, [isAuthenticated]);

  const handleCtaClick = () => {
    if (subscriptionStatus === 'premium') return;
    if (subscriptionStatus === 'guest') {
      redirectToLogin();
    } else {
      redirectToGoPremium();
    }
  };

  const handleSignOut = async () => {
    await logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hl_cart');
    go('/home');
  };

  const ctaConfig = {
    guest:   { label: 'Join HL+',    mod: '' },
    free:    { label: 'Go Premium',  mod: 'nav-cta--subscribe' },
    premium: { label: 'HL+ Premium', mod: 'nav-cta--premium' },
  };
  const cta = ctaConfig[subscriptionStatus];

  const handleCartClick = () => {
    if (!isAuthenticated) { redirectToLogin(); return; }
    go('/shop/cart');
  };

  const renderDesktopNavItem = (item: { label: string; path: string }) => {
    if (item.path === '/mood-tv') {
      return (
        <button
          key={item.path}
          onClick={() => handleMoodTVClick()}
          className={`nav-link${pathname === item.path ? ' nav-link--active' : ''}`}
        >
          {item.label}
        </button>
      );
    }
    return (
      <button
        key={item.path}
        onClick={() => go(item.path)}
        className={`nav-link${pathname === item.path ? ' nav-link--active' : ''}`}
      >
        {item.label}
      </button>
    );
  };

  const renderMobileNavItem = (item: { label: string; path: string }) => {
    if (item.path === '/mood-tv') {
      return (
        <button
          key={item.path}
          className="nav-mobile-link"
          onClick={() => handleMoodTVClick(true)}
        >
          {item.label}
        </button>
      );
    }
    return (
      <button
        key={item.path}
        className="nav-mobile-link"
        onClick={() => { go(item.path); setMobileOpen(false); }}
      >
        {item.label}
      </button>
    );
  };

  return (
    <>
      <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <div className="nav-container">

          {/* Logo */}
          <button onClick={() => go('/')} className="nav-logo">
            HOUSE LEVI<span className="nav-logo-plus">+</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="nav-desktop-menu">
            <button
              onClick={() => go('/watch')}
              className={`nav-link${pathname === '/watch' ? ' nav-link--active' : ''}`}
            >
              Watch
            </button>
            {NAV_ITEMS.slice(1).map(renderDesktopNavItem)}
          </nav>

          {/* Desktop Right Actions */}
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
              disabled={!isAuthenticated}
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
                  onClick={() => setAccountOpen(!accountOpen)}
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
                          {user?.firstName || user?.email?.split('@')[0]} {user?.lastName || ''}
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

          {/* Mobile Actions */}
          <div className="nav-mobile-actions">
            <button className="nav-icon" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Icon.Search />
            </button>
            <button
              className="nav-icon nav-cart"
              title={isAuthenticated ? 'Shopping Cart' : 'Sign in to use cart'}
              onClick={handleCartClick}
              disabled={!isAuthenticated}
            >
              <Icon.Cart />
              {isAuthenticated && cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount}</span>
              )}
            </button>
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

        {/* Mobile Menu */}
        {mobileOpen && (
          <>
            <div className="nav-mobile-backdrop" onClick={() => setMobileOpen(false)} />
            <div className="nav-mobile-menu">
              <div className="nav-mobile-section">
                <button className="nav-mobile-link"
                  onClick={() => { go('/watch'); setMobileOpen(false); }}>
                  Watch
                </button>
              </div>

              {NAV_ITEMS.slice(1).map(renderMobileNavItem)}

              <div className="nav-mobile-utils">
                <button className="nav-mobile-util"
                  onClick={() => { go('/download'); setMobileOpen(false); }}>
                  <Icon.Download /> Get App
                </button>
              </div>
              <div className="nav-mobile-divider" />

              {isAuthenticated ? (
                <>
                  <button className="nav-mobile-link"
                    onClick={() => { go('/dashboard/account'); setMobileOpen(false); }}>
                    My Account
                  </button>
                  <button className="nav-mobile-link"
                    onClick={() => { go('/help'); setMobileOpen(false); }}>
                    Help Center
                  </button>
                  {subscriptionStatus !== 'premium' && (
                    <button
                      className="nav-mobile-link nav-mobile-link--upgrade"
                      onClick={() => { setMobileOpen(false); redirectToGoPremium(); }}
                    >
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