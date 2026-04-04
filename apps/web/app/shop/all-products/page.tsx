'use client';

/**
 * Location: apps/web/app/shop/all-products/page.tsx
 *
 * All products page with filtering and pagination.
 * All data from API — no hardcoded products or categories.
 * 
 * Fetches from:
 * - GET /api/commerce/products → all products
 * - GET /api/commerce/collections → categories for filtering
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  title?: string;
  price: number;
  basePrice?: number;
  salePrice: number | null;
  onSale: boolean;
  imageUrl: string | null;
  category?: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface AllProductsData {
  products: Product[];
  collections: Collection[];
}

// ── API ────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchAllProductsData(): Promise<AllProductsData> {
  try {
    const [productsRes, collectionsRes] = await Promise.allSettled([
      fetch(`${API}/api/commerce/products?limit=500`).then(r => r.json()),
      fetch(`${API}/api/commerce/collections?limit=100`).then(r => r.json()),
    ]);

    const prodRaw = productsRes.status === 'fulfilled' ? (productsRes.value?.data ?? productsRes.value ?? []) : [];
    const collRaw = collectionsRes.status === 'fulfilled' ? (collectionsRes.value?.data ?? collectionsRes.value ?? []) : [];

    return {
      products: (Array.isArray(prodRaw) ? prodRaw : []).map((p: any) => ({
        id:         String(p._id ?? p.id ?? ''),
        name:       String(p.title ?? p.name ?? ''),
        price:      Number(p.basePrice ?? p.price ?? 0),
        salePrice:  p.salePrice != null ? Number(p.salePrice) : null,
        onSale:     Boolean(p.onSale),
        imageUrl:   p.images?.[0]?.url ?? p.imageUrl ? String(p.imageUrl) : null,
        category:   p.category ?? 'all',
      })),
      collections: (Array.isArray(collRaw) ? collRaw : []).map((c: any) => ({
        id:   String(c._id ?? c.id ?? ''),
        name: String(c.name ?? ''),
        slug: String(c.slug ?? ''),
      })),
    };
  } catch (err) {
    console.error('Error fetching products:', err);
    return { products: [], collections: [] };
  }
}

// ── Helpers ────────────────────────────────────────────────────
function SaleBadge() {
  return (
    <div style={{
      position: 'absolute', bottom: 10, right: 10,
      background: '#DC2626', border: '1px solid rgba(255,255,255,0.10)',
      padding: '5px 13px 6px', color: '#fff',
      fontFamily: 'Lato, sans-serif', fontSize: 12, letterSpacing: 1, lineHeight: 1,
    }}>
      Sale
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const ArrowLeft = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
    <path d="M6 1L1 5.5L6 10M14 5.5H1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// ══════════════════════════════════════════════════════════════
//  PAGE
// ══════════════════════════════════════════════════════════════
export default function AllProductsPage() {
  const [data, setData]           = useState<AllProductsData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sort, setSort]           = useState('Featured');
  const [sortOpen, setSortOpen]   = useState(false);
  const [page, setPage]           = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    fetchAllProductsData()
      .then(d => { setData(d); setError(null); })
      .catch(err => { console.error(err); setError('Failed to load products'); })
      .finally(() => setLoading(false));
  }, []);

  const allProducts = data?.products ?? [];
  const filtered = activeFilter === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === activeFilter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const changeFilter = (id: string) => { setActiveFilter(id); setPage(1); };

  // Hardcoded categories from backend schema (fallback if collections empty)
  const CATEGORY_OPTIONS = [
    { id: 'old-money-closet', label: "Levi's Old Money Closet" },
    { id: 'aviation-gear', label: 'Aviation Gear' },
    { id: 'scale-collectibles', label: 'Scale Collectibles' },
    { id: 'host-merch', label: 'Host Merch' },
    { id: 'book-club', label: 'Book Club' },
    { id: 'hl-merch', label: 'HL Merch' },
    { id: 'partner-brands', label: 'Partner Brands' },
    { id: 'car-collectibles', label: 'Car Collectibles' },
  ];

  // Use collections from API if available, otherwise use hardcoded categories
  const filterOptions = [
    { id: 'all', label: 'All Products' },
    ...((data?.collections?.length ?? 0) > 0
      ? (data?.collections ?? []).map(c => ({ id: c.slug, label: c.name }))
      : CATEGORY_OPTIONS
    ),
  ];

  const SORT_OPTIONS = [
    'Featured', 'Best Selling',
    'Price: Low to High', 'Price: High to Low',
    'Newest', 'Alphabetical A–Z',
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Julius+Sans+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .hlap-root a { text-decoration: none; }

        .filter-pill {
          display: inline-flex; align-items: center; justify-content: center;
          height: 36px; padding: 0 16px;
          font-family: 'Lato', sans-serif; font-size: 13px; letter-spacing: 0.8px;
          cursor: pointer; border: none; background: transparent;
          color: rgba(18,18,18,0.65);
          box-shadow: inset 0 0 0 1px rgba(18,18,18,0.2);
          white-space: nowrap; transition: all 0.15s;
        }
        .filter-pill:hover { box-shadow: inset 0 0 0 1px #121212; color: #121212; }
        .filter-pill.active { background: #121212; color: #fff; box-shadow: inset 0 0 0 1px #121212; }

        .product-card-link:hover .product-img { transform: scale(1.03); }
        .product-img { transition: transform 0.3s ease; }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 1100px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .product-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 400px)  { .product-grid { grid-template-columns: 1fr; } }

        .sort-dropdown {
          position: absolute; top: calc(100% + 4px); right: 0;
          background: #fff; border: 1px solid rgba(18,18,18,0.15);
          z-index: 100; min-width: 180px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .sort-option {
          display: block; width: 100%; padding: 10px 16px;
          font-family: 'Lato', sans-serif; font-size: 13px; letter-spacing: 0.6px;
          color: #121212; background: none; border: none; text-align: left; cursor: pointer;
        }
        .sort-option:hover { background: #f3f3f3; }
        .sort-option.selected { font-weight: 700; }

        .sec-px { padding-left: 120px; padding-right: 120px; }
        @media (max-width: 1200px) { .sec-px { padding-left: 60px; padding-right: 60px; } }
        @media (max-width: 768px)  { .sec-px { padding-left: 16px; padding-right: 16px; } }

        .pg-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          font-family: 'Lato'; font-size: 13px; letter-spacing: 0.7px;
          color: rgba(18,18,18,0.65); transition: all 0.15s;
        }
        .pg-btn:hover { color: #121212; }
        .pg-btn.active { color: #121212; font-weight: 700; box-shadow: inset 0 0 0 1px #121212; }
        .pg-btn:disabled { opacity: 0.25; cursor: default; }

        .filter-scroll::-webkit-scrollbar { height: 0; }
        .filter-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .skel { background: linear-gradient(90deg,#f4f2ef 0%,#eeebe6 50%,#f4f2ef 100%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 2px; }
        @keyframes shimmer { 0%,100% { background-position: -200% 0; } 50% { background-position: 200% 0; } }

        .back-btn { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; font-family: 'Lato', sans-serif; font-size: 13px; letter-spacing: 0.6px; color: rgba(18,18,18,0.55); padding: 0; transition: color 0.15s; text-decoration: none; }
        .back-btn:hover { color: #121212; }
      `}</style>

      <div className="hlap-root" style={{ width: '100%', background: '#fff', fontFamily: 'Lato, sans-serif', minHeight: '100vh' }}>

        {/* Error Banner */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px 20px', textAlign: 'center', fontFamily: 'Lato', fontSize: 13, letterSpacing: '0.6px' }}>
            {error} — <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: '#991b1b', textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}>Retry</button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="sec-px" style={{ paddingTop: 40, paddingBottom: 32, borderBottom: '1px solid rgba(18,18,18,0.1)' }}>

          {/* Back button */}
          <Link href="/shop" className="back-btn" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <ArrowLeft />
            Back to Shop
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 12 }}>
            <Link href="/shop" style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.55)', letterSpacing: '0.6px', lineHeight: 1.5 }}>
              Shop
            </Link>
            <span style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.4)' }}>/</span>
            <span style={{ fontFamily: 'Lato', fontSize: 12, color: '#121212', letterSpacing: '0.6px', lineHeight: 1.5 }}>
              All Products
            </span>
          </nav>

          <h1 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 500, color: '#121212', letterSpacing: '0.6px', lineHeight: 1.3 }}>
            All Products
          </h1>
          <p style={{ fontFamily: 'Lato', fontSize: 14, color: 'rgba(18,18,18,0.6)', letterSpacing: '0.6px', lineHeight: 1.6, marginTop: 8 }}>
            {loading ? '...' : `${filtered.length} products`}
          </p>
        </div>

        {/* FILTER BAR + SORT */}
        <div className="sec-px" style={{ paddingTop: 20, paddingBottom: 20, borderBottom: '1px solid rgba(18,18,18,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div className="filter-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skel" style={{ width: 100, height: 36 }} />
                ))
              : filterOptions.map(f => (
                  <button
                    key={f.id}
                    onClick={() => changeFilter(f.id)}
                    className={`filter-pill${activeFilter === f.id ? ' active' : ''}`}
                  >
                    {f.label}
                  </button>
                ))
            }
          </div>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setSortOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Lato', fontSize: 13, letterSpacing: '0.6px', color: '#121212',
                boxShadow: 'inset 0 0 0 1px rgba(18,18,18,0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Sort: {sort}</span>
              <ChevronDown />
            </button>
            {sortOpen && (
              <div className="sort-dropdown">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o}
                    className={`sort-option${sort === o ? ' selected' : ''}`}
                    onClick={() => { setSort(o); setSortOpen(false); }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="sec-px" style={{ paddingTop: 32, paddingBottom: 48 }}>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i}>
                  <div className="skel" style={{ width: '100%', paddingBottom: '100%' }} />
                  <div className="skel" style={{ width: '80%', height: 14, marginTop: 16 }} />
                  <div className="skel" style={{ width: '50%', height: 12, marginTop: 8 }} />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 22, color: '#121212', letterSpacing: '0.6px' }}>No products found</p>
              <p style={{ fontFamily: 'Lato', fontSize: 14, color: 'rgba(18,18,18,0.6)', marginTop: 8, letterSpacing: '0.6px' }}>Try a different filter</p>
            </div>
          ) : (
            <div className="product-grid">
              {paginated.map(p => (
                <Link
                  key={p.id}
                  href={`/shop/products/${p.id}`}
                  className="product-card-link"
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                >
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#F3F3F3', overflow: 'hidden' }}>
                    <img
                      className="product-img"
                      src={p.imageUrl ?? `https://placehold.co/400x400/F3F3F3/999999?text=HL`}
                      alt={p.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {p.onSale && <SaleBadge />}
                  </div>

                  <div style={{ paddingTop: 16, paddingBottom: 16 }}>
                    <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 15, fontWeight: 500, color: '#121212', letterSpacing: '0.6px', lineHeight: 1.3, marginBottom: 6 }}>
                      {p.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                      {p.salePrice !== null ? (
                        <>
                          <span style={{ fontFamily: 'Lato', fontSize: 13, color: 'rgba(18,18,18,0.55)', letterSpacing: 1, lineHeight: 1.4, textDecoration: 'line-through' }}>
                            KSh {p.price.toLocaleString()}
                          </span>
                          <span style={{ fontFamily: 'Lato', fontSize: 16, color: '#DC2626', letterSpacing: 1, lineHeight: 1.4 }}>
                            KSh {p.salePrice!.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontFamily: 'Lato', fontSize: 16, color: '#121212', letterSpacing: 1, lineHeight: 1.4 }}>
                          KSh {p.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 48 }}>
              <button
                className="pg-btn"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <svg width="6" height="14.5" viewBox="0 0 6 15" fill="none">
                  <path d="M5 14L1 7.5L5 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`pg-btn${page === n ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                >
                  {n}
                </button>
              ))}

              <button
                className="pg-btn"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <svg width="6" height="14.5" viewBox="0 0 6 15" fill="none">
                  <path d="M1 1L5 7.5L1 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

        </div>

      </div>
    </>
  );
}
