'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────── */

const COLLECTION_FILTERS = [
  { id: 'all',               label: 'All Products' },
  { id: 'old-money-closet',  label: "Levi's Old Money Closet" },
  { id: 'aviation-gear',     label: 'Aviation Gear' },
  { id: 'scale-collectibles',label: 'Scale Collectibles' },
  { id: 'host-merch',        label: 'Host Merch' },
  { id: 'book-club',         label: 'Book Club' },
  { id: 'hl-merch',          label: 'HL Merch' },
  { id: 'partner-brands',    label: 'Partner Brands' },
  { id: 'car-collectibles',  label: 'Car Collectibles' },
];

const SORT_OPTIONS = [
  'Featured',
  'Best Selling',
  'Price: Low to High',
  'Price: High to Low',
  'Newest',
  'Alphabetical A–Z',
];

const ALL_PRODUCTS = [
  { id: '1',  name: "Levi's Old Money Navy Blazer",           price: 241, sale: 181, onSale: true,  collection: 'old-money-closet' },
  { id: '2',  name: "Levi's Elegant Jacket",                  price: 146, sale: 103, onSale: true,  collection: 'old-money-closet' },
  { id: '3',  name: "Levi Merino Zip Sweater",                price: 85,  sale: 72,  onSale: true,  collection: 'old-money-closet' },
  { id: '4',  name: "Levi's Elegant Trousers",                price: 61,  sale: 42,  onSale: true,  collection: 'old-money-closet' },
  { id: '5',  name: "Levi's Half-Zip Merino",                 price: 65,  sale: 43,  onSale: true,  collection: 'old-money-closet' },
  { id: '6',  name: "Levi's Linen Shirt",                     price: 73,  sale: null, onSale: false, collection: 'old-money-closet' },
  { id: '7',  name: "Levi's Driving Moccasins",               price: 97,  sale: 79,  onSale: true,  collection: 'old-money-closet' },
  { id: '8',  name: "Levi's Suede Loafers",                   price: 223, sale: 109, onSale: true,  collection: 'old-money-closet' },
  { id: '9',  name: "HL Aviation Leather Jacket",             price: 320, sale: 249, onSale: true,  collection: 'aviation-gear' },
  { id: '10', name: "Levi's Pilot Chronograph Watch",         price: 185, sale: 139, onSale: true,  collection: 'aviation-gear' },
  { id: '11', name: "Aviation Nomex Flight Suit",             price: 340, sale: 265, onSale: true,  collection: 'aviation-gear' },
  { id: '12', name: "Pilot Kneeboard Pro",                    price: 55,  sale: null, onSale: false, collection: 'aviation-gear' },
  { id: '13', name: "Boeing 747 Scale Model — 1:200",         price: 61,  sale: 42,  onSale: true,  collection: 'scale-collectibles' },
  { id: '14', name: "Concorde 1:144 Scale Model",             price: 223, sale: 109, onSale: true,  collection: 'scale-collectibles' },
  { id: '15', name: "Spitfire WWII — 1:48 Replica",           price: 85,  sale: null, onSale: false, collection: 'scale-collectibles' },
  { id: '16', name: "F-22 Raptor Desktop Model",              price: 120, sale: 89,  onSale: true,  collection: 'scale-collectibles' },
  { id: '17', name: "Mercedes 300SL Die-Cast 1:18",           price: 240, sale: 119, onSale: true,  collection: 'car-collectibles' },
  { id: '18', name: "Ferrari 250 GTO — 1:18 Scale",           price: 195, sale: 149, onSale: true,  collection: 'car-collectibles' },
  { id: '19', name: "Porsche 911 Targa 1:43",                 price: 89,  sale: 66,  onSale: true,  collection: 'car-collectibles' },
  { id: '20', name: "Bugatti Chiron Limited Edition",         price: 265, sale: null, onSale: false, collection: 'car-collectibles' },
  { id: '21', name: "HL Studio Hoodie — Classic",             price: 109, sale: 72,  onSale: true,  collection: 'host-merch' },
  { id: '22', name: "HouseLevi+ Signature Cap",               price: 65,  sale: 43,  onSale: true,  collection: 'host-merch' },
  { id: '23', name: "HL TV Premium Tee — White",              price: 55,  sale: null, onSale: false, collection: 'host-merch' },
  { id: '24', name: "HL Classic Polo — Navy",                 price: 85,  sale: 60,  onSale: true,  collection: 'host-merch' },
  { id: '25', name: "Levi Reads — Curated Book Bundle Vol.1", price: 97,  sale: 79,  onSale: true,  collection: 'book-club' },
  { id: '26', name: "Old Money Mindset — Hardcover",          price: 35,  sale: null, onSale: false, collection: 'book-club' },
  { id: '27', name: "Aviation History: Century of Flight",    price: 42,  sale: 30,  onSale: true,  collection: 'book-club' },
  { id: '28', name: "The Host Collection Gift Set",           price: 145, sale: 109, onSale: true,  collection: 'hl-merch' },
  { id: '29', name: "HL Ceramic Mug — Vintage Logo",         price: 28,  sale: null, onSale: false, collection: 'hl-merch' },
  { id: '30', name: "HL Leather Notebook A5",                 price: 45,  sale: 33,  onSale: true,  collection: 'hl-merch' },
  { id: '31', name: "Levi's Old Money — Casentino Sweater",  price: 103, sale: 66,  onSale: true,  collection: 'old-money-closet' },
  { id: '32', name: "HL x Partner Brand Collab Tee",         price: 75,  sale: 55,  onSale: true,  collection: 'partner-brands' },
];

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */

function SaleBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        background: '#DC2626',
        border: '1px solid rgba(255,255,255,0.10)',
        padding: '5px 13px 6px',
        color: '#fff',
        fontFamily: 'Lato, sans-serif',
        fontSize: 12,
        letterSpacing: 1,
        lineHeight: 1,
      }}
    >
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

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */

export default function AllProductsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sort, setSort] = useState('Featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered =
    activeFilter === 'all'
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.collection === activeFilter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const changeFilter = (id: string) => {
    setActiveFilter(id);
    setPage(1);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Julius+Sans+One&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .hlap-root a { text-decoration: none; }

        /* Filter pill */
        .filter-pill {
          display: inline-flex; align-items: center; justify-content: center;
          height: 36px;
          padding: 0 16px;
          font-family: 'Lato', sans-serif; font-size: 13px; letter-spacing: 0.8px;
          cursor: pointer; border: none; background: transparent;
          color: rgba(18,18,18,0.65);
          box-shadow: inset 0 0 0 1px rgba(18,18,18,0.2);
          white-space: nowrap;
          transition: all 0.15s;
        }
        .filter-pill:hover { box-shadow: inset 0 0 0 1px #121212; color: #121212; }
        .filter-pill.active {
          background: #121212; color: #fff;
          box-shadow: inset 0 0 0 1px #121212;
        }

        /* Product card hover */
        .product-card-link:hover .product-img { transform: scale(1.03); }
        .product-img { transition: transform 0.3s ease; }

        /* Product grid */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 1100px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .product-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 400px)  { .product-grid { grid-template-columns: 1fr; } }

        /* Sort dropdown */
        .sort-dropdown {
          position: absolute; top: calc(100% + 4px); right: 0;
          background: #fff; border: 1px solid rgba(18,18,18,0.15);
          z-index: 100; min-width: 180px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .sort-option {
          display: block; width: 100%;
          padding: 10px 16px;
          font-family: 'Lato', sans-serif; font-size: 13px; letter-spacing: 0.6px;
          color: #121212; background: none; border: none; text-align: left; cursor: pointer;
        }
        .sort-option:hover { background: #f3f3f3; }
        .sort-option.selected { font-weight: 700; }

        .sec-px { padding-left: 120px; padding-right: 120px; }
        @media (max-width: 1200px) { .sec-px { padding-left: 60px; padding-right: 60px; } }
        @media (max-width: 768px)  { .sec-px { padding-left: 16px; padding-right: 16px; } }

        /* Pagination btn */
        .pg-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          font-family: 'Lato'; font-size: 13px; letter-spacing: 0.7px;
          color: rgba(18,18,18,0.65);
          transition: all 0.15s;
        }
        .pg-btn:hover { color: #121212; }
        .pg-btn.active { color: #121212; font-weight: 700; box-shadow: inset 0 0 0 1px #121212; }
        .pg-btn:disabled { opacity: 0.25; cursor: default; }

        .filter-scroll::-webkit-scrollbar { height: 0; }
        .filter-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="hlap-root" style={{ width: '100%', background: '#fff', fontFamily: 'Lato, sans-serif', minHeight: '100vh' }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PAGE HEADER  (no hero — just title + breadcrumb)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div
          className="sec-px"
          style={{
            paddingTop: 40,
            paddingBottom: 32,
            borderBottom: '1px solid rgba(18,18,18,0.1)',
          }}
        >
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Link href="/shop" style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.55)', letterSpacing: '0.6px', lineHeight: 1.5 }}>
              Shop
            </Link>
            <span style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.4)' }}>/</span>
            <span style={{ fontFamily: 'Lato', fontSize: 12, color: '#121212', letterSpacing: '0.6px', lineHeight: 1.5 }}>
              All Products
            </span>
          </nav>

          {/* Title */}
          <h1
            style={{
              fontFamily: '"Frank Ruhl Libre", serif',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 500,
              color: '#121212',
              letterSpacing: '0.6px',
              lineHeight: 1.3,
            }}
          >
            All Products
          </h1>
          <p style={{ fontFamily: 'Lato', fontSize: 14, color: 'rgba(18,18,18,0.6)', letterSpacing: '0.6px', lineHeight: 1.6, marginTop: 8 }}>
            {filtered.length} products · Levi's Old Money Closet, Host Merch, Collectibles & more
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FILTER BAR + SORT
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div
          className="sec-px"
          style={{
            paddingTop: 20,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(18,18,18,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Filter pills — horizontally scrollable on mobile */}
          <div
            className="filter-scroll"
            style={{ display: 'flex', gap: 8, overflowX: 'auto', flex: 1 }}
          >
            {COLLECTION_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => changeFilter(f.id)}
                className={`filter-pill${activeFilter === f.id ? ' active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setSortOpen((o) => !o)}
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
                {SORT_OPTIONS.map((o) => (
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

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PRODUCT GRID
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="sec-px" style={{ paddingTop: 32, paddingBottom: 48 }}>

          {paginated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 22, color: '#121212', letterSpacing: '0.6px' }}>No products found</p>
              <p style={{ fontFamily: 'Lato', fontSize: 14, color: 'rgba(18,18,18,0.6)', marginTop: 8, letterSpacing: '0.6px' }}>Try a different filter</p>
            </div>
          ) : (
            <div className="product-grid">
              {paginated.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="product-card-link"
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                >
                  {/* Image area — square, grey bg */}
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#F3F3F3', overflow: 'hidden' }}>
                    <img
                      className="product-img"
                      src={`https://placehold.co/400x400/F3F3F3/999999?text=HL`}
                      alt={p.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {p.onSale && <SaleBadge />}
                  </div>

                  {/* Info */}
                  <div style={{ paddingTop: 16, paddingBottom: 16 }}>
                    <p
                      style={{
                        fontFamily: '"Frank Ruhl Libre", serif',
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#121212',
                        letterSpacing: '0.6px',
                        lineHeight: 1.3,
                        marginBottom: 6,
                      }}
                    >
                      {p.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                      {p.sale !== null ? (
                        <>
                          <span style={{ fontFamily: 'Lato', fontSize: 13, color: 'rgba(18,18,18,0.75)', letterSpacing: 1, lineHeight: 1.4, textDecoration: 'line-through' }}>
                            ${p.price}.00 USD
                          </span>
                          <span style={{ fontFamily: 'Lato', fontSize: 16, color: '#121212', letterSpacing: 1, lineHeight: 1.4 }}>
                            ${p.sale}.00 USD
                          </span>
                        </>
                      ) : (
                        <span style={{ fontFamily: 'Lato', fontSize: 16, color: '#121212', letterSpacing: 1, lineHeight: 1.4 }}>
                          ${p.price}.00 USD
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 48 }}>
              {/* Prev arrow */}
              <button
                className="pg-btn"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <svg width="6" height="14.5" viewBox="0 0 6 15" fill="none">
                  <path d="M5 14L1 7.5L5 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`pg-btn${page === n ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                >
                  {n}
                </button>
              ))}

              {/* Next arrow */}
              <button
                className="pg-btn"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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