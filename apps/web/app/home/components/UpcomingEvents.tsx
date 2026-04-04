'use client';

import { useEffect, useState } from 'react';

interface HomeEvent {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventDate: string;
  location: string;
  ticketPrice: string;
  bookingUrl: string;
  ticketUrl: string;
  seatsRemaining: number;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function UpcomingEvents() {
  const [events, setEvents] = useState<HomeEvent[]>([]);

  useEffect(() => {
    fetch(`${API}/home/events`)
      .then(r => r.json())
      .then(d => setEvents(d?.data ?? []))
      .catch(() => {});
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="events-section" id="events-section">
      <div className="section-header">
        <h3>Upcoming Events</h3>
        <p className="section-subtitle">Premiers and performances</p>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event._id} className="event-card">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} />
            ) : (
              <div style={{ width: '100%', height: 300, background: '#f0f0f0', marginBottom: 24 }} />
            )}
            <div className="event-info">
              <h4>{event.title}</h4>
              {event.eventDate && (
                <p className="event-date">
                  {new Date(event.eventDate).toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              {event.location && <p className="event-location">{event.location}</p>}
              {event.ticketPrice && (
                <p style={{ fontSize: 14, fontWeight: 600, margin: '8px 0 16px', color: '#000' }}>
                  {event.ticketPrice}
                </p>
              )}
              {event.seatsRemaining > 0 && (
                <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', margin: '0 0 16px' }}>
                  {event.seatsRemaining} seats remaining
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {event.bookingUrl && (
                  <a
                    href={event.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 24px',
                      background: '#000',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      display: 'inline-block',
                      transition: 'opacity 0.3s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Book a Seat
                  </a>
                )}
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: '#000',
                      border: '1px solid #000',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      display: 'inline-block',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#000';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#000';
                    }}
                  >
                    Pay for Ticket
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
