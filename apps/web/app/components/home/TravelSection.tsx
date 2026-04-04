'use client';

import { useEffect, useState } from 'react';

interface TravelPackage {
  _id: string;
  image: string;
  destination: string;
  price?: number;
  duration: number;
}

export function TravelSection() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/travel-packages`);
      const data = await response.json();
      setPackages(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (error) {
      console.error('Failed to load travel packages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading travel packages...</div>;

  return (
    <div className="section-container">
      <h2>Travel</h2>
      <p className="section-subtitle">Explore amazing destinations</p>
      <div className="travel-grid">
        {packages.map((pkg) => (
          <div key={pkg._id} className="travel-card">
            <img src={pkg.image} alt={pkg.destination} />
            <h3>{pkg.destination}</h3>
            <p className="travel-price">From KSh {pkg.price?.toLocaleString() || 'N/A'}</p>
            <p className="travel-duration">{pkg.duration} days</p>
            <button className="btn btn-primary">Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
