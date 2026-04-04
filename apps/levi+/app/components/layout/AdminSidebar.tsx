'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Revenue',
    href: '/dashboard/revenue',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Devices',
    href: '/dashboard/devices',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
    document.cookie = 'admin_token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <>
      <style>{`
        .sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: ${collapsed ? '64px' : '220px'};
          background: #0f1923;
          display: flex;
          flex-direction: column;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          z-index: 50;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-top {
          padding: ${collapsed ? '20px 0' : '20px 20px'};
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? 'center' : 'space-between'};
          border-bottom: 1px solid rgba(255,255,255,0.06);
          min-height: 64px;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.2s;
          white-space: nowrap;
          overflow: hidden;
        }

        .brand-wordmark {
          font-family: 'Arial Black', sans-serif;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: #ffffff;
          text-transform: uppercase;
        }

        .brand-plus {
          color: #1b3d7b;
          font-size: 11px;
          vertical-align: super;
        }

        .collapse-btn {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }

        .collapse-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #ffffff;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-nav::-webkit-scrollbar { width: 0; }

        .nav-section-label {
          font-family: Arial, sans-serif;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          padding: ${collapsed ? '0' : '0 20px'};
          margin: 12px 0 6px;
          white-space: nowrap;
          overflow: hidden;
          text-align: ${collapsed ? 'center' : 'left'};
          opacity: ${collapsed ? 0 : 1};
          height: ${collapsed ? '0' : 'auto'};
          transition: opacity 0.2s;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${collapsed ? '11px 0' : '11px 20px'};
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
          white-space: nowrap;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          text-decoration: none;
          color: rgba(255,255,255,0.45);
          font-family: Arial, sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
        }

        .nav-item.active {
          color: #ffffff;
          background: rgba(27,61,123,0.35);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: #1b3d7b;
        }

        .nav-icon {
          flex-shrink: 0;
          width: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
          overflow: hidden;
        }

        /* Tooltip when collapsed */
        .nav-item-wrap {
          position: relative;
          width: 100%;
        }

        .nav-item-wrap:hover .tooltip {
          opacity: 1;
          pointer-events: auto;
        }

        .tooltip {
          position: absolute;
          left: 68px;
          top: 50%;
          transform: translateY(-50%);
          background: #1a2535;
          color: #fff;
          font-family: Arial, sans-serif;
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 2px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          z-index: 100;
          display: ${collapsed ? 'block' : 'none'};
          border: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-bottom {
          padding: 16px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${collapsed ? '11px 0' : '11px 20px'};
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          color: rgba(255,255,255,0.3);
          font-family: Arial, sans-serif;
          font-size: 13px;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }

        .logout-btn:hover {
          color: #e05555;
          background: rgba(224,85,85,0.07);
        }

        .logout-label {
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
        }
      `}</style>

      <aside className="sidebar">

        {/* Top — Brand + Collapse */}
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="brand-wordmark">
              House Levi<span className="brand-plus">+</span>
            </span>
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(v => !v)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Overview</div>

          {sidebarItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <div key={item.href} className="nav-item-wrap">
                <button
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => router.push(item.href)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
                {collapsed && (
                  <span className="tooltip">{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom — Logout */}
        <div className="sidebar-bottom">
          <div className="nav-item-wrap">
            <button className="logout-btn" onClick={handleLogout}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span className="logout-label">Sign Out</span>
            </button>
            {collapsed && <span className="tooltip">Sign Out</span>}
          </div>
        </div>

      </aside>
    </>
  );
}