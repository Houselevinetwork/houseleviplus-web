'use client';

import { useEffect, useState } from 'react';

interface Partner {
  _id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch(`${API}/home/partners`)
      .then(r => r.json())
      .then(d => setPartners(d?.data ?? []))
      .catch(() => {});
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="partners-section">
      <h3>Our Partners</h3>
      <div className="partners-grid">
        {partners.map(p => (
          <div key={p._id} className="partner-logo">
            {p.websiteUrl ? (
              <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                {p.logoUrl
                  ? <img src={p.logoUrl} alt={p.name} style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain', filter: 'grayscale(100%)', opacity: 0.7, transition: 'all 0.3s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.filter = 'none'; (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(100%)'; (e.currentTarget as HTMLImageElement).style.opacity = '0.7'; }} />
                  : p.name}
              </a>
            ) : (
              p.logoUrl
                ? <img src={p.logoUrl} alt={p.name} style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain', filter: 'grayscale(100%)', opacity: 0.7 }} />
                : p.name
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
