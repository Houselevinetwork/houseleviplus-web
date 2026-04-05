'use client';

/**
 * Location: apps/web/app/shop/page.tsx
 *
 * All data from API. Sections:
 * - Announcement bar
 * - Hero banner
 * - Best Sellers   (isFeatured:true products)
 * - Editorial banner (OLD MONEY Ã¯Â¿Â½ HOUSELEVI+ OFFICIAL)
 * - Partner Brands  (partner-brands category, hidden if empty)
 * - Collections grid
 * - Reviews
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// -- Types ------------------------------------------------------
interface Product {
  id: string; name: string; price: number; salePrice: number | null;
  onSale: boolean; imageUrl: string | null; category: string | null; isFeatured: boolean;
}
interface Collection { id: string; name: string; slug: string; imageUrl: string | null; }
interface Review     { id: string; title: string; body: string; author: string; rating: number; }
interface ReviewResponse {
  data?: any[];
  total?: number;
  avgRating?: number;
  [key: string]: any;
}
interface Banner {
  url: string;
  headline?: string;
  type?: 'image' | 'video';
}
interface ShopData {
  announcements: string[];
  hero:          Banner;
  editorial:     Banner | null;
  bestSellers:   Product[];
  oldMoney:      Product[];
  partnerBrands: Product[];
  collections:   Collection[];
  reviews:       Review[];
  reviewCount:   number;
  reviewAvg:     number;
}

function normProduct(p: any): Product {
  return {
    id:         String(p._id ?? p.id ?? ''),
    name:       String(p.name ?? p.title ?? ''),
    price:      Number(p.price ?? p.basePrice ?? 0),
    salePrice:  p.salePrice != null ? Number(p.salePrice) : null,
    onSale:     Boolean(p.onSale),
    imageUrl:   p.imageUrl ?? p.images?.[0]?.url ?? null,
    category:   p.category ?? null,
    isFeatured: Boolean(p.isFeatured),
  };
}

function normBanner(data: any): Banner {
  if (typeof data === 'string') {
    return { url: data, type: 'image', headline: '' };
  }
  return {
    url:      String(data?.url ?? data?.imageUrl ?? data?.src ?? ''),
    headline: String(data?.headline ?? data?.title ?? ''),
    type:     (data?.type ?? 'image') as 'image' | 'video',
  };
}

async function fetchShopData(): Promise<ShopData> {
  const [heroR, annR, featR, allR, collR, revR, editR] = await Promise.allSettled([
    fetch(`${API}/api/shop/hero`).then(r => r.json()),
    fetch(`${API}/api/shop/announcements`).then(r => r.json()),
    fetch(`${API}/api/commerce/products?sort=featured&limit=20`).then(r => r.json()),
    fetch(`${API}/api/commerce/products?limit=200`).then(r => r.json()),
    fetch(`${API}/api/commerce/collections`).then(r => r.json()),
    fetch(`${API}/api/shop/reviews?limit=3`).then(r => r.json()),
    fetch(`${API}/api/shop/editorial`).then(r => r.json()).catch(() => null),
  ]);

  const heroRaw      = heroR.status === 'fulfilled' ? heroR.value : null;
  const editorialRaw = editR.status === 'fulfilled' ? editR.value : null;

  const hero: Banner = heroRaw
    ? normBanner(heroRaw)
    : {
        url:      'https://placehold.co/1440x720/0a0a0a/333333?text=HOUSELEVI%2B',
        headline: 'HOUSELEVI+',
        type:     'image' as const,
      };

  const editorial: Banner | null = editorialRaw
    ? normBanner(editorialRaw)
    : {
        url:      'https://placehold.co/1440x420/111111/333333?text=OLD+MONEY+%7C+HOUSELEVI%2B+OFFICIAL',
        headline: 'OLD MONEY\nHOUSELEVI+ OFFICIAL',
        type:     'image' as const,
      };

  const annRaw  = annR.status  === 'fulfilled' ? annR.value               : [];
  const featRaw = featR.status === 'fulfilled' ? (featR.value?.data ?? []) : [];
  const allRaw  = allR.status  === 'fulfilled' ? (allR.value?.data  ?? []) : [];
  const collRaw = collR.status === 'fulfilled' ? (collR.value?.data ?? []) : [];
  const revRaw  = revR.status  === 'fulfilled' ? revR.value               : {};

  const allProducts:  Product[] = Array.isArray(allRaw)  ? allRaw.map(normProduct)  : [];
  const featProducts: Product[] = Array.isArray(featRaw) ? featRaw.map(normProduct) : [];

  const extractReviews = (data: ReviewResponse): { reviews: any[]; total: number; avgRating: number } => {
    if (Array.isArray(data)) {
      return { reviews: data, total: data.length, avgRating: 4.5 };
    }
    const reviewArray = Array.isArray(data?.data) ? data.data : Array.isArray(data?.reviews) ? data.reviews : [];
    return {
      reviews:   reviewArray,
      total:     data?.total ?? data?.reviewCount ?? reviewArray.length ?? 0,
      avgRating: data?.avgRating ?? data?.average ?? 4.5,
    };
  };

  const { reviews: reviewsArray, total: reviewCount, avgRating: reviewAvg } = extractReviews(revRaw);

  return {
    hero,
    editorial,
    announcements: Array.isArray(annRaw)
      ? annRaw.filter((a: any) => a.active !== false).map((a: any) => typeof a === 'string' ? a : (a.text ?? ''))
      : [],
    bestSellers:   featProducts.length > 0 ? featProducts : allProducts.slice(0, 12),
    oldMoney:      allProducts.filter(p => p.category === 'old-money-closet').slice(0, 20),
    partnerBrands: allProducts.filter(p => p.category === 'partner-brands').slice(0, 20),
    collections: Array.isArray(collRaw) ? collRaw.map((c: any) => ({
      id: String(c._id ?? c.id ?? ''), name: String(c.name ?? ''),
      slug: String(c.slug ?? ''), imageUrl: c.imageUrl ?? null,
    })) : [],
    reviews: reviewsArray.slice(0, 3).map((r: any) => ({
      id: String(r._id ?? r.id ?? ''), title: String(r.title ?? ''),
      body: String(r.body ?? r.text ?? ''), author: String(r.author ?? ''), rating: Number(r.rating ?? 5),
    })),
    reviewCount,
    reviewAvg,
  };
}

// -- SVG Icons --------------------------------------------------
const ChevL  = () => <svg width="6" height="15" viewBox="0 0 6 15" fill="none"><path d="M5 14L1 7.5L5 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const ChevR  = () => <svg width="6" height="15" viewBox="0 0 6 15" fill="none"><path d="M1 1L5 7.5L1 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const ArrowR = ({ color = '#121212' }: { color?: string }) => <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M9 1L14 5.5L9 10M1 5.5H14" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>;

function Stars({ n = 5, size = 14 }: { n?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 14 13"
          fill={i <= Math.floor(n) ? '#00B77F' : i - 0.5 <= n ? 'url(#hl-half-s)' : '#e4e4e4'}>
          <defs><linearGradient id="hl-half-s" x1="0" x2="1"><stop offset="50%" stopColor="#00B77F"/><stop offset="50%" stopColor="#e4e4e4"/></linearGradient></defs>
          <path d="M7 0.5L8.56 5.18H13.48L9.46 7.99L11.02 12.67L7 9.86L2.98 12.67L4.54 7.99L0.52 5.18H5.44L7 0.5Z"/>
        </svg>
      ))}
    </div>
  );
}

function Skel({ w = '100%', h = 16, r = 2, style = {} }: { w?: string|number; h?: number; r?: number; style?: React.CSSProperties }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f4f2ef 0%,#eeebe6 50%,#f4f2ef 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', ...style }} />;
}

const ph     = (w: number, h: number) => `https://placehold.co/${w}x${h}/F3F3F3/999999?text=HL`;
const imgSrc = (url: string | null, w: number, h: number) => url ?? ph(w, h);

// -- Product Card -----------------------------------------------
const CARD_W   = 269;
const CARD_GAP = 23;

function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/shop/products/${p.id}`} style={{ flexShrink: 0, width: CARD_W, textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ position: 'relative', width: CARD_W, height: CARD_W, background: '#F3F3F3' }}>
        <img src={imgSrc(p.imageUrl, CARD_W, CARD_W)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {p.onSale && <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#DC2626', padding: '5px 13px', color: '#fff', fontFamily: 'Lato', fontSize: 12, letterSpacing: 1 }}>Sale</div>}
      </div>
      <div style={{ paddingTop: 18, paddingBottom: 18 }}>
        <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 15, fontWeight: 500, color: '#121212', letterSpacing: '0.6px', lineHeight: 1.3, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: CARD_W }}>
          {p.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          {p.salePrice !== null
            ? <><span style={{ fontFamily: 'Lato', fontSize: 13, color: 'rgba(18,18,18,0.55)', letterSpacing: 1, textDecoration: 'line-through' }}>KSh {p.price.toLocaleString()}</span><span style={{ fontFamily: 'Lato', fontSize: 16, color: '#DC2626', letterSpacing: 1 }}>KSh {p.salePrice!.toLocaleString()}</span></>
            : <span style={{ fontFamily: 'Lato', fontSize: 16, color: '#121212', letterSpacing: 1 }}>KSh {p.price.toLocaleString()}</span>
          }
        </div>
      </div>
    </Link>
  );
}

// -- Product strip with pagination ------------------------------
function ProductStrip({ products, loading, empty = 'No products yet Ã¯Â¿Â½ check back soon.' }: { products: Product[]; loading: boolean; empty?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const perPage    = 5;
  const totalPages = Math.max(1, Math.ceil(products.length / perPage));

  const scroll = (dir: 'prev'|'next') => {
    const next = dir === 'next' ? Math.min(page + 1, totalPages) : Math.max(page - 1, 1);
    setPage(next);
    ref.current?.scrollTo({ left: (next - 1) * perPage * (CARD_W + CARD_GAP), behavior: 'smooth' });
  };

  return (
    <div>
      <div ref={ref} className="no-scroll" style={{ display: 'flex', gap: CARD_GAP, overflowX: 'auto', paddingLeft: 15, paddingRight: 15, alignItems: 'flex-start' }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ flexShrink: 0, width: CARD_W }}>
                <Skel w={CARD_W} h={CARD_W} r={1} />
                <Skel w={180} h={13} style={{ marginTop: 16 }} />
                <Skel w={80}  h={11} style={{ marginTop: 8 }} />
              </div>
            ))
          : products.length === 0
            ? <div style={{ padding: '40px 20px', fontFamily: 'Lato', fontSize: 13, color: '#bbb', fontStyle: 'italic' }}>{empty}</div>
            : products.map(p => <ProductCard key={p.id} p={p} />)
        }
      </div>

      {!loading && products.length > perPage && (
        <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
          <button onClick={() => scroll('prev')} disabled={page === 1} style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121212' }}><ChevL /></button>
          <span style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.5)', minWidth: 44, textAlign: 'center' }}>{page} / {totalPages}</span>
          <button onClick={() => scroll('next')} disabled={page === totalPages} style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121212' }}><ChevR /></button>
        </div>
      )}
    </div>
  );
}

// -- Section heading --------------------------------------------
function SectionHead({ title, href, hrefLabel = 'View All', dark = false }: { title: string; href?: string; hrefLabel?: string; dark?: boolean }) {
  const c  = dark ? '#fff'                  : '#121212';
  const cs = dark ? 'rgba(255,255,255,0.5)' : 'rgba(18,18,18,0.5)';
  return (
    <div className="sec-px" style={{ paddingTop: 48, paddingBottom: 24, maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 24, fontWeight: 500, color: c, letterSpacing: '0.6px' }}>{title}</h2>
      {href && <Link href={href} style={{ fontFamily: 'Lato', fontSize: 12, color: cs, letterSpacing: '0.8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>{hrefLabel} <ArrowR color={cs} /></Link>}
    </div>
  );
}

// --------------------------------------------------------------
//  PAGE
// --------------------------------------------------------------
export default function ShopPage() {
  const [data, setData]       = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [annIdx, setAnnIdx]   = useState(0);

  useEffect(() => {
    fetchShopData().then(setData).finally(() => setLoading(false));
  }, []);

  const ann = data?.announcements ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Julius+Sans+One&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .hl-shop a{text-decoration:none;}
        .no-scroll::-webkit-scrollbar{display:none;}.no-scroll{-ms-overflow-style:none;scrollbar-width:none;}
        @keyframes shimmer{0%,100%{background-position:-200% 0;}50%{background-position:200% 0;}}
        .hl-btn-white{display:inline-flex;align-items:center;justify-content:center;min-width:130px;height:47px;padding:0 30px;color:#fff;font-family:'Lato',sans-serif;font-size:14px;letter-spacing:1.5px;cursor:pointer;border:none;background:transparent;box-shadow:inset 0 0 0 1px #fff;transition:background .2s;text-decoration:none;}
        .hl-btn-white:hover{background:rgba(255,255,255,.12);}
        .hl-btn-dark{display:inline-flex;align-items:center;justify-content:center;min-width:130px;height:47px;padding:0 30px;color:#fff;font-family:'Lato',sans-serif;font-size:14px;letter-spacing:1.5px;cursor:pointer;border:none;background:#121212;transition:background .2s;text-decoration:none;}
        .hl-btn-dark:hover{background:#2c2c2c;}
        .sec-px{padding-left:120px;padding-right:120px;}
        @media(max-width:1200px){.sec-px{padding-left:60px;padding-right:60px;}}
        @media(max-width:768px){.sec-px{padding-left:20px;padding-right:20px;}}
        .coll-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        @media(max-width:1100px){.coll-grid{grid-template-columns:repeat(2,1fr);}}
        .coll-link:hover .coll-img{transform:scale(1.04);}
        .coll-img{transition:transform .35s ease;}
      `}</style>

      <div className="hl-shop" style={{ width: '100%', background: '#fff', fontFamily: 'Lato, sans-serif' }}>

        {/* -- Announcement Bar --------------------------- */}
        <div style={{ background: '#121212', borderBottom: '1px solid rgba(255,255,255,0.08)', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {ann.length > 1 && (
            <button onClick={() => setAnnIdx(i => (i - 1 + ann.length) % ann.length)} style={{ position: 'absolute', left: 32, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6 }}><ChevL /></button>
          )}
          {loading
            ? <Skel w={240} h={12} style={{ background: 'rgba(255,255,255,0.08)' }} />
            : <span style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 12, color: '#fff', letterSpacing: '0.08em' }}>
                {ann[annIdx] ?? 'Free Shipping on orders over KSh 15,000'}
              </span>
          }
          {ann.length > 1 && (
            <button onClick={() => setAnnIdx(i => (i + 1) % ann.length)} style={{ position: 'absolute', right: 32, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6 }}><ChevR /></button>
          )}
        </div>

        {/* -- Hero --------------------------------------- */}
<div style={{ position: 'relative', width: '100%', height: '100vh', minHeight: 600, background: '#0a0a0a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading
            ? <Skel w="100%" h={600} r={0} />
            : data?.hero.url
              ? data.hero.type === 'video'
                ? <video src={data.hero.url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} autoPlay muted loop playsInline />
                : <img src={data.hero.url} alt="hero" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
              : null
          }
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', zIndex: 2 }} />
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 50, textAlign: 'center' }}>
            <div style={{ maxWidth: 890, width: '100%' }}>
              <h1 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontWeight: 400, color: '#fff', letterSpacing: '0.04em', lineHeight: 1.2, fontSize: 'clamp(36px,4.5vw,60px)', marginBottom: 28 }}>
                {data?.hero.headline ?? 'HOUSELEVI+'}
              </h1>
              <Link href="/shop/all-products" className="hl-btn-white">Shop Now</Link>
            </div>
          </div>
        </div>

        {/* -- Best Sellers ------------------------------- */}
        <div style={{ background: '#fff', width: '100%', paddingBottom: 8 }}>
          <SectionHead title="Best Sellers" href="/shop/all-products?sort=featured" hrefLabel="View All" />
          <ProductStrip products={data?.bestSellers ?? []} loading={loading} />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 48px' }}>
            <Link href="/shop/all-products" className="hl-btn-dark">View All Products</Link>
          </div>
        </div>

        {/* -- Editorial Banner Ã¯Â¿Â½ OLD MONEY Ã¯Â¿Â½ HOUSELEVI+ OFFICIAL -- */}
        <div style={{ position: 'relative', width: '100%', minHeight: 420, overflow: 'hidden', background: '#111' }}>
          {loading
            ? <Skel w="100%" h={420} r={0} />
            : data?.editorial?.url
              ? data.editorial.type === 'video'
                ? <video src={data.editorial.url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
                : <img src={data.editorial.url} alt="Old Money editorial" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : null
          }
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontWeight: 300, fontSize: 'clamp(26px,3.5vw,46px)', color: '#fff', letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line' }}>
              {data?.editorial?.headline ?? 'OLD MONEY\nHOUSELEVI+ OFFICIAL'}
            </h2>
            <div style={{ width: 36, height: 1, background: 'rgba(255,255,255,0.35)', margin: '20px auto' }} />
            <Link href="/shop/all-products" className="hl-btn-white" style={{ marginTop: 4 }}>Shop All Products</Link>
          </div>
        </div>

        {/* -- Levi's Closet+ Ã¯Â¿Â½ Old Money category ---------------- */}
        <div style={{ background: '#fff', width: '100%', paddingBottom: 8 }}>
          <SectionHead title="Levi's Closet+" href="/shop/all-products" hrefLabel="Shop Collection" />
          <ProductStrip products={data?.oldMoney ?? []} loading={loading} empty="Old Money products coming soon." />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 48px' }}>
            <Link href="/shop/all-products" className="hl-btn-dark">Shop Levi's Closet+</Link>
          </div>
        </div>

        {/* -- Partner Brands Ã¯Â¿Â½ only shows if products exist ------- */}
        {(loading || (data?.partnerBrands?.length ?? 0) > 0) && (
          <div style={{ background: '#f8f6f2', width: '100%', paddingBottom: 48 }}>
            <SectionHead title="Partner Brands" href="/shop/collections/partner-brands" />
            <ProductStrip products={data?.partnerBrands ?? []} loading={loading} />
          </div>
        )}

        {/* -- Collections Grid ---------------------------- */}
        {(loading || (data?.collections?.length ?? 0) > 0) && (
          <div style={{ background: '#fff', padding: '0 70px 60px' }}>
            <div style={{ maxWidth: 1300, margin: '0 auto', paddingTop: 24 }}>
              <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 24, fontWeight: 500, color: '#121212', letterSpacing: '0.6px', marginBottom: 30 }}>Shop By Collection</h2>
              <div className="coll-grid">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <div key={i}><Skel w="100%" h={300} r={1} /><Skel w={160} h={13} style={{ marginTop: 14 }} /></div>)
                  : data?.collections.map(col => (
                    <Link key={col.id} href={`/shop/collections/${col.slug}`} className="coll-link" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#F3F3F3', overflow: 'hidden' }}>
                        <img className="coll-img" src={imgSrc(col.imageUrl, 400, 400)} alt={col.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 15, fontWeight: 500, color: '#121212', letterSpacing: '0.6px', lineHeight: 1.3 }}>{col.name}</p>
                        <ArrowR />
                      </div>
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* -- Reviews ------------------------------------- */}
        <div style={{ background: '#faf8f5', padding: '60px 0' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 60px' }}>
            <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 24, fontWeight: 500, color: '#121212', letterSpacing: '0.6px', marginBottom: 6 }}>Let Our Customers Speak For Us</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <Stars n={data?.reviewAvg ?? 4.5} size={16} />
              <span style={{ fontFamily: 'Lato', fontSize: 13, color: 'rgba(18,18,18,0.55)', letterSpacing: '0.06em' }}>
                {data?.reviewAvg?.toFixed(1) ?? '4.5'} Ã¯Â¿Â½ {data?.reviewCount ?? 0} reviews
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <Skel key={i} w="100%" h={160} r={2} />)
                : (data?.reviews ?? []).length === 0
                  ? <p style={{ fontFamily: 'Lato', fontSize: 13, color: '#bbb', gridColumn: 'span 3' }}>No reviews yet.</p>
                  : (data?.reviews ?? []).map(r => (
                    <div key={r.id} style={{ background: '#fff', padding: 20, border: '1px solid #eeebe6', borderRadius: 2 }}>
                      <Stars n={r.rating} size={12} />
                      <p style={{ fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: '#121212', letterSpacing: '0.4px', lineHeight: 1.4, marginTop: 10, marginBottom: 6 }}>{r.title}</p>
                      <p style={{ fontFamily: 'Lato', fontSize: 13, color: 'rgba(18,18,18,0.65)', letterSpacing: '0.3px', lineHeight: 1.65 }}>{r.body}</p>
                      <p style={{ fontFamily: 'Lato', fontSize: 12, fontWeight: 600, color: 'rgba(18,18,18,0.45)', marginTop: 12, letterSpacing: '0.06em' }}>{r.author}</p>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
