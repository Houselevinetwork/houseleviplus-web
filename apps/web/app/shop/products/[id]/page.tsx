'use client';

export const runtime = 'edge';

/**
 * Location: apps/web/app/shop/products/[id]/page.tsx
 */
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Variant { _id?: string; title: string; price: number; stock: number; sku?: string; }
interface Product {
  id: string; name: string; description: string;
  price: number; salePrice: number | null; onSale: boolean;
  imageUrl: string | null; images: { url: string; alt?: string }[];
  category: string | null; stock: number; visible: boolean;
  slug: string; isFeatured: boolean; tags: string[]; variants: Variant[];
}

function addToCart(product: Product, variant: Variant | null, qty: number) {
  try {
    const raw = localStorage.getItem('hl_cart');
    const cart: any[] = raw ? JSON.parse(raw) : [];
    const key = variant ? `${product.id}::${variant._id ?? variant.title}` : product.id;
    const exist = cart.find(c => c.key === key);
    const displayPrice = variant ? variant.price : (product.salePrice ?? product.price);
    if (exist) { exist.qty += qty; } else {
      cart.push({ key, productId: product.id, name: product.name, imageUrl: product.imageUrl, price: displayPrice, variant: variant?.title ?? null, qty });
    }
    localStorage.setItem('hl_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('hl_cart_updated'));
    return true;
  } catch { return false; }
}

const ArrowL = () => <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M6 1L1 5.5L6 10M14 5.5H1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CartIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const CheckCircleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" strokeWidth="2"><polyline points="20 6 9 17 4 12"/><circle cx="12" cy="12" r="10"/></svg>;
function Skel({ w = '100%', h = 16, r = 2 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f4f2ef 0%,#eeebe6 50%,#f4f2ef 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

const CAT_LABELS: Record<string, string> = {
  'old-money-closet': "Levi's Old Money Closet", 'aviation-gear': 'Aviation Gear',
  'scale-collectibles': 'Scale Collectibles', 'host-merch': 'Host Merch',
  'book-club': 'Book Club', 'hl-merch': 'HL Merch',
  'partner-brands': 'Partner Brands', 'car-collectibles': 'Car Collectibles',
};

function normProduct(data: any): Product {
  return {
    id: String(data._id ?? data.id ?? ''), name: String(data.name ?? data.title ?? 'Product'),
    description: String(data.description ?? data.longDescription ?? ''),
    price: Number(data.price ?? 0), salePrice: data.salePrice != null ? Number(data.salePrice) : null,
    onSale: Boolean(data.onSale), imageUrl: data.imageUrl ?? data.images?.[0]?.url ?? null,
    images: Array.isArray(data.images) ? data.images : [], category: data.category ?? null,
    stock: Number(data.stock ?? 0), visible: Boolean(data.visible ?? true),
    slug: String(data.slug ?? ''), isFeatured: Boolean(data.isFeatured),
    tags: Array.isArray(data.tags) ? data.tags : [],
    variants: Array.isArray(data.variants) ? data.variants.map((v: any) => ({
      _id: v._id ?? v.id, title: String(v.title ?? v.name ?? ''),
      price: Number(v.price ?? data.price ?? 0), stock: Number(v.stock ?? 0), sku: v.sku ?? '',
    })) : [],
  };
}

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API}/api/commerce/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        const normalized = normProduct(data);
        setProduct(normalized);
        if (normalized.variants?.length > 0) setSelectedVariant(normalized.variants[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally { setLoading(false); }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const ok = addToCart(product, selectedVariant, qty);
    if (ok) { setAdded(true); setTimeout(() => setAdded(false), 3000); }
  };

  const displayPrice = selectedVariant ? selectedVariant.price : (product?.salePrice ?? product?.price ?? 0);
  const allImages = product?.images?.length ? product.images : product?.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : [];
  const inStock = selectedVariant ? selectedVariant.stock > 0 : (product?.stock ?? 0) > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Julius+Sans+One&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shimmer{0%,100%{background-position:-200% 0;}50%{background-position:200% 0;}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .hl-product a{text-decoration:none;}
        .thumb-btn:hover{opacity:1!important;}
        .variant-btn:hover{border-color:#121212!important;background:#f8f6f2!important;}
        .qty-btn:hover{background:#f4f2ef!important;}
        .added-banner{animation:slideIn 0.3s ease;}
        @media(max-width:900px){.product-grid{grid-template-columns:1fr!important;}}
        @media(max-width:600px){.thumb-strip{display:none!important;}}
      `}</style>
      <div className="hl-product" style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Lato, sans-serif' }}>
        {added && (
          <div className="added-banner" style={{ position: 'fixed', top: 20, right: 20, background: '#1B5E20', color: '#fff', padding: '16px 20px', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 10, zIndex: 50, fontFamily: 'Lato', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <CheckCircleIcon /><span>Added to cart!</span>
          </div>
        )}
        <div style={{ background: '#faf8f5', borderBottom: '1px solid #eeebe6', padding: '0 60px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, height: 46, fontFamily: 'Lato', fontSize: 11, color: 'rgba(18,18,18,0.5)', letterSpacing: '0.08em' }}>
            <Link href="/shop" style={{ color: 'rgba(18,18,18,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><ArrowL /> Shop</Link>
            {product?.category && (<><span style={{ opacity: 0.4 }}>/</span><Link href={`/shop/collections/${product.category}`} style={{ color: 'rgba(18,18,18,0.5)', textDecoration: 'none' }}>{CAT_LABELS[product.category] ?? product.category}</Link></>)}
            {product && (<><span style={{ opacity: 0.4 }}>/</span><span style={{ color: '#121212' }}>{product.name}</span></>)}
          </div>
        </div>
        <div className="product-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 60px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            {loading ? <Skel w="100%" h={560} r={1} /> : allImages.length === 0 ? (
              <div style={{ width: '100%', aspectRatio: '1', background: '#F3F3F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            ) : (
              <>
                <div style={{ width: '100%', aspectRatio: '1', background: '#F3F3F3', overflow: 'hidden', position: 'relative' }}>
                  <img src={allImages[activeImg]?.url} alt={allImages[activeImg]?.alt ?? product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {product?.onSale && <div style={{ position: 'absolute', top: 16, left: 16, background: '#DC2626', padding: '6px 14px', color: '#fff', fontFamily: 'Lato', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Sale</div>}
                  {product?.isFeatured && <div style={{ position: 'absolute', top: 16, right: 16, background: '#f59e0b', padding: '6px 14px', color: '#fff', fontFamily: 'Lato', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Best Seller</div>}
                </div>
                {allImages.length > 1 && (
                  <div className="thumb-strip" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {allImages.map((img, i) => (
                      <button key={i} className="thumb-btn" onClick={() => setActiveImg(i)} style={{ width: 72, height: 72, background: '#F3F3F3', border: `2px solid ${i === activeImg ? '#121212' : 'transparent'}`, overflow: 'hidden', cursor: 'pointer', padding: 0, opacity: i === activeImg ? 1 : 0.55, transition: 'opacity 0.15s, border-color 0.15s', flexShrink: 0 }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ paddingTop: 8 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Skel w="80%" h={38} /><Skel w={140} h={22} /><Skel w="100%" h={80} /><Skel w="100%" h={52} />
              </div>
            ) : error ? (
              <div style={{ fontFamily: 'Lato', fontSize: 14, color: '#a0291e', padding: 20 }}>
                <p style={{ marginBottom: 16 }}>{error}</p>
                <Link href="/shop" style={{ color: '#1b3d7b', textDecoration: 'underline' }}>Back to Shop</Link>
              </div>
            ) : product ? (
              <>
                {product.category && <Link href={`/shop/collections/${product.category}`} style={{ fontFamily: "'Julius Sans One', sans-serif", fontSize: 10, color: 'rgba(18,18,18,0.45)', letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: 14, display: 'inline-block' }}>{CAT_LABELS[product.category] ?? product.category}</Link>}
                <h1 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 500, color: '#121212', letterSpacing: '0.4px', lineHeight: 1.25, marginBottom: 18 }}>{product.name}</h1>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
                  {product.onSale && product.salePrice !== null ? (
                    <><span style={{ fontFamily: 'Lato', fontSize: 13, color: 'rgba(18,18,18,0.45)', letterSpacing: 1, textDecoration: 'line-through' }}>KSh {product.price.toLocaleString()}</span><span style={{ fontFamily: 'Lato', fontSize: 22, fontWeight: 700, color: '#DC2626', letterSpacing: 0.5 }}>KSh {displayPrice.toLocaleString()}</span></>
                  ) : <span style={{ fontFamily: 'Lato', fontSize: 22, fontWeight: 700, color: '#121212', letterSpacing: 0.5 }}>KSh {displayPrice.toLocaleString()}</span>}
                </div>
                <div style={{ width: '100%', height: 1, background: '#eeebe6', marginBottom: 24 }} />
                {product.variants?.length > 1 && (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontFamily: 'Lato', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(18,18,18,0.6)', display: 'block', marginBottom: 10 }}>{selectedVariant ? `${selectedVariant.title} — KSh ${selectedVariant.price.toLocaleString()}` : 'Select Option'}</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {product.variants.map((v, i) => <button key={i} className="variant-btn" onClick={() => setSelectedVariant(v)} style={{ padding: '9px 18px', fontFamily: 'Lato', fontSize: 12, letterSpacing: '0.06em', background: selectedVariant?.title === v.title ? '#121212' : '#fff', color: selectedVariant?.title === v.title ? '#fff' : '#121212', border: `1px solid ${selectedVariant?.title === v.title ? '#121212' : '#d8d4cc'}`, cursor: v.stock === 0 ? 'not-allowed' : 'pointer', opacity: v.stock === 0 ? 0.4 : 1, transition: 'all 0.15s' }}>{v.title}</button>)}
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: 'Lato', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(18,18,18,0.6)', display: 'block', marginBottom: 10 }}>Quantity</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d8d4cc', width: 120 }}>
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 44, background: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, color: '#121212', transition: 'background 0.15s' }}>-</button>
                    <span style={{ flex: 1, textAlign: 'center', fontFamily: 'Lato', fontSize: 14, color: '#121212' }}>{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 44, background: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, color: '#121212', transition: 'background 0.15s' }}>+</button>
                  </div>
                </div>
                {!added ? (
                  <button onClick={handleAddToCart} disabled={!inStock} style={{ width: '100%', height: 54, background: inStock ? '#121212' : '#d8d4cc', border: 'none', cursor: inStock ? 'pointer' : 'default', color: '#fff', fontFamily: "'Julius Sans One', sans-serif", fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s', marginBottom: 14 }}>
                    <CartIcon /> Add to Cart
                  </button>
                ) : (
                  <Link href="/shop/cart" style={{ width: '100%', height: 54, background: '#1B5E20', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: "'Julius Sans One', sans-serif", fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14, textDecoration: 'none' }}>
                    <CheckIcon /> View Cart &amp; Checkout
                  </Link>
                )}
                {inStock && <div style={{ fontFamily: 'Lato', fontSize: 11, color: 'rgba(18,18,18,0.45)', letterSpacing: '0.06em', marginBottom: 24, textAlign: 'center' }}>{(selectedVariant?.stock ?? product.stock) < 10 ? `Only ${selectedVariant?.stock ?? product.stock} left` : 'In stock'}</div>}
                <div style={{ width: '100%', height: 1, background: '#eeebe6', marginBottom: 24 }} />
                {product.description && <div style={{ marginBottom: 24 }}><h3 style={{ fontFamily: 'Lato', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(18,18,18,0.6)', marginBottom: 12 }}>Description</h3><p style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 15, color: 'rgba(18,18,18,0.75)', lineHeight: 1.8, letterSpacing: '0.3px' }}>{product.description}</p></div>}
                {product.tags?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{product.tags.map((t: string) => <span key={t} style={{ fontFamily: 'Lato', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', background: '#f4f2ef', color: 'rgba(18,18,18,0.5)', borderRadius: 1 }}>{t}</span>)}</div>}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}