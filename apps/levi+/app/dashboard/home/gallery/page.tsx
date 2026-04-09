'use client';

import { useEffect, useState, useRef } from 'react';
import api from '../../../lib/utils/api';
import axios from 'axios';

interface GalleryEvent {
  _id: string;
  name: string;
  slug: string;
  imageCount: number;
  uploadStatus: string;
  isActive: boolean;
  displayOrder: number;
  description: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

export default function GalleryAdminPage() {
  const [events, setEvents]               = useState<GalleryEvent[]>([]);
  const [loading, setLoading]             = useState(false);
  const [creating, setCreating]           = useState(false);
  const [newName, setNewName]             = useState('');
  const [newSlug, setNewSlug]             = useState('');
  const [newDesc, setNewDesc]             = useState('');
  const [uploadingId, setUploadingId]     = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadPct, setUploadPct]         = useState(0);
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const activeUploadId                    = useRef<string | null>(null);
  const pollRef                           = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/home/admin/gallery/events');
      setEvents(data?.data ?? []);
    } catch (e: any) {
      console.error('fetchEvents error:', e?.response?.status, e?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // Poll event status until upload is complete or failed
  const startPolling = (eventId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let dots = 0;

    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get('/home/admin/gallery/events');
        const events: GalleryEvent[] = data?.data ?? [];
        const ev = events.find(e => e._id === eventId);

        setEvents(events);

        if (!ev) return;

        dots = (dots + 1) % 4;
        const dotStr = '.'.repeat(dots + 1);

        if (ev.uploadStatus === 'processing') {
          setUploadProgress(`Processing images${dotStr} ${ev.imageCount} uploaded so far`);
        } else if (ev.uploadStatus === 'complete') {
          setUploadProgress(`✅ Complete — ${ev.imageCount} photos uploaded!`);
          clearInterval(pollRef.current!);
          setTimeout(() => {
            setUploadProgress('');
            setUploadingId(null);
            setUploadPct(0);
          }, 3000);
        } else if (ev.uploadStatus === 'failed') {
          setUploadProgress('❌ Upload failed — check server logs');
          clearInterval(pollRef.current!);
          setTimeout(() => {
            setUploadProgress('');
            setUploadingId(null);
            setUploadPct(0);
          }, 4000);
        }
      } catch {}
    }, 2000); // poll every 2 seconds
  };

  const handleCreate = async () => {
    if (!newName || !newSlug) return;
    try {
      await api.post('/home/admin/gallery/events', {
        name: newName, slug: newSlug, description: newDesc,
      });
      setNewName(''); setNewSlug(''); setNewDesc('');
      setCreating(false);
      fetchEvents();
    } catch { alert('Failed to create event'); }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await api.patch(`/home/admin/gallery/events/${id}`, { isActive: !current });
    fetchEvents();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and ALL its photos? This cannot be undone.`)) return;
    await api.delete(`/home/admin/gallery/events/${id}`);
    fetchEvents();
  };

  const handleZipUpload = (eventId: string) => {
    activeUploadId.current = eventId;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file    = e.target.files?.[0];
    const eventId = activeUploadId.current;
    if (!file || !eventId) return;

    setUploadingId(eventId);
    setUploadProgress(`Uploading ${(file.size / 1024 / 1024).toFixed(1)}MB to server...`);
    setUploadPct(0);

    const form = new FormData();
    form.append('file', file);

    try {
      // Use axios directly with a long timeout + upload progress tracking
      const token =
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') || '';

      await axios.post(
        `${API}/home/admin/gallery/events/${eventId}/upload`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          timeout: 60 * 60 * 1000, // 30 minutes — covers very large ZIPs
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadPct(pct);
              if (pct < 100) {
                setUploadProgress(`Uploading to server: ${pct}%`);
              } else {
                setUploadProgress('Upload complete — extracting images...');
                // Start polling now that the file is on the server
                startPolling(eventId);
              }
            }
          },
        },
      );
    } catch (err: any) {
      // If response came back normally (not a timeout) show the message
      if (err?.response?.data?.message) {
        setUploadProgress(`❌ ${err.response.data.message}`);
      } else if (err.code === 'ECONNABORTED') {
        // Timeout — but server is still processing, start polling
        setUploadProgress('Server is processing images...');
        startPolling(eventId);
      } else {
        setUploadProgress(`❌ ${err.message ?? 'Upload failed'}`);
        setTimeout(() => { setUploadProgress(''); setUploadingId(null); setUploadPct(0); }, 4000);
      }
    }

    e.target.value = '';
  };

  const statusColor = (s: string) =>
    ({ complete: '#16a34a', processing: '#d97706', failed: '#dc2626', pending: '#6b7280' }[s] ?? '#6b7280');

  return (
    <div style={{ padding: '48px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', maxWidth: 900 }}>
      <input ref={fileInputRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={handleFileChange} />

      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 8px' }}>
        Home / Gallery
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0 }}>Gallery Events</h1>
        <button onClick={() => setCreating(true)}
          style={{ padding: '10px 24px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          + New Event
        </button>
      </div>

      {creating && (
        <div style={{ border: '1px solid rgba(0,0,0,0.15)', padding: 32, marginBottom: 32, background: '#fafafa' }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 24px' }}>Create Gallery Event</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Event Name *</label>
              <input value={newName}
                onChange={e => {
                  setNewName(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                }}
                placeholder="e.g. The Daffodil"
                style={{ width: '100%', height: 44, border: '1px solid rgba(0,0,0,0.2)', padding: '0 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Slug (auto-generated)</label>
              <input value={newSlug} onChange={e => setNewSlug(e.target.value)}
                placeholder="the-daffodil"
                style={{ width: '100%', height: 44, border: '1px solid rgba(0,0,0,0.2)', padding: '0 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace' }} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Description (optional)</label>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="e.g. 2024 Nairobi Daffodil Festival"
              style={{ width: '100%', height: 44, border: '1px solid rgba(0,0,0,0.2)', padding: '0 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleCreate}
              style={{ padding: '10px 28px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Create Event
            </button>
            <button onClick={() => setCreating(false)}
              style={{ padding: '10px 28px', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: 14 }}>Loading...</p>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(0,0,0,0.15)' }}>
          <p style={{ fontSize: 15, margin: '0 0 8px' }}>No gallery events yet</p>
          <p style={{ fontSize: 13 }}>Create an event above, then upload a ZIP file to populate it with photos.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
          {events.map((ev, i) => (
            <div key={ev._id} style={{
              padding: '24px 28px',
              borderBottom: i < events.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              background: uploadingId === ev._id ? '#fffbeb' : '#fff',
              transition: 'background 0.3s',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{ev.name}</h4>
                  <span style={{
                    fontSize: 11, color: statusColor(ev.uploadStatus),
                    background: `${statusColor(ev.uploadStatus)}18`,
                    padding: '2px 10px', borderRadius: 12, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {ev.uploadStatus}
                  </span>
                  {!ev.isActive && (
                    <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 10px', borderRadius: 12 }}>
                      Hidden
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: 0 }}>
                  slug: {ev.slug} · {ev.imageCount} photos{ev.description && ` · ${ev.description}`}
                </p>

                {/* Upload progress */}
                {uploadingId === ev._id && (
                  <div style={{ marginTop: 10 }}>
                    {uploadPct > 0 && uploadPct < 100 && (
                      <div style={{ width: '100%', maxWidth: 400, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, marginBottom: 6 }}>
                        <div style={{ width: `${uploadPct}%`, height: '100%', background: '#000', borderRadius: 2, transition: 'width 0.3s' }} />
                      </div>
                    )}
                    <p style={{ fontSize: 13, color: uploadProgress.startsWith('✅') ? '#16a34a' : uploadProgress.startsWith('❌') ? '#dc2626' : '#d97706', margin: 0, fontWeight: 500 }}>
                      {uploadProgress}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => handleZipUpload(ev._id)}
                  disabled={!!uploadingId}
                  style={{ padding: '8px 18px', background: '#000', color: '#fff', border: 'none', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: uploadingId ? 'wait' : 'pointer', opacity: uploadingId ? 0.5 : 1 }}>
                  {uploadingId === ev._id ? 'Uploading...' : '↑ Upload ZIP'}
                </button>
                <button
                  onClick={() => handleToggleActive(ev._id, ev.isActive)}
                  disabled={!!uploadingId}
                  style={{ padding: '8px 18px', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  {ev.isActive ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(ev._id, ev.name)}
                  disabled={!!uploadingId}
                  style={{ padding: '8px 18px', background: 'none', border: '1px solid #dc2626', color: '#dc2626', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

