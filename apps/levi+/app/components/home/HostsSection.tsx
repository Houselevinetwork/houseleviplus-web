'use client';

import { useEffect, useState } from 'react';

export function HostsSection() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosts`);
      const data = await response.json();
      setHosts(data);
    } catch (error) {
      console.error('Failed to load hosts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading hosts...</div>;

  return (
    <div className="section-container">
      <h2>Featured Hosts</h2>
      <p className="section-subtitle">Meet the creators behind House Levi+</p>
      <div className="hosts-grid">
        {hosts.map((host: any) => (
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
