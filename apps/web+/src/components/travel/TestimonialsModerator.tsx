'use client';
import { useState, useEffect } from 'react';
import type { TravelTestimonial, TestimonialStatus } from '@houselevi/travel-api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function authHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hl_admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function TestimonialsModerator() {
  const [testimonials, setTestimonials] = useState<TravelTestimonial[]>([]);
  const [filter, setFilter] = useState<TestimonialStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`${API}/travel/testimonials/admin${q}`, { headers: authHeader() });
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: TestimonialStatus, featured?: boolean) => {
    await fetch(`${API}/travel/testimonials/${id}/status`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, featured }),
    });
    load();
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`${API}/travel/testimonials/${id}`, { method: 'DELETE', headers: authHeader() });
    load();
  };

  const statusColors: Record<string, string> = {
    pending: '#f39c12', approved: '#27ae60', rejected: '#c0392b',
  };

  return (
    <div className="testimonials-mod">
      <div className="testimonials-mod__header">
        <h2>Testimonials</h2>
        <div className="testimonials-mod__filters">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(s => (
            <button key={s} className={`testimonials-mod__filter ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {loading && <p>Loading...</p>}
      {!loading && testimonials.length === 0 && <p>No {filter} testimonials.</p>}
      {!loading && testimonials.map(t => (
        <div key={t.id} className="testimonials-mod__card">
          <div className="testimonials-mod__meta">
            <span>{t.clientName}</span>
            {t.destination && <span>{t.destination}</span>}
            <span style={{ color: statusColors[t.status] }}>{t.status}</span>
            {t.featured && <span>★ Featured</span>}
          </div>
          <blockquote>{t.quote}</blockquote>
          <div className="testimonials-mod__actions">
            {t.status !== 'approved' && (
              <button onClick={() => updateStatus(t.id, 'approved')}>Approve</button>
            )}
            {t.status === 'approved' && (
              <button onClick={() => updateStatus(t.id, 'approved', !t.featured)}>
                {t.featured ? 'Unfeature' : 'Feature'}
              </button>
            )}
            {t.status !== 'rejected' && (
              <button onClick={() => updateStatus(t.id, 'rejected')}>Reject</button>
            )}
            <button onClick={() => deleteTestimonial(t.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}