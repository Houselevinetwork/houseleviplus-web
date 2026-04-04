'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/utils/api';

interface HomeEvent {
  _id: string; title: string; eventDate: string; location: string;
  ticketPrice: string; bookingUrl: string; ticketUrl: string;
  seatsRemaining: number; isActive: boolean;
}

export default function EventsAdminPage() {
  const [events, setEvents]     = useState<HomeEvent[]>([]);
  const [form, setForm]         = useState<Record<string, string>>({});
  const [editing, setEditing]   = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/home/events');
      setEvents(data?.data ?? []);
    } catch (e: any) { console.error(e?.response?.status, e?.message); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const save = async () => {
    try {
      if (editing) {
        await api.patch(`/home/admin/events/${editing}`, form);
      } else {
        await api.post('/home/admin/events', form);
      }
      setForm({}); setEditing(null); setCreating(false); fetchEvents();
    } catch (e: any) { alert(e?.response?.data?.message ?? 'Save failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/home/admin/events/${id}`);
    fetchEvents();
  };

  const startEdit = (ev: HomeEvent) => {
    setForm({ title: ev.title, eventDate: ev.eventDate, location: ev.location, ticketPrice: ev.ticketPrice, bookingUrl: ev.bookingUrl, ticketUrl: ev.ticketUrl, seatsRemaining: String(ev.seatsRemaining) });
    setEditing(ev._id); setCreating(true);
  };

  const F = (k: string, label: string, type = 'text') => (
    <div key={k}>
      <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
        style={{ width: '100%', height: 44, border: '1px solid rgba(0,0,0,0.2)', padding: '0 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
    </div>
  );

  return (
    <div style={{ padding: '48px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', maxWidth: 900 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 8px' }}>Home / Events</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0 }}>Upcoming Events</h1>
        <button onClick={() => { setForm({}); setEditing(null); setCreating(true); }}
          style={{ padding: '10px 24px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          + New Event
        </button>
      </div>

      {creating && (
        <div style={{ border: '1px solid rgba(0,0,0,0.15)', padding: 32, marginBottom: 32, background: '#fafafa' }}>
          <h3 style={{ margin: '0 0 24px', fontWeight: 500 }}>{editing ? 'Edit' : 'New'} Event</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {F('title', 'Title *')}
            {F('eventDate', 'Date *', 'date')}
            {F('location', 'Location')}
            {F('ticketPrice', 'Ticket Price (e.g. KES 2,500)')}
            {F('bookingUrl', 'Booking URL')}
            {F('ticketUrl', 'Ticket Payment URL')}
            {F('seatsRemaining', 'Seats Available', 'number')}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={save} style={{ padding: '10px 28px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Save</button>
            <button onClick={() => { setCreating(false); setEditing(null); setForm({}); }} style={{ padding: '10px 28px', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ border: events.length ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
        {events.map((ev, i) => (
          <div key={ev._id} style={{ padding: '20px 24px', borderBottom: i < events.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontWeight: 500, fontSize: 15 }}>{ev.title}</h4>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{ev.eventDate} · {ev.location} · {ev.ticketPrice}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => startEdit(ev)} style={{ padding: '7px 16px', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => del(ev._id)} style={{ padding: '7px 16px', background: 'none', border: '1px solid #dc2626', color: '#dc2626', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
