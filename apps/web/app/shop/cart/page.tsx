'use client';

/**
 * Location: apps/web/app/shop/cart/page.tsx
 * 
 * Shopping cart page with:
 * - Authentication check (redirects to login if not signed in)
 * - Cart items list
 * - Quantity adjustment
 * - Remove items
 * - Cart totals
 * - Checkout button with auth guard
 * - Dark green theme (close to black: #1B5E20)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface CartItem {
  key: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  variant: string | null;
  qty: number;
}

// -- Icons --------------------------------------------------
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const ArrowL = () => <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M6 1L1 5.5L6 10M14 5.5H1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

function Skel({ w = '100%', h = 16, r = 2, style = {} }: { w?: string | number; h?: number; r?: number; style?: React.CSSProperties }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f4f2ef 0%,#eeebe6 50%,#f4f2ef 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', ...style }} />;
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // -- Check authentication on mount ------------------------
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/shop/cart');
    }
  }, [isAuthenticated, isLoading, router]);

  // -- Load cart from localStorage ------------------------
  useEffect(() => {
    const loadCart = () => {
      try {
        const stored = localStorage.getItem('hl_cart');
        const items: CartItem[] = stored ? JSON.parse(stored) : [];
        setCart(items);
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        setPageLoading(false);
      }
    };

    loadCart();

    // Listen for cart updates from other tabs/windows
    const handleCartUpdate = () => loadCart();
    window.addEventListener('hl_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('hl_cart_updated', handleCartUpdate);
  }, []);

  // -- Update quantity ------------------------------------
  const updateQuantity = (key: string, qty: number) => {
    if (qty < 1) {
      removeItem(key);
      return;
    }
    const updated = cart.map(item => item.key === key ? { ...item, qty } : item);
    setCart(updated);
    localStorage.setItem('hl_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('hl_cart_updated'));
  };

  // -- Remove item ----------------------------------------
  const removeItem = (key: string) => {
    const updated = cart.filter(item => item.key !== key);
    setCart(updated);
    localStorage.setItem('hl_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('hl_cart_updated'));
  };

  // -- Calculate totals -----------------------------------
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal > 15000 ? 0 : 800; // Free shipping over KSh 15,000
  const tax = Math.round(subtotal * 0.16); // 16% VAT (Kenya)
  const total = subtotal + shipping + tax;

  // -- Checkout handler -----------------------------------
  const handleCheckout = async () => {
    if (cart.length === 0 || !isAuthenticated) return;

    setCheckoutLoading(true);
    try {
      // Create order in backend
      const orderRes = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            variant: item.variant,
            quantity: item.qty,
            price: item.price,
          })),
          subtotal,
          shipping,
          tax,
          total,
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');

      const order = await orderRes.json();

      // Clear cart
      localStorage.removeItem('hl_cart');
      setCart([]);
      window.dispatchEvent(new Event('hl_cart_updated'));

      // Redirect to payment/success page
      window.location.href = `/checkout/${order.id}`;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // -- Show loading or redirect state ----------------------
  if (isLoading || pageLoading) {
    return (
      <div style={{ padding: '60px 20px', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 36, fontWeight: 500, color: '#121212', marginBottom: 32 }}>
            <Skel w={200} h={40} r={2} />
          </h1>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px', gap: 24, padding: 20, borderBottom: '1px solid #eeebe6', alignItems: 'center' }}>
              <Skel w={100} h={100} r={1} />
              <div><Skel w="100%" h={16} style={{ marginBottom: 8 }} /><Skel w="60%" h={14} /></div>
              <Skel w={60} h={40} r={1} />
              <Skel w={80} h={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -- Show not authenticated message ----------------------
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '60px 20px', minHeight: '100vh', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <LockIcon />
          </div>
          <h1 style={{ fontFamily: '"Frank Ruhl Lille", serif', fontSize: 28, fontWeight: 500, color: '#121212', marginBottom: 16 }}>
            Sign In Required
          </h1>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
            You must be signed in to view and manage your shopping cart. Please sign in to continue.
          </p>
          <Link href="/login?redirect=/shop/cart" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, paddingLeft: 32, paddingRight: 32, background: '#1B5E20', color: '#fff', fontFamily: "'Julius Sans One', sans-serif", fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none', transition: 'background 0.2s' }}>
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty = !pageLoading && cart.length === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&family=Julius+Sans+One&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shimmer{0%,100%{background-position:-200% 0;}50%{background-position:200% 0;}}
        .hl-cart a{text-decoration:none;}
        .cart-item:hover{background:#faf8f5;}
        .qty-btn:hover{background:#f4f2ef;}
        .remove-btn:hover{color:#a0291e;}
        @media(max-width:900px){.cart-grid{grid-template-columns:1fr!important;}}
      `}</style>

      <div className="hl-cart" style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Lato, sans-serif' }}>

        {/* Breadcrumb */}
        <div style={{ background: '#faf8f5', borderBottom: '1px solid #eeebe6', padding: '0 60px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, height: 46, fontFamily: 'Lato', fontSize: 11, color: 'rgba(18,18,18,0.5)', letterSpacing: '0.08em' }}>
            <Link href="/shop" style={{ color: 'rgba(18,18,18,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowL /> Shop
            </Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: '#121212' }}>Cart</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 60px', minHeight: 600 }}>

          <h1 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 36, fontWeight: 500, color: '#121212', marginBottom: 32 }}>
            Shopping Cart
          </h1>

          {isEmpty ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" style={{ marginBottom: 24, margin: '0 auto 24' }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <h2 style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 24, color: '#121212', marginBottom: 12 }}>
                Your cart is empty
              </h2>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 32 }}>
                Add items to your cart to get started
              </p>
              <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, paddingLeft: 32, paddingRight: 32, background: '#1B5E20', color: '#fff', fontFamily: "'Julius Sans One', sans-serif", fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none' }}>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>

              {/* Left: Cart Items */}
              <div>
                <div style={{ borderBottom: '1px solid #eeebe6', paddingBottom: 16, marginBottom: 16 }}>
                  <p style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.5)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                  </p>
                </div>

                {cart.map(item => (
                  <div key={item.key} className="cart-item" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, padding: 20, borderBottom: '1px solid #eeebe6', alignItems: 'start', transition: 'background 0.15s' }}>

                    {/* Image */}
                    <div style={{ width: 120, height: 120, background: '#F3F3F3', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={item.imageUrl ?? 'https://placehold.co/120x120/F3F3F3/999999?text=No+Image'}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 120 }}>
                      <div>
                        <Link href={`/shop/products/${item.productId}`} style={{ fontFamily: '"Frank Ruhl Libre", serif', fontSize: 16, fontWeight: 500, color: '#121212', textDecoration: 'none', marginBottom: 8, display: 'block', transition: 'opacity 0.15s' }}>
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p style={{ fontFamily: 'Lato', fontSize: 12, color: 'rgba(18,18,18,0.5)', marginBottom: 8 }}>
                            {item.variant}
                          </p>
                        )}
                        <p style={{ fontFamily: 'Lato', fontSize: 14, fontWeight: 700, color: '#121212' }}>
                          KSh {item.price.toLocaleString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
                        {/* Quantity adjuster */}
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d8d4cc', width: 110 }}>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.key, item.qty - 1)}
                            style={{ width: 36, height: 36, background: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, color: '#121212', transition: 'background 0.15s' }}
                          >
                            -
                          </button>
                          <span style={{ flex: 1, textAlign: 'center', fontFamily: 'Lato', fontSize: 13, color: '#121212' }}>
                            {item.qty}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.key, item.qty + 1)}
                            style={{ width: 36, height: 36, background: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, color: '#121212', transition: 'background 0.15s' }}
                          >
                            +
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.key)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', transition: 'color 0.15s', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Order Summary */}
              <div style={{ position: 'sticky', top: 20 }}>
                <div style={{ background: '#faf8f5', padding: 32, borderRadius: 2 }}>
                  <h3 style={{ fontFamily: 'Lato', fontSize: 14, fontWeight: 700, color: '#121212', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Order Summary
                  </h3>

                  <div style={{ marginBottom: 24 }}>
                    {/* Subtotal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: 'Lato', fontSize: 13 }}>
                      <span style={{ color: 'rgba(18,18,18,0.6)' }}>Subtotal</span>
                      <span style={{ color: '#121212', fontWeight: 600 }}>KSh {subtotal.toLocaleString()}</span>
                    </div>

                    {/* Shipping */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: 'Lato', fontSize: 13 }}>
                      <span style={{ color: 'rgba(18,18,18,0.6)' }}>
                        Shipping
                        {shipping === 0 && <span style={{ fontSize: 11, color: '#1B5E20', marginLeft: 6 }}>(Free)</span>}
                      </span>
                      <span style={{ color: '#121212', fontWeight: 600 }}>
                        {shipping === 0 ? 'Free' : `KSh ${shipping.toLocaleString()}`}
                      </span>
                    </div>

                    {/* Tax */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontFamily: 'Lato', fontSize: 13 }}>
                      <span style={{ color: 'rgba(18,18,18,0.6)' }}>Tax (16% VAT)</span>
                      <span style={{ color: '#121212', fontWeight: 600 }}>KSh {tax.toLocaleString()}</span>
                    </div>

                    <div style={{ width: '100%', height: 1, background: '#d8d4cc', marginBottom: 16 }} />

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Frank Ruhl Libre", serif', fontSize: 20, fontWeight: 600 }}>
                      <span style={{ color: '#121212' }}>Total</span>
                      <span style={{ color: '#1B5E20' }}>KSh {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || cart.length === 0 || !isAuthenticated}
                    style={{ width: '100%', height: 48, background: checkoutLoading ? '#1B5E20' : '#1B5E20', border: 'none', cursor: checkoutLoading || cart.length === 0 ? 'default' : 'pointer', color: '#fff', fontFamily: "'Julius Sans One', sans-serif", fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s', marginBottom: 16, opacity: checkoutLoading || cart.length === 0 ? 0.7 : 1 }}
                  >
                    {checkoutLoading ? <><CheckIcon /> Processing...</> : 'Proceed to Checkout'}
                  </button>

                  <Link href="/shop" style={{ width: '100%', height: 48, background: '#fff', border: '1px solid #d8d4cc', cursor: 'pointer', color: '#121212', fontFamily: "'Julius Sans One', sans-serif", fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.15s' }}>
                    Continue Shopping
                  </Link>

                  {/* Info */}
                  <p style={{ fontFamily: 'Lato', fontSize: 11, color: 'rgba(18,18,18,0.45)', marginTop: 20, textAlign: 'center', lineHeight: 1.6 }}>
                    Free shipping on orders over KSh 15,000
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
