'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '../../lib/auth';

type SubStatus = 'guest' | 'free' | 'premium';

const NAV_ITEMS = [
  { label: 'Overview',  path: '/dashboard' },
  { label: 'Watch',     path: '/dashboard/watch' },
  { label: 'Live & TV', path: '/dashboard/mood-tv' },
  { label: 'Shop',      path: '/dashboard/shop' },
  { label: 'Travel',    path: '/dashboard/travel' },
  { label: 'Home',  path: '/dashboard/home' },
  { label: 'Users',     path: '/dashboard/users' },
  { label: 'Analytics', path: '/dashboard/analytics' },
];

const Icon = {
  Search: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5l4 4" strokeLinecap="round"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
    </svg>
  ),
  Crown: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} fill="#FFD700" viewBox="0 0 24 24">
      <path d="M2 19l2-10 5 5 3-8 3 8 5-5 2 10H2z"/>
    </svg>
  ),
  Help: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="admin-nav-search-overlay" onClick={onClose}>
      <div className="admin-nav-search-box" onClick={e => e.stopPropagation()}>
        <div className="admin-nav-search-inner">
          <Icon.Search />
          <input ref={inputRef} className="admin-nav-search-input"
            placeholder="Search movies, shows, podcasts..." value={q}
            onChange={e => setQ(e.target.value)} />
          <button className="admin-nav-search-close" onClick={onClose}><Icon.Close /></button>
        </div>
        {q.length > 1 && (
          <p className="admin-nav-search-hint">
            Press <kbd>Enter</kbd> to search for <strong>"{q}"</strong>
          </p>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthContext();

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const subscriptionStatus: SubStatus = !isAuthenticated ? 'guest'
    : (user?.isPremium && user?.subscriptionStatus === 'ACTIVE') ? 'premium' : 'free';

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'HL';

  useEffect(() => {
    document.body.style.overflow = searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // /dashboard only highlights for exact match; others use startsWith
  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path);

  const go = (path: string) => router.push(path);
  const handleSignOut = async () => { await logout(); go('/login'); };

  return (
    <>
      <style>{`
        .admin-navbar-wrapper {
          position: fixed; left: 0; top: 0; right: 0; height: 56px;
          background: #0f1923; border-bottom: 1px solid rgba(255,255,255,0.06);
          z-index: 40; display: flex;
        }
        .admin-navbar {
          flex: 1; margin-left: 220px; display: flex; align-items: center;
          padding: 0 20px; gap: 2px;
          transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .sidebar-collapsed .admin-navbar { margin-left: 64px; }
        .admin-nav-links { display: flex; gap: 2px; align-items: center; flex: 1; }
        .admin-nav-link {
          background: none; border: none; color: rgba(255,255,255,0.45);
          font-family: Arial, sans-serif; font-size: 13px; font-weight: 400;
          letter-spacing: 0.02em; cursor: pointer; padding: 11px 12px;
          transition: color 0.2s, background 0.2s; white-space: nowrap;
          display: flex; align-items: center; border-radius: 6px; position: relative;
        }
        .admin-nav-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }
        .admin-nav-link--active { color: #ffffff; background: rgba(27,61,123,0.35); }
        .admin-nav-link--active::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px; background: #1b3d7b; border-radius: 0 2px 2px 0;
        }
        .admin-nav-right { display: flex; gap: 4px; align-items: center; margin-left: auto; flex-shrink: 0; }
        .admin-nav-icon {
          background: none; border: none; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.45);
          transition: color 0.2s, background 0.2s; border-radius: 6px; position: relative;
        }
        .admin-nav-icon:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }
        .admin-nav-account-wrap { position: relative; }
        .admin-nav-account-menu {
          position: absolute; top: calc(100% + 8px); right: 0; background: #1a2535;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 4px;
          min-width: 200px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          animation: dropdownSlideDown 0.15s ease; z-index: 50;
        }
        @keyframes dropdownSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-nav-account-header {
          padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; gap: 10px; align-items: center;
        }
        .admin-nav-account-avatar {
          width: 32px; height: 32px; border-radius: 50%; background: rgba(27,61,123,0.3);
          border: 1.5px solid rgba(27,61,123,0.5); display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 600; color: #fff; flex-shrink: 0;
        }
        .admin-nav-account-info { flex: 1; min-width: 0; }
        .admin-nav-account-name { margin: 0; font-size: 13px; font-weight: 500; color: #fff; display: flex; align-items: center; gap: 6px; }
        .admin-nav-account-tier { margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.45); }
        .admin-nav-account-item {
          display: flex; width: 100%; padding: 8px 12px; background: none; border: none;
          text-align: left; cursor: pointer; font-family: Arial, sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.6); transition: background 0.15s, color 0.15s;
          border-radius: 4px; align-items: center; gap: 8px;
        }
        .admin-nav-account-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); }
        .admin-nav-account-item--danger { color: rgba(224,85,85,0.8); }
        .admin-nav-account-item--danger:hover { background: rgba(224,85,85,0.08); color: #e05555; }
        .admin-nav-account-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 3px 0; }
        .admin-nav-avatar-initials {
          width: 32px; height: 32px; border-radius: 50%; background: rgba(27,61,123,0.3);
          border: 1.5px solid rgba(27,61,123,0.5); display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 600; color: #fff; position: relative;
        }
        .admin-nav-crown {
          position: absolute; bottom: -3px; right: -3px; background: #0f1923; border-radius: 50%;
          width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;
        }
        .admin-nav-search-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          z-index: 2000; display: flex; align-items: flex-start; justify-content: center;
          padding-top: 80px; animation: fadeInOverlay 0.15s ease;
        }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        .admin-nav-search-box {
          width: 100%; max-width: 520px; margin: 0 16px; background: #1a2535;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.5); overflow: hidden; animation: searchSlide 0.15s ease;
        }
        @keyframes searchSlide {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .admin-nav-search-inner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: rgba(255,255,255,0.4); }
        .admin-nav-search-input { flex: 1; background: none; border: none; outline: none; font-size: 14px; color: rgba(255,255,255,0.85); font-family: Arial, sans-serif; caret-color: #1b3d7b; }
        .admin-nav-search-input::placeholder { color: rgba(255,255,255,0.25); }
        .admin-nav-search-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; padding: 4px; transition: color 0.2s; }
        .admin-nav-search-close:hover { color: rgba(255,255,255,0.85); }
        .admin-nav-search-hint { font-size: 11px; color: rgba(255,255,255,0.25); padding: 0 16px 10px; margin: 0; }
        .admin-nav-search-hint kbd { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 3px; padding: 1px 5px; font-size: 10px; }
        .admin-nav-search-hint strong { color: rgba(255,255,255,0.5); }
        @media (max-width: 768px) {
          .admin-nav-links { display: none; }
          .admin-navbar { margin-left: 0 !important; padding: 0 12px; }
        }
      `}</style>

      <div className="admin-navbar-wrapper">
        <nav className="admin-navbar">
          <div className="admin-nav-links">
            {NAV_ITEMS.map(item => (
              <button key={item.path} onClick={() => go(item.path)}
                className={`admin-nav-link${isActive(item.path) ? ' admin-nav-link--active' : ''}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="admin-nav-right">
            <button className="admin-nav-icon" title="Search" onClick={() => setSearchOpen(true)}>
              <Icon.Search />
            </button>
            <button className="admin-nav-icon" title="Cart" onClick={() => go('/dashboard/orders')}>
              <Icon.Cart />
            </button>

            <div ref={accountRef} className="admin-nav-account-wrap">
              <button className="admin-nav-icon"
                title={isAuthenticated ? 'My Account' : 'Sign In'}
                onClick={() => setAccountOpen(o => !o)}>
                {isAuthenticated ? (
                  <div className="admin-nav-avatar-initials">
                    {userInitials}
                    {subscriptionStatus === 'premium' && (
                      <span className="admin-nav-crown"><Icon.Crown size={10} /></span>
                    )}
                  </div>
                ) : <Icon.User />}
              </button>

              {accountOpen && (
                <div className="admin-nav-account-menu">
                  {isAuthenticated ? (
                    <>
                      <div className="admin-nav-account-header">
                        <div className="admin-nav-account-avatar">{userInitials}</div>
                        <div className="admin-nav-account-info">
                          <p className="admin-nav-account-name">
                            {user?.firstName} {user?.lastName}
                            {subscriptionStatus === 'premium' && <Icon.Crown size={10} />}
                          </p>
                          <p className="admin-nav-account-tier">
                            {subscriptionStatus === 'premium' ? 'Premium Member' : 'Free Plan'}
                          </p>
                        </div>
                      </div>
                      <div className="admin-nav-account-divider" />
                      <button className="admin-nav-account-item" onClick={() => { go('/dashboard/settings'); setAccountOpen(false); }}>
                        <Icon.User /> My Account
                      </button>
                      <button className="admin-nav-account-item" onClick={() => { go('/dashboard/settings'); setAccountOpen(false); }}>
                        <Icon.Help /> Settings
                      </button>
                      <div className="admin-nav-account-divider" />
                      <button className="admin-nav-account-item admin-nav-account-item--danger"
                        onClick={() => { setAccountOpen(false); handleSignOut(); }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button className="admin-nav-account-item" onClick={() => { go('/login'); setAccountOpen(false); }}>
                      <Icon.User /> Sign In
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}