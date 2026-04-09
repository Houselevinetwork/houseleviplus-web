'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  image: string;
  title: string;
  price?: number;
}

export function ShopSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="section-container">
      <h2>Shop</h2>
      <p className="section-subtitle">Premium merchandise and collectibles</p>
      <div className="shop-grid">
        {products.map((product) => (
          <div key={product._id} className="shop-card">
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>
            <p className="price">KSh {product.price?.toLocaleString() || 'N/A'}</p>
            <Link href={`/shop/${product._id}`} className="btn btn-primary">View Details</Link>
          </div>
        ))}
      </div>
      <div className="section-cta">
        <Link href="/shop" className="btn btn-lg">View All Products →</Link>
      </div>
    </div>
  );
}