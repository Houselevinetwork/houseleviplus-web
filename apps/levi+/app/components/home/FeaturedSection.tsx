'use client';

import { useEffect, useState } from 'react';

interface FeaturedItem {
  _id: string;
  poster: string;
  title: string;
  rating: number;
}

export function FeaturedSection() {
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/featured`);
      const data = await response.json();
      setFeatured(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch (error) {
      console.error('Failed to load featured:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading featured...</div>;

  return (
    <div className="section-container">
      <h2>Featured</h2>
      <p className="section-subtitle">Hand-picked content just for you</p>
      <div className="featured-grid">
        {featured.map((item) => (
          <div key={item._id} className="featured-card">
            <img src={item.poster} alt={item.title} />
            <h3>{item.title}</h3>
            <p className="rating">⭐ {item.rating}/10</p>
            <button className="btn btn-primary">Watch Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}