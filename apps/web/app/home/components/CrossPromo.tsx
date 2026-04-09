'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface WatchItem  { _id: string; title: string; thumbnailUrl?: string; type?: string; }
interface ShopItem   { _id: string; name: string; images?: string[]; price?: number; }
interface TravelItem { id?: string; _id?: string; title?: string; destination?: string; images?: string[]; priceFrom?: number; }

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

function SectionRow({ title, subtitle, href, children }: {
  title: string; subtitle: string; href: string; children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div style={{ padding: '80px 60px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <p className="section-subtitle" style={{ marginTop: 8 }}>{subtitle}</p>
        </div>
        <button
          onClick={() => router.push(href)}
          style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.55)', textDecoration: 'underline' }}
        >
          View all
        </button>
      </div>
      <div className="content-carousel">{children}</div>
    </div>
  );
}

export default function CrossPromo() {
  const [watchItems, setWatchItems]   = useState<WatchItem[]>([]);
  const [shopItems, setShopItems]     = useState<ShopItem[]>([]);
  const [travelItems, setTravelItems] = useState<TravelItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/api/content?limit=4`).then(r => r.json())
      .then(d => setWatchItems((d?.data ?? d ?? []).slice(0, 4))).catch(() => {});
    fetch(`${API}/products?limit=4`).then(r => r.json())
      .then(d => setShopItems((d?.data ?? d ?? []).slice(0, 4))).catch(() => {});
    fetch(`${API}/travel/packages?status=active`).then(r => r.json())
      .then(d => setTravelItems((d?.data ?? d ?? []).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <>
      {/* Watch */}
      {watchItems.length > 0 && (
        <SectionRow title="Watch" subtitle="Featured content" href="/watch">
          {watchItems.map(item => (
            <div key={item._id} className="carousel-card" onClick={() => router.push('/watch')}>
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt={item.title} />
                : <div style={{ width: '100%', height: 280, background: '#111', marginBottom: 20 }} />}
              <h4>{item.title}</h4>
              <button className="play-button">? Play</button>
            </div>
          ))}
        </SectionRow>
      )}

      {/* Shop */}
      {shopItems.length > 0 && (
        <SectionRow title="Shop" subtitle="Exclusive merchandise" href="/shop">
          {shopItems.map(item => (
            <div key={item._id} className="carousel-card" onClick={() => router.push('/shop')}>
              {item.images?.[0]
                ? <img src={item.images[0]} alt={item.name} />
                : <div style={{ width: '100%', height: 280, background: '#f0f0f0', marginBottom: 20 }} />}
              <h4>{item.name}</h4>
              {item.price && <p className="item-price">KES {item.price.toLocaleString()}</p>}
              <button className="add-button">Add to Cart</button>
            </div>
          ))}
        </SectionRow>
      )}

      {/* Travel */}
      {travelItems.length > 0 && (
        <SectionRow title="Travel" subtitle="Exclusive experiences" href="/travel">
          {travelItems.map(item => {
            const id    = item._id ?? item.id ?? '';
            const title = item.destination ?? item.title ?? '';
            const img   = item.images?.[0] ?? '';
            return (
              <div key={id} className="carousel-card" onClick={() => router.push('/travel')}>
                {img
                  ? <img src={img} alt={title} />
                  : <div style={{ width: '100%', height: 280, background: '#f5f0eb', marginBottom: 20 }} />}
                <h4>{title}</h4>
                {item.priceFrom && <p className="item-price">From KES {item.priceFrom.toLocaleString()}</p>}
                <button className="book-button">Book Now</button>
              </div>
            );
          })}
        </SectionRow>
      )}
    </>
  );
}

