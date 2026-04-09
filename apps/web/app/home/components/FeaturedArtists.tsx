'use client';

import { useEffect, useState } from 'react';

interface Artist {
  _id: string;
  name: string;
  bio: string;
  imageUrl: string;
  role: string;
  socialLinks: { instagram: string; twitter: string; website: string };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

export default function FeaturedArtists() {
  const [artists, setArtists]   = useState<Artist[]>([]);
  const [current, setCurrent]   = useState(0);

  useEffect(() => {
    fetch(`${API}/home/artists`)
      .then(r => r.json())
      .then(d => setArtists(d?.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (artists.length < 2) return;
    const t = setInterval(() => setCurrent(i => (i + 1) % artists.length), 5000);
    return () => clearInterval(t);
  }, [artists.length]);

  if (artists.length === 0) return null;

  const artist = artists[current];

  return (
    <section className="featured-artists-section">
      <div className="section-header">
        <h3>Featured Artists</h3>
      </div>

      <div className="carousel-container">
        <div className="carousel-slide">
          {artist.imageUrl ? (
            <img src={artist.imageUrl} alt={artist.name} className="carousel-image" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />
          )}
        </div>

        <div className="carousel-info">
          {artist.role && (
            <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', margin: '0 0 12px' }}>
              {artist.role}
            </p>
          )}
          <h4>{artist.name}</h4>
          {artist.bio && <p>{artist.bio}</p>}

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {artist.socialLinks?.instagram && (
              <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#000', letterSpacing: '0.08em' }}>Instagram</a>
            )}
            {artist.socialLinks?.twitter && (
              <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#000', letterSpacing: '0.08em' }}>Twitter</a>
            )}
            {artist.socialLinks?.website && (
              <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#000', letterSpacing: '0.08em' }}>Website</a>
            )}
          </div>
        </div>
      </div>

      {artists.length > 1 && (
        <div className="carousel-dots">
          {artists.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
