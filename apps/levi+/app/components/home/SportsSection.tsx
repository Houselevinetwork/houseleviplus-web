'use client';

import { useEffect, useState } from 'react';

interface SportMatch {
  _id: string;
  image: string;
  title: string;
  status: string;
}

export function SportsSection() {
  const [sports, setSports] = useState<SportMatch[]>([]);  // ← FIX: Added type
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sports`);
      const data = await response.json();
      setSports(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch (error) {
      console.error('Failed to load sports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading sports...</div>;

  return (
    <div className="section-container">
      <h2>Sports</h2>
      <p className="section-subtitle">Live games and highlights</p>
      <div className="sports-grid">
        {sports.map((match) => (
          <div key={match._id} className="sports-card">
            <img src={match.image} alt={match.title} />
            <h3>{match.title}</h3>
            <p className="match-status">{match.status}</p>
            <button className="btn btn-primary">Watch Live</button>
          </div>
        ))}
      </div>
    </div>
  );
}