'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TrendingItem {
  _id: string;
  thumbnail: string;
  title: string;
  link: string;
}

export function TrendingSection() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trending`);
      const data = await response.json();
      setTrending(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (error) {
      console.error('Failed to load trending:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading trending...</div>;

  return (
    <div className="section-container">
      <h2>Trending Now</h2>
      <p className="section-subtitle">What everyone is watching</p>
      <div className="carousel-grid">
        {trending.map((item) => (
          <div key={item._id} className="carousel-item">
            <img src={item.thumbnail} alt={item.title} />
            <div className="carousel-overlay">
              <h4>{item.title}</h4>
              <Link href={item.link} className="btn btn-play">? Watch</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
