'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/* ─────────────────────────────────────────────────────
   TYPES  — mirrors product.schema.ts
───────────────────────────────────────────────────── */

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

interface Variant {
  _id: string;
  sku: string;
  title: string;
  color?: string;
  size?: string;
  edition?: string;
  price: number;
  stock: number;
  barcode?: string;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  collectionId: string;
  basePrice: number;
  currency: 'KES' | 'USD';
  discountPrice?: number;
  totalStock: number;
  lowStockThreshold: number;
  images: ProductImage[];
  variants: Variant[];
  tags: string[];
  isFeatured: boolean;
  status: string;
}

/* ─────────────────────────────────────────────────────
   MOCK PRODUCT — replace with real API fetch
───────────────────────────────────────────────────── */

const MOCK_PRODUCT: Product = {
  _id: '1',
  title: "Levi's Old Money — Navy Blazer",
  slug: 'levis-old-money-navy-blazer',
  description:
    "The signature piece from Levi's Old Money Closet. Crafted in a premium wool-blend fabric with a refined slim silhouette, this blazer embodies the understated elegance of old money style. Perfect for formal occasions, dinners, or elevating a smart-casual look. Each piece is finished with hand-stitched lapel detailing and a satin lining.",
  collectionId: 'old-money-closet',
  basePrice: 241,
  currency: 'USD',
  discountPrice: 181,
  totalStock: 24,
  lowStockThreshold: 5,
  images: [
    { url: 'https://placehold.co/700x800/F3F3F3/999999?text=Front', alt: 'Front view', isPrimary: true, order: 0 },
    { url: 'https://placehold.co/700x800/EBEBEB/888888?text=Back', alt: 'Back view', isPrimary: false, order: 1 },
    { url: 'https://placehold.co/700x800/E8E8E8/777777?text=Detail', alt: 'Detail', isPrimary: false, order: 2 },
    { url: 'https://placehold.co/700x800/F0F0F0/999999?text=Worn', alt: 'Worn view', isPrimary: false, order: 3 },
  ],
  variants: [
    { _id: 'v1', sku: 'OMB-S', title: 'S', size: 'S', price: 181, stock: 8 },
    { _id: 'v2', sku: 'OMB-M', title: 'M', size: 'M', price: 181, stock: 6 },
    { _id: 'v3', sku: 'OMB-L', title: 'L', size: 'L', price: 181, stock: 5 },
    { _id: 'v4', sku: 'OMB-XL', title: 'XL', size: 'XL', price: 181, stock: 3 },
    { _id: 'v5', sku: 'OMB-XXL', title: 'XXL', size: 'XXL', price: 181, stock: 2 },
  ],
  tags: ['old-money', 'blazer', 'formal', 'levi'],
  isFeatured: true,
  status: 'published',
};

const RELATED_PRODUCTS = [
  { id: '2', name: "Levi's Elegant Jacket", price: 146, sale: 103, onSale: true },
  { id: '5', name: "Levi Merino Zip Sweater", price: 85, sale: 72, onSale: true },
  { id: '7', name: "Levi's Driving Moccasins", price: 97, sale: 79, onSale: true },
  { id: '4', name: "Levi's Elegant Trousers", price: 61, sale: 42, onSale: true },
];

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */

function StarRating({ n = 5, size = 14 }: { n?: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = i <= Math.floor(n) ? '#00B77F' : i - 0.5 <= n ? 'url(#half)' : '#e4e4e4';
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 14 13" fill={fill}>
            <defs>
              <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#00B77F" />
                <stop offset="50%" stopColor="#e4e4e4" />
              </linearGradient>
            </defs>
            <path d="M7 0.5L8.56 5.18H13.48L9.46 7.99L11.02 12.67L7 9.86L2.98 12.67L4.54 7.99L0.52 5.18H5.44L7 0.5Z" />
          </svg>
        );
      })}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
      <path d="M6 12L1 6.5L6 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
      <path d="M1 1L6 6.5L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
      <path d="M1 5.5L5 9.5L13 1" stroke="#00B77F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 1h13v13H1z" /><path d="M14 5h4l3 4v5h-7V5z" /><circle cx="5.5" cy="16.5" r="1.5" /><circle cx="18.5" cy="16.5" r="1.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M11 2L3 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-9-4z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M9 5H4v5" /><path d="M4 5a10 10 0 1 1-1 8" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product>(MOCK_PRODUCT);
  const [loading, setLoading] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    MOCK_PRODUCT.variants[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping'>('description');

  /* ── Fetch real product from API ── */
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/commerce/products/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProduct(data);
          setSelectedVariant(data.variants?.[0] ?? null);
          setActiveImage(0);
        }
      })
      .catch(() => {/* stay on mock */})
      .finally(() => setLoading(false));
  }, [productId]);

  /* ── Derived values ── */
  const images = product.images.length > 0 ? product.images : MOCK_PRODUCT.images;
  const displayPrice = selectedVariant?.price ?? product.discountPrice ?? product.basePrice;
  const originalPrice = product.discountPrice ? product.basePrice : null;
  const isOnSale = !!product.discountPrice;
  const variantStock = selectedVariant?.stock ?? product.totalStock;
  const isLowStock = variantStock > 0 && variantStock <= product.lowStockThreshold;
  const isOutOfStock = variantStock === 0;

  /* ── Determine variant dimension label ── */
  const hasSizes  = product.variants.some((v) => v.size);
  const hasColors = product.variants.some((v) => v.color);
  const variantLabel = hasColors ? 'Colour' : hasSizes ? 'Size' : 'Option';

  /* ── Add to cart handler ── */
  const handleAddToCart = () => {
    if (isOutOfStock || !selectedVariant) return;
    // TODO: wire to cart context / API
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pdp-root a { text-decoration: none; }

        /* Thumbnail rail */
        .thumb-btn { opacity: 0.55; transition: opacity 0.2s; cursor: pointer; border: none; background: none; padding: 0; }
        .thumb-btn.active, .thumb-btn:hover { opacity: 1; }
        .thumb-btn.active img { outline: 1.5px solid #121212; outline-offset: 1px; }

        /* Variant pills */
        .variant-pill {
          min-width: 52px; height: 40px;
          padding: 0 18px;
          border: 1px solid #d1d1d1;
          background: #fff;
          font-family: 'Lato', sans-serif; font-size: 13px; letter-spacing: 0.5px; color: #121212;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .variant-pill:hover:not(.disabled) { border-color: #121212; }
        .variant-pill.selected { border-color: #121212; background: #121212; color: #fff; }
        .variant-pill.disabled { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }

        /* Qty stepper */
        .qty-btn {
          width: 40px; height: 48px;
          background: none; border: none;
          font-size: 22px; color: #121212; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s;
        }
        .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Add to cart button */
        .atc-btn {
          flex: 1; height: 52px;
          background: #121212; color: #fff;
          font-family: 'Lato', sans-serif; font-size: 14px; letter-spacing: 1.5px;
          border: none; cursor: pointer;
          transition: background 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .atc-btn:hover:not(:disabled) { background: #2c2c2c; }
        .atc-btn:disabled { background: #9a9a9a; cursor: not-allowed; }

        /* Buy now */
        .buy-btn {
          flex: 1; height: 52px;
          background: #fff; color: #121212;
          font-family: 'Lato', sans-serif; font-size: 14px; letter-spacing: 1.5px;
          border: 1.5px solid #121212; cursor: pointer;
          transition: background 0.2s;
        }
        .buy-btn:hover { background: #f3f3f3; }

        /* Tab buttons */
        .tab-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Lato', sans-serif; font-size: 13px; letter-spacing: 1px;
          color: rgba(18,18,18,0.45); padding-bottom: 10px;
          border-bottom: 1.5px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .tab-btn.active { color: #121212; border-bottom-color: #121212; }
        .tab-btn:hover { color: #121212; }

        /* Related product cards */
        .rp-link { display: block; color: inherit; text-decoration: none; }
        .rp-link:hover .rp-img { transform: scale(1.03); }
        .rp-img { transition: transform 0.3s ease; }

        /* Trust badge row */
        .trust-badge {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: rgba(18,18,18,0.7);
        }

        /* Responsive */
        .pdp-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 80px 80px;
        }
        @media (max-width: 1024px) { .pdp-layout { padding: 30px 40px 60px; gap: 40px; } }
        @media (max-width: 768px)  {
          .pdp-layout { grid-template-columns: 1fr; padding: 20px 20px 60px; gap: 32px; }
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px)  { .related-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px)  { .related-grid { grid-template-columns: repeat(2, 1fr); } }

        .gallery-main {
          position: relative;
          width: 100%;
          padding-bottom: 114%;
          background: #F3F3F3;
          overflow: hidden;
        }
      `}</style>

      <div className="pdp-root" style={{ width: '100%', background: '#fff', fontFamily: 'Lato, sans-serif' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 80px 0' }}>
          <p style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.5)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link href="/shop" style={{ color: 'rgba(18,18,18,0.5)', textDecoration: 'none' }}>Shop</Link>
            <span>›</span>
            <Link href="/shop/collections/old-money-closet" style={{ color: 'rgba(18,18,18,0.5)', textDecoration: 'none' }}>
              Levi's Old Money Closet
            </Link>
            <span>›</span>
            <span style={{ color: '#121212' }}>{product.title}</span>
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MAIN LAYOUT: Gallery | Info
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="pdp-layout">

          {/* ── LEFT: Image Gallery ── */}
          <div>
            {/* Main image */}
            <div className="gallery-main">
              <img
                src={images[activeImage]?.url}
                alt={images[activeImage]?.alt}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Sale badge */}
              {isOnSale && (
                <div style={{ position: 'absolute', top: 16, left: 16, background: '#DC2626', padding: '5px 13px', color: '#fff', fontFamily: 'Lato', fontSize: 12, letterSpacing: 1 }}>
                  Sale
                </div>
              )}
              {/* Prev/Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121212' }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#121212' }}
                    aria-label="Next image"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-btn${activeImage === i ? ' active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      style={{ width: 72, height: 80, objectFit: 'cover', display: 'block', background: '#F3F3F3' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Collection breadcrumb tag */}
            <p style={{ fontFamily: 'Lato', fontSize: 11, letterSpacing: '1.5px', color: 'rgba(18,18,18,0.5)', textTransform: 'uppercase', marginBottom: 10 }}>
              Old Money Closet
            </p>

            {/* Title */}
            <h1
              style={{
                fontFamily: '"Frank Ruhl Libre", serif',
                fontSize: 'clamp(24px, 3vw, 34px)',
                fontWeight: 500,
                color: '#121212',
                letterSpacing: '0.4px',
                lineHeight: 1.25,
                marginBottom: 16,
              }}
            >
              {product.title}
            </h1>

            {/* Reviews row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <StarRating n={4.8} size={14} />
              <span style={{ fontFamily: 'Lato', fontSize: 13, color: 'rgba(18,18,18,0.6)', letterSpacing: '0.4px' }}>
                4.8 · 127 reviews
              </span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              {originalPrice && (
                <span style={{ fontFamily: 'Lato', fontSize: 16, color: 'rgba(18,18,18,0.5)', letterSpacing: 1, textDecoration: 'line-through' }}>
                  ${originalPrice}.00 {product.currency}
                </span>
              )}
              <span style={{ fontFamily: 'Frank Ruhl Libre, serif', fontSize: 26, fontWeight: 500, color: isOnSale ? '#DC2626' : '#121212', letterSpacing: '0.3px' }}>
                ${displayPrice}.00 {product.currency}
              </span>
              {isOnSale && (
                <span style={{ fontFamily: 'Lato', fontSize: 12, background: '#DC2626', color: '#fff', padding: '2px 8px', letterSpacing: '0.5px' }}>
                  {Math.round(((product.basePrice - displayPrice) / product.basePrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f0f0f0', marginBottom: 24 }} />

            {/* Variant selector */}
            {product.variants.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Lato', fontSize: 13, letterSpacing: '1px', color: '#121212', fontWeight: 600 }}>
                    {variantLabel}: <span style={{ fontWeight: 400 }}>{selectedVariant?.title}</span>
                  </p>
                  {hasSizes && (
                    <button style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.55)', letterSpacing: '0.5px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Size guide
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v._id}
                      className={`variant-pill${selectedVariant?._id === v._id ? ' selected' : ''}${v.stock === 0 ? ' disabled' : ''}`}
                      onClick={() => v.stock > 0 && setSelectedVariant(v)}
                      disabled={v.stock === 0}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            {isLowStock && (
              <p style={{ fontFamily: 'Lato', fontSize: 12, color: '#DC2626', letterSpacing: '0.5px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
                ⚠ Only {variantStock} left — order soon
              </p>
            )}
            {!isOutOfStock && !isLowStock && (
              <p style={{ fontFamily: 'Lato', fontSize: 12, color: '#00B77F', letterSpacing: '0.5px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckIcon /> In stock
              </p>
            )}

            {/* Quantity stepper */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Lato', fontSize: 13, letterSpacing: '1px', color: '#121212', fontWeight: 600, marginBottom: 10 }}>
                Quantity
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d1d1d1', height: 48 }}>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span style={{ width: 44, textAlign: 'center', fontFamily: 'Lato', fontSize: 15, color: '#121212' }}>
                  {quantity}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(variantStock, q + 1))}
                  disabled={quantity >= variantStock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button
                className="atc-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {addedToCart ? (
                  <><CheckIcon /> Added to Cart</>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button className="buy-btn" disabled={isOutOfStock}>
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '20px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', marginBottom: 28 }}>
              <div className="trust-badge">
                <TruckIcon />
                <span style={{ fontFamily: 'Lato', fontSize: 11, letterSpacing: '0.4px', textAlign: 'center' }}>Free shipping over $150</span>
              </div>
              <div className="trust-badge">
                <ShieldIcon />
                <span style={{ fontFamily: 'Lato', fontSize: 11, letterSpacing: '0.4px', textAlign: 'center' }}>Secure checkout</span>
              </div>
              <div className="trust-badge">
                <ReturnIcon />
                <span style={{ fontFamily: 'Lato', fontSize: 11, letterSpacing: '0.4px', textAlign: 'center' }}>30-day returns</span>
              </div>
            </div>

            {/* Tabs: Description / Details / Shipping */}
            <div>
              <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid #f0f0f0', marginBottom: 20 }}>
                {(['description', 'details', 'shipping'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <p style={{ fontFamily: 'Lato', fontSize: 14, color: 'rgba(18,18,18,0.75)', lineHeight: 1.85, letterSpacing: '0.3px' }}>
                  {product.description}
                </p>
              )}

              {activeTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Material', '95% Wool, 5% Cashmere'],
                    ['Fit', 'Slim / Tailored'],
                    ['Lining', 'Satin'],
                    ['Care', 'Dry clean only'],
                    ['Origin', 'Made in Italy'],
                    ['SKU', selectedVariant?.sku ?? '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', gap: 16, fontFamily: 'Lato', fontSize: 13, letterSpacing: '0.3px' }}>
                      <span style={{ color: 'rgba(18,18,18,0.5)', minWidth: 90 }}>{label}</span>
                      <span style={{ color: '#121212' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    ['Standard', 'Kenya: 3–5 business days · Free over KES 15,000'],
                    ['Express', 'Kenya: 1–2 business days · KES 800'],
                    ['International', 'US/EU: 7–14 business days via DHL'],
                    ['Returns', 'Free returns within 30 days · Original condition'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'Lato', fontSize: 13, letterSpacing: '0.3px', borderBottom: '1px solid #f5f5f5', paddingBottom: 12 }}>
                      <span style={{ color: '#121212', fontWeight: 600 }}>{label}</span>
                      <span style={{ color: 'rgba(18,18,18,0.65)', lineHeight: 1.6 }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28 }}>
                {product.tags.map((tag) => (
                  <span key={tag} style={{ fontFamily: 'Lato', fontSize: 11, letterSpacing: '0.8px', color: 'rgba(18,18,18,0.5)', border: '1px solid #e8e8e8', padding: '4px 12px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            RELATED PRODUCTS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 80px' }}>
            <h2
              style={{
                fontFamily: '"Frank Ruhl Libre", serif',
                fontSize: 22,
                fontWeight: 500,
                color: '#121212',
                letterSpacing: '0.4px',
                lineHeight: 1.3,
                marginBottom: 32,
              }}
            >
              You May Also Like
            </h2>
            <div className="related-grid">
              {RELATED_PRODUCTS.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="rp-link">
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '120%', background: '#F3F3F3', overflow: 'hidden' }}>
                    <img
                      className="rp-img"
                      src={`https://placehold.co/400x480/F3F3F3/999999?text=HL`}
                      alt={p.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {p.onSale && (
                      <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#DC2626', padding: '4px 10px', color: '#fff', fontFamily: 'Lato', fontSize: 11, letterSpacing: 1 }}>
                        Sale
                      </div>
                    )}
                  </div>
                  <div style={{ paddingTop: 14, paddingBottom: 14 }}>
                    <p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 14, fontWeight: 500, color: '#121212', letterSpacing: '0.4px', lineHeight: 1.3, marginBottom: 5 }}>
                      {p.name}
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {p.onSale ? (
                        <>
                          <span style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.55)', letterSpacing: 1, textDecoration: 'line-through' }}>${p.price}.00</span>
                          <span style={{ fontFamily: 'Lato', fontSize: 14, color: '#121212', letterSpacing: 1 }}>${p.sale}.00 USD</span>
                        </>
                      ) : (
                        <span style={{ fontFamily: 'Lato', fontSize: 14, color: '#121212', letterSpacing: 1 }}>${p.price}.00 USD</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}