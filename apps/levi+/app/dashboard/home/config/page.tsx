'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/utils/api';

export default function HomeConfigAdminPage() {
  const [form, setForm]       = useState<Record<string, any>>({});
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/home/admin/config')
      .then(({ data }) => { setForm(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    await api.put('/home/admin/config', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const F = (k: string, label: string, type = 'text', multi = false) => (
    <div key={k}>
      <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{label}</label>
      {multi
        ? <textarea value={form[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} rows={3}
            style={{ width: '100%', border: '1px solid rgba(0,0,0,0.2)', padding: '10px 14px', fontSize: 15, boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
        : <input type={type} value={form[k] ?? ''} onChange={e => setForm(p => ({ ...p, [k]: type === 'number' ? Number(e.target.value) : e.target.value }))}
            style={{ width: '100%', height: 48, border: '1px solid rgba(0,0,0,0.2)', padding: '0 16px', fontSize: 15, boxSizing: 'border-box', outline: 'none' }} />}
    </div>
  );

  if (loading) return <div style={{ padding: 60, fontSize: 14, color: 'rgba(0,0,0,0.4)' }}>Loading...</div>;

  return (
    <div style={{ padding: '48px 60px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', maxWidth: 700 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 8px' }}>Home / Config</p>
      <h1 style={{ fontSize: 32, fontWeight: 300, margin: '0 0 48px' }}>Site Configuration</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px', color: 'rgba(0,0,0,0.5)' }}>Hero Text</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {F('heroCaption', 'Caption (above title) e.g. "HL+ FACES"')}
            {F('heroTitle', 'Title e.g. "THE PEOPLES GALLERY"')}
          </div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px', color: 'rgba(0,0,0,0.5)' }}>Slideshow</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Hero Mode</label>
              <select value={form.heroMode ?? 'all'} onChange={e => setForm(p => ({ ...p, heroMode: e.target.value }))}
                style={{ width: '100%', height: 48, border: '1px solid rgba(0,0,0,0.2)', padding: '0 16px', fontSize: 15, background: '#fff', outline: 'none', cursor: 'pointer' }}>
                <option value="all">All Events (shuffle)</option>
                <option value="specific">Specific Event Only</option>
              </select>
            </div>
            {F('slideshowInterval', 'Slide Duration (ms)', 'number')}
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="kenBurns" checked={!!form.kenBurnsEffect}
              onChange={e => setForm(p => ({ ...p, kenBurnsEffect: e.target.checked }))}
              style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="kenBurns" style={{ fontSize: 14, cursor: 'pointer' }}>Enable Ken Burns zoom effect on hero images</label>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px', color: 'rgba(0,0,0,0.5)' }}>Quote Section</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {F('quote', 'Quote Text', 'text', true)}
            {F('quoteAuthor', 'Author')}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={save}
          style={{ padding: '14px 48px', background: '#000', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Save Changes
        </button>
        {saved && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Saved successfully</span>}
      </div>
    </div>
  );
}
