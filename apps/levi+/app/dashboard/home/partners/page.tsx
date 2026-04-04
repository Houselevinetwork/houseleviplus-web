'use client';

import { useEffect, useState, useRef } from 'react';
import api from '../../../lib/utils/api';

interface Partner { _id: string; name: string; websiteUrl: string; logoUrl: string; isActive: boolean; }

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm]         = useState<Record<string, string>>({});
  const [editing, setEditing]   = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch_ = async () => {
    try {
      const { data } = await api.get('/home/partners');
      setPartners(data?.data ?? []);
    } catch (e: any) { console.error(e?.response?.status, e?.message); }
  };

  useEffect(() => { fetch_(); }, []);

  const save = async () => {
    try {
      let id = editing;
      if (editing) {
        await api.patch(`/home/admin/partners/${editing}`, form);
      } else {
        const { data } = await api.post('/home/admin/partners', form);
        id = data?._id;
      }
      if (id && fileRef.current?.files?.[0]) {
        const fd = new FormData();
        fd.append('file', fileRef.current.files[0]);
        await api.post(`/home/admin/partners/${id}/logo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setForm({}); setEditing(null); setCreating(false); fetch_();
    } catch (e: any) { alert(e?.response?.data?.message ?? 'Save failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete partner?')) return;
    await api.delete(`/home/admin/partners/${id}`);
    fetch_();
  };

  return (
    <div style={{ padding: '48px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', maxWidth: 900 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 8px' }}>Home / Partners</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0 }}>Partners</h1>
        <button onClick={() => { setForm({}); setEditing(null); setCreating(true); }}
          style={{ padding: '10px 24px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          + Add Partner
        </button>
      </div>

      {creating && (
        <div style={{ border: '1px solid rgba(0,0,0,0.15)', padding: 32, marginBottom: 32, background: '#fafafa' }}>
          <h3 style={{ margin: '0 0 24px', fontWeight: 500 }}>{editing ? 'Edit' : 'New'} Partner</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {['name', 'websiteUrl'].map(k => (
              <div key={k}>
                <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  {k === 'name' ? 'Partner Name *' : 'Website URL'}
                </label>
                <input value={form[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  style={{ width: '100%', height: 44, border: '1px solid rgba(0,0,0,0.2)', padding: '0 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Logo Image</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ fontSize: 14 }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={save} style={{ padding: '10px 28px', background: '#000', color: '#fff', border: 'none', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Save</button>
            <button onClick={() => { setCreating(false); setEditing(null); setForm({}); }}
              style={{ padding: '10px 28px', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
        {partners.map(p => (
          <div key={p._id} style={{ border: '1px solid rgba(0,0,0,0.1)', padding: 20, textAlign: 'center' }}>
            {p.logoUrl
              ? <img src={p.logoUrl} alt={p.name} style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain', marginBottom: 12 }} />
              : <div style={{ height: 60, background: '#f0f0f0', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'rgba(0,0,0,0.3)' }}>No logo</div>}
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 12px' }}>{p.name}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setForm({ name: p.name, websiteUrl: p.websiteUrl }); setEditing(p._id); setCreating(true); }}
                style={{ flex: 1, padding: '6px 0', background: 'none', border: '1px solid rgba(0,0,0,0.2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => del(p._id)}
                style={{ flex: 1, padding: '6px 0', background: 'none', border: '1px solid #dc2626', color: '#dc2626', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
