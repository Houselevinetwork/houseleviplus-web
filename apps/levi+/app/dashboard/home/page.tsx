'use client';

import { useRouter } from 'next/navigation';

const sections = [
  { label: 'Gallery Events',   sub: 'Upload ZIP files, manage photo events',  href: '/dashboard/home/gallery',  icon: '🖼️' },
  { label: 'Upcoming Events',  sub: 'Create and manage upcoming events',       href: '/dashboard/home/events',   icon: '📅' },
  { label: 'Featured Artists', sub: 'Manage featured artists carousel',        href: '/dashboard/home/artists',  icon: '🎭' },
  { label: 'Partners',         sub: 'Upload partner logos',                    href: '/dashboard/home/partners', icon: '🤝' },
  { label: 'Site Config',      sub: 'Quote, hero mode, slideshow settings',    href: '/dashboard/home/config',   icon: '⚙️' },
];

export default function HomeDashboard() {
  const router = useRouter();
  return (
    <div style={{ padding: '48px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 8px' }}>
        Admin Dashboard
      </p>
      <h1 style={{ fontSize: 36, fontWeight: 300, margin: '0 0 48px', letterSpacing: '-0.01em' }}>
        Home Page
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
        {sections.map(s => (
          <div
            key={s.href}
            onClick={() => router.push(s.href)}
            style={{
              border: '1px solid rgba(0,0,0,0.12)', padding: '32px 28px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#000'; (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
          >
            <div style={{ fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>{s.label}</h3>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: 0, lineHeight: 1.5 }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
