'use client';

import { useEffect, useState } from 'react';

interface Host {
  _id: string;
  name: string;
  image: string;
  bio: string;
}

export function HostsSection() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosts`);
      const data = await response.json();
      
      // Handle both array response and object with hosts property
      const hostsArray = Array.isArray(data) ? data : data?.hosts || [];
      
      if (!Array.isArray(hostsArray)) {
        throw new Error('Invalid hosts data format');
      }
      
      setHosts(hostsArray);
    } catch (error) {
      console.error('Failed to load hosts:', error);
      setError('Failed to load hosts');
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading hosts...</div>;
  
  if (error) return <div className="error">{error}</div>;
  
  if (hosts.length === 0) return <div className="empty">No hosts available</div>;

  return (
    <div className="section-container">
      <h2>Featured Hosts</h2>
      <p className="section-subtitle">Meet the creators behind House Levi+</p>
      <div className="hosts-grid">
        {hosts.map((host) => (
          <div key={host._id} className="host-card">
            <img src={host.image} alt={host.name} />
            <h3>{host.name}</h3>
            <p>{host.bio}</p>
            <button className="btn btn-outline">Follow</button>
          </div>
        ))}
      </div>
    </div>
  );
}
