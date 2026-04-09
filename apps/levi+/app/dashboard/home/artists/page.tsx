'use client';

import { useEffect, useState, useRef } from 'react';
import api from '../../../lib/utils/api';

interface Artist { _id: string; name: string; role: string; bio: string; imageUrl: string; isActive: boolean; }

export default function ArtistsAdminPage() {
  const [artists, setArtists]   = useState<Artist[]>([]);
  const [form, setForm]         = useState<Record<string, string>>({});
  const [editing, setEditing]   = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch_ = async () => {
    try {
      const { data } = await api.get('/home/artists');
      setArtists(data?.data ?? []);
    } catch (e: any) { console.error(e?.response?.status, e?.message); }
  };

  useEffect(() => { fetch_(); }, []);

  const save = async () => {
    try {
      let id = editing;
      if (editing) {
        await api.patch(`/home/admin/artists/${editing}`, form);
      } else {
        const { data } = await api.post('/home/admin/artists', form);
        id = data?._id;
      }
      if (id && fileRef.current?.files?.[0]) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', fileRef.current.files[0]);
        await api.post(`/home/admin/artists/${id}/image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUploading(false);
      }
      setForm({}); setEditing(null); setCreating(false); fetch_();
    } catch (e: any) { setUploading(false); alert(e?.response?.data?.message ?? 'Save failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete artist?')) return;
    await api.delete(`/home/admin/artists/${id}`);
    fetch_();
  };

  const F = (k: string, label: string, multi = false) => (
    <div key={k}>
      <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
      {multi
        ? <textarea value={form[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} rows={3}
            style={{ width: '100%', border: '1px solid rgba(0,0,0,0.2)', padding: '10px 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
        : <input value={form[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
            style={{ width: '100%', height: 44, border: '1px solid rgba(0,0,0,0.2)', padding: '0 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />}
    </div>
  );

  return (
    <div style={{ padding: '48px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', maxWidth: 900 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 8px' }}>Home / Artists</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0 }}>Featured Artists</h1>
        <button onClick={() => { setForm({}); setEditing(null); setCreating(true); }}
          style={{ padding: '10px 24px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          + Add Artist
        </button>
      </div>

      {creating && (
        <div style={{ border: '1px solid rgba(0,0,0,0.15)', padding: 32, marginBottom: 32, background: '#fafafa' }}>
          <h3 style={{ margin: '0 0 24px', fontWeight: 500 }}>{editing ? 'Edit' : 'New'} Artist</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {F('name', 'Name *')} {F('role', 'Role / Genre')}
          </div>
          {F('bio', 'Bio', true)}
          <div style={{ marginTop: 16, marginBottom: 24 }}>
            <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Photo</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ fontSize: 14 }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={save} disabled={uploading}
              style={{ padding: '10px 28px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}>
              {uploading ? 'Uploading...' : 'Save'}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); setForm({}); }}
              style={{ padding: '10px 28px', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
        {artists.map(a => (
          <div key={a._id} style={{ border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {a.imageUrl
              ? <img src={a.imageUrl} alt={a.name} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: 200, background: '#f0f0f0' }} />}
            <div style={{ padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{a.name}</h4>
              {a.role && <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '0 0 12px' }}>{a.role}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setForm({ name: a.name, role: a.role, bio: a.bio }); setEditing(a._id); setCreating(true); }}
                  style={{ flex: 1, padding: '6px 0', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(a._id)}
                  style={{ flex: 1, padding: '6px 0', background: 'none', border: '1px solid #dc2626', color: '#dc2626', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
