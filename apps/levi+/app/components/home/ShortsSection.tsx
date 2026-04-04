'use client';

import { useEffect, useState } from 'react';

interface Short {
  _id: string;
  videoUrl: string;
  thumbnail: string;
  title: string;
}

export function ShortsSection() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShorts();
  }, []);

  const loadShorts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts`);
      const data = await response.json();
      setShorts(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch (error) {
      console.error('Failed to load shorts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading shorts...</div>;

  return (
    <div className="section-container">
      <h2>Shorts</h2>
      <p className="section-subtitle">Quick entertainment in bite-sized clips</p>
      <div className="shorts-grid">
        {shorts.map((short) => (
          <div key={short._id} className="short-card">
            <video src={short.videoUrl} poster={short.thumbnail} controls className="short-video" />
            <p className="short-title">{short.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}