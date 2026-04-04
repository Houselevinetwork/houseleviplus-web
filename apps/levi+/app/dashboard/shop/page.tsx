'use client';

/**
 * Location: apps/levi+/app/dashboard/shop/page.tsx
 *
 * Features:
 * - Product modal: name, image, category, price, sale price, description, stock, visible, isFeatured
 * - isFeatured star toggle on every product card (one click → Best Sellers row)
 * - Editorial banner upload (OLD MONEY · HOUSELEVI+ OFFICIAL strip)
 * - Category rows with add product per-category
 * - Products table with Best Seller column
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────
interface Product {
  id: string; name: string; original: number; sale: number | null;
  onSale: boolean; image: string | null; category: string;
  stock: number; visible: boolean; isFeatured: boolean;
  description: string;
}
interface HeroConfig      { type: 'image'|'video'; url: string; headline: string; }
interface EditorialConfig { url: string; headline: string; }
interface Announcement    { id: string; text: string; active: boolean; }
interface Category        { id: string; name: string; slug: string; }

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Products',            slug: 'all'                },
  { id: 'c1',  name: "Levi's Old Money Closet", slug: 'old-money-closet'   },
  { id: 'c2',  name: 'Aviation Gear',           slug: 'aviation-gear'      },
  { id: 'c3',  name: 'Scale Collectibles',      slug: 'scale-collectibles' },
  { id: 'c4',  name: 'Host Merch',              slug: 'host-merch'         },
  { id: 'c5',  name: 'Book Club',               slug: 'book-club'          },
  { id: 'c6',  name: 'HL Merch',                slug: 'hl-merch'           },
  { id: 'c7',  name: 'Partner Brands',          slug: 'partner-brands'     },
  { id: 'c8',  name: 'Car Collectibles',        slug: 'car-collectibles'   },
];

// ── API ────────────────────────────────────────────────────────
const API_BASE   = process.env.NEXT_PUBLIC_API_URL ?? '';
const getToken   = () => typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL not set in .env.local');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(options?.headers ?? {}) },
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ message: `${res.status}` })) as any; throw new Error(e.message ?? String(res.status)); }
  return res.json() as Promise<T>;
}

async function uploadToR2(file: File, folder: string): Promise<string> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL not set');
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/shop/${folder}/upload`, {
    method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})) as any; throw new Error(e.message ?? 'Upload failed'); }
  const body = await res.json() as { url: string };
  return body.url;
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  label:    { fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#999', display: 'block', marginBottom: 6 },
  input:    { width: '100%', padding: '11px 14px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '11px 14px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 90 },
  mHead:    { padding: '18px 24px', borderBottom: '1px solid #eeebe6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mTitle:   { fontFamily: 'Arial Black, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: '0.06em', color: '#111', textTransform: 'uppercase' as const },
  secTitle: { fontFamily: 'Arial Black, sans-serif', fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#111' },
  card:     { background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, marginBottom: 20 },
  cardHead: { padding: '14px 20px', borderBottom: '1px solid #eeebe6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
};

// ── Micro components ───────────────────────────────────────────
const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const StarIcon  = ({ filled }: { filled: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke={filled ? '#f59e0b' : '#d1d5db'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const UpIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const SpinIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: on ? '#1b3d7b' : '#d8d4cc', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s' }} />
    </button>
  );
}

function Skeleton({ width = '100%', height = 16 }: { width?: number|string; height?: number }) {
  return <div style={{ width, height, borderRadius: 2, background: 'linear-gradient(90deg,#f4f2ef 0%,#eeebe6 50%,#f4f2ef 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

function DropZone({ preview, type, onFile, dark = false }: { preview: string|null; type?: 'image'|'video'; onFile: (f: File) => void; dark?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => ref.current?.click()} style={{ width: '100%', height: dark ? 200 : 160, background: dark ? '#0f1923' : '#f8f6f2', border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.12)' : '#d8d4cc'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
      {preview
        ? type === 'video'
          ? <video src={preview} style={{ width:'100%',height:'100%',objectFit:'cover' }} autoPlay muted loop />
          : <img src={preview} alt="preview" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
        : <div style={{ textAlign: 'center', color: dark ? 'rgba(255,255,255,0.3)' : '#bbb' }}>
            <div style={{ margin: '0 auto 8px', width: 'fit-content' }}><UpIcon /></div>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Click to upload</p>
          </div>
      }
      <input ref={ref} type="file" accept={dark ? 'image/*,video/*' : 'image/*'} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,22,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 560, borderRadius: 2, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function ModalFooter({ onCancel, onSave, saving, label = 'Save' }: { onCancel: () => void; onSave: () => void; saving?: boolean; label?: string }) {
  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid #eeebe6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button onClick={onCancel} style={{ padding: '10px 20px', background: 'none', border: '1px solid #d8d4cc', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', borderRadius: 1 }}>Cancel</button>
      <button onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: saving ? '#aaa' : '#0f1923', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Arial Black, sans-serif', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}>
        {saving && <SpinIcon />}{saving ? 'Saving...' : label}
      </button>
    </div>
  );
}

function InlineError({ msg }: { msg: string }) {
  return <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#a0291e', padding: '8px 12px', background: 'rgba(160,41,30,0.05)', borderRadius: 1, marginTop: 4 }}>{msg}</div>;
}

// ── Hero Modal ─────────────────────────────────────────────────
function HeroModal({ hero, onClose, onSave }: { hero: HeroConfig; onClose: () => void; onSave: (h: HeroConfig) => void }) {
  const [form, setForm]       = useState({ ...hero });
  const [preview, setPreview] = useState<string|null>(hero.url || null);
  const [file, setFile]       = useState<File|null>(null);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      let url = form.url;
      if (file) url = await uploadToR2(file, 'hero');
      const updated = { ...form, url };
      await apiFetch('/api/shop/hero', { method: 'PUT', body: JSON.stringify(updated) });
      onSave(updated); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal>
      <div style={S.mHead}>
        <div><div style={S.mTitle}>Edit Hero Banner</div><div style={{ fontFamily:'Arial,sans-serif',fontSize:10,color:'#999',marginTop:2 }}>Image or video · R2 storage</div></div>
        <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#999',fontSize:22 }}>×</button>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
        <DropZone preview={preview} type={form.type} dark onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)); setForm(v => ({ ...v, type: f.type.startsWith('video/') ? 'video' : 'image' })); }} />
        <div><label style={S.label}>Headline Text</label><input value={form.headline} onChange={e => setForm(v => ({ ...v, headline: e.target.value }))} style={S.input} /></div>
        {err && <InlineError msg={err} />}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} label="Publish Hero" />
    </Modal>
  );
}

// ── Editorial Modal ────────────────────────────────────────────
function EditorialModal({ editorial, onClose, onSave }: { editorial: EditorialConfig; onClose: () => void; onSave: (e: EditorialConfig) => void }) {
  const [form, setForm]       = useState({ ...editorial });
  const [preview, setPreview] = useState<string|null>(editorial.url || null);
  const [file, setFile]       = useState<File|null>(null);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      let url = form.url;
      if (file) url = await uploadToR2(file, 'editorial');
      const updated = { ...form, url };
      await apiFetch('/api/shop/editorial', { method: 'PUT', body: JSON.stringify(updated) });
      onSave(updated); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal>
      <div style={S.mHead}>
        <div><div style={S.mTitle}>Editorial Banner</div><div style={{ fontFamily:'Arial,sans-serif',fontSize:10,color:'#999',marginTop:2 }}>OLD MONEY · HOUSELEVI+ strip · R2</div></div>
        <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#999',fontSize:22 }}>×</button>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
        <DropZone preview={preview} dark onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)); }} />
        <div><label style={S.label}>Overlay Headline</label><input value={form.headline} onChange={e => setForm(v => ({ ...v, headline: e.target.value }))} placeholder="OLD MONEY HOUSELEVI+ OFFICIAL" style={S.input} /></div>
        {err && <InlineError msg={err} />}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} label="Publish Banner" />
    </Modal>
  );
}

// ── Announcement Modal ─────────────────────────────────────────
function AnnouncementModal({ items, onClose, onSave }: { items: Announcement[]; onClose: () => void; onSave: (a: Announcement[]) => void }) {
  const [list, setList] = useState<Announcement[]>(items);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setSaving(true); setErr('');
    try { await apiFetch('/api/shop/announcements', { method: 'PUT', body: JSON.stringify(list) }); onSave(list); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal>
      <div style={S.mHead}><div style={S.mTitle}>Announcement Bar</div><button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#999',fontSize:22 }}>×</button></div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:12, maxHeight:'55vh', overflowY:'auto' }}>
        {list.map(a => (
          <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Toggle on={a.active} onChange={() => setList(v => v.map(x => x.id === a.id ? { ...x, active: !x.active } : x))} />
            <input value={a.text} onChange={e => setList(v => v.map(x => x.id === a.id ? { ...x, text: e.target.value } : x))} style={{ ...S.input, flex:1, opacity: a.active ? 1 : 0.4 }} placeholder="Announcement text..." />
            <button onClick={() => setList(v => v.filter(x => x.id !== a.id))} style={{ background:'none',border:'none',cursor:'pointer',color:'#bbb',fontSize:18,padding:'0 4px' }}>×</button>
          </div>
        ))}
        {err && <InlineError msg={err} />}
        <button onClick={() => setList(v => [...v, { id: Date.now().toString(), text:'', active:true }])} style={{ display:'flex',alignItems:'center',gap:6,padding:'9px 0',background:'none',border:'none',cursor:'pointer',color:'#1b3d7b',fontFamily:'Arial,sans-serif',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase' }}>
          <PlusIcon /> Add announcement
        </button>
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} />
    </Modal>
  );
}

// ── Product Modal ──────────────────────────────────────────────
function ProductModal({ defaultSlug, onClose, onSave }: { defaultSlug: string; onClose: () => void; onSave: (p: Product) => void }) {
  const [form, setForm] = useState({
    name: '', description: '', price: '', salePrice: '', stock: '50',
    visible: true, isFeatured: false,
    category: defaultSlug === 'all' ? CATEGORIES[1].slug : defaultSlug,
  });
  const [preview, setPreview] = useState<string|null>(null);
  const [file, setFile]       = useState<File|null>(null);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const set = (k: string, v: string|boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Name required'); return; }
    if (!form.price)       { setErr('Price (KES) required'); return; }
    setSaving(true); setErr('');
    try {
      let imageUrl: string|undefined;
      if (file) imageUrl = await uploadToR2(file, 'products');
      const body = {
        name:        form.name,
        description: form.description,
        price:       Number(form.price),
        salePrice:   form.salePrice ? Number(form.salePrice) : undefined,
        onSale:      !!form.salePrice,
        category:    form.category,
        stock:       Number(form.stock),
        visible:     form.visible,
        isFeatured:  form.isFeatured,
        imageUrl,
      };
      const created = await apiFetch<Record<string,unknown>>('/api/commerce/admin/products', { method:'POST', body: JSON.stringify(body) });
      onSave({
        id:          String((created as any)._id ?? (created as any).id ?? Date.now()),
        name:        form.name,
        description: form.description,
        original:    Number(form.price),
        sale:        form.salePrice ? Number(form.salePrice) : null,
        onSale:      !!form.salePrice,
        image:       imageUrl ?? null,
        category:    form.category,
        stock:       Number(form.stock),
        visible:     form.visible,
        isFeatured:  form.isFeatured,
      });
      onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal>
      <div style={S.mHead}>
        <div><div style={S.mTitle}>Add Product</div><div style={{ fontFamily:'Arial,sans-serif',fontSize:10,color:'#1b3d7b',marginTop:2 }}>MongoDB · R2 storage</div></div>
        <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#999',fontSize:22 }}>×</button>
      </div>
      <div style={{ padding:24, display:'flex', flexDirection:'column', gap:14, maxHeight:'70vh', overflowY:'auto' }}>

        <div><label style={S.label}>Product Image</label><DropZone preview={preview} onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)); }} /></div>

        <div>
          <label style={S.label}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...S.input, appearance:'none' as const }}>
            {CATEGORIES.filter(c => c.slug !== 'all').map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div><label style={S.label}>Product Name</label><input placeholder="Levi's Old Money Navy Blazer" value={form.name} onChange={e => set('name', e.target.value)} style={S.input} /></div>

        {/* ── Description (new field) ── */}
        <div>
          <label style={S.label}>Description <span style={{ fontWeight:400, opacity:0.6 }}>(optional)</span></label>
          <textarea placeholder="A timeless navy blazer crafted from premium wool blend..." value={form.description} onChange={e => set('description', e.target.value)} style={S.textarea} rows={3} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div><label style={S.label}>Price (KES)</label><input type="number" placeholder="12500" value={form.price} onChange={e => set('price', e.target.value)} style={S.input} /></div>
          <div><label style={S.label}>Sale Price (optional)</label><input type="number" placeholder="9800" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} style={S.input} /></div>
        </div>

        <div><label style={S.label}>Stock</label><input type="number" placeholder="50" value={form.stock} onChange={e => set('stock', e.target.value)} style={S.input} /></div>

        {/* Toggles */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, paddingTop:4 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <label style={{ ...S.label, marginBottom:2 }}>Visible on Web &amp; Mobile</label>
              <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#bbb' }}>Shows in shop and all-products pages</div>
            </div>
            <Toggle on={form.visible} onChange={() => set('visible', !form.visible)} />
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <label style={{ ...S.label, marginBottom:2, display:'flex', alignItems:'center', gap:6 }}><StarIcon filled={form.isFeatured} /> Best Seller / Featured</label>
              <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#bbb' }}>Appears in Best Sellers row on the shop page</div>
            </div>
            <Toggle on={form.isFeatured} onChange={() => set('isFeatured', !form.isFeatured)} />
          </div>
        </div>

        {err && <InlineError msg={err} />}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} label="Save Product" />
    </Modal>
  );
}

// ── Product Card (admin) ───────────────────────────────────────
function ProductCard({ product, onToggleFeatured, onEdit }: { product: Product; onToggleFeatured: () => void; onEdit: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ flexShrink:0, width:160 }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div onClick={onEdit} style={{ width:160, height:160, background:'#f4f2ef', border:`1px solid ${hovered ? '#1b3d7b' : '#eeebe6'}`, borderRadius:1, overflow:'hidden', position:'relative', transition:'border-color 0.15s', cursor:'pointer' }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
        }
        {product.onSale && <div style={{ position:'absolute', bottom:8, right:8, background:'#DC2626', padding:'3px 7px', color:'#fff', fontFamily:'Arial,sans-serif', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase' }}>Sale</div>}
        <div style={{ position:'absolute', inset:0, background:'rgba(27,61,123,0.82)', display:'flex', alignItems:'center', justifyContent:'center', opacity: hovered ? 1 : 0, transition:'opacity 0.15s' }}>
          <div style={{ textAlign:'center', color:'#fff' }}><EditIcon /><p style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4 }}>Edit</p></div>
        </div>
      </div>
      <div style={{ paddingTop:8 }}>
        <div style={{ fontFamily:'Arial,sans-serif', fontSize:11, color:'#111', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160, marginBottom:4 }}>{product.name}</div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          {product.sale !== null
            ? <><span style={{ fontSize:10, color:'#bbb', textDecoration:'line-through' }}>KSh {product.original.toLocaleString()}</span><span style={{ fontSize:11, color:'#111', fontWeight:600 }}>KSh {product.sale.toLocaleString()}</span></>
            : <span style={{ fontSize:11, color:'#111', fontWeight:600 }}>KSh {product.original.toLocaleString()}</span>
          }
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          <span style={{ fontSize:8, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 6px', borderRadius:2, background: product.visible ? 'rgba(46,204,113,0.1)' : 'rgba(160,41,30,0.08)', color: product.visible ? '#2ecc71' : '#a0291e' }}>{product.visible ? 'Live' : 'Hidden'}</span>
          <button onClick={onToggleFeatured} title={product.isFeatured ? 'Remove from Best Sellers' : 'Add to Best Sellers'} style={{ display:'flex', alignItems:'center', gap:3, fontSize:8, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 6px', borderRadius:2, background: product.isFeatured ? 'rgba(245,158,11,0.12)' : '#f8f6f2', color: product.isFeatured ? '#f59e0b' : '#bbb', border:`1px solid ${product.isFeatured ? 'rgba(245,158,11,0.3)' : '#eeebe6'}`, cursor:'pointer' }}>
            <StarIcon filled={product.isFeatured} />{product.isFeatured ? 'Featured' : 'Feature'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProductBtn({ onClick }: { onClick: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ flexShrink:0, width:160, height:160, background: h ? 'rgba(27,61,123,0.04)' : '#f8f6f2', border:`1.5px dashed ${h ? '#1b3d7b' : '#d8d4cc'}`, borderRadius:1, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.15s' }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background:'#0f1923', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><PlusIcon /></div>
      <span style={{ fontFamily:'Arial,sans-serif', fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:'#999' }}>Add Product</span>
    </button>
  );
}

function CategoryRow({ cat, products, onAdd, onToggleFeatured }: { cat: Category; products: Product[]; onAdd: () => void; onToggleFeatured: (id: string, val: boolean) => void }) {
  return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <div>
          <div style={S.secTitle}>{cat.name}</div>
          <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#999', marginTop:2 }}>{products.length} product{products.length !== 1 ? 's' : ''}{cat.slug !== 'all' ? ` · /${cat.slug}` : ''}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:16, overflowX:'auto', padding:20, scrollbarWidth:'none' }}>
        {products.length === 0 && <div style={{ display:'flex', alignItems:'center', paddingRight:12, fontFamily:'Arial,sans-serif', fontSize:11, color:'#bbb', fontStyle:'italic', whiteSpace:'nowrap' }}>No products yet</div>}
        {products.map(p => <ProductCard key={p.id} product={p} onEdit={() => {}} onToggleFeatured={() => onToggleFeatured(p.id, !p.isFeatured)} />)}
        <AddProductBtn onClick={onAdd} />
      </div>
    </div>
  );
}

function SetupBanner() {
  return (
    <div style={{ margin:'0 0 20px', padding:'16px 20px', background:'rgba(27,61,123,0.05)', border:'1px solid rgba(27,61,123,0.2)', borderRadius:2 }}>
      <div style={{ fontFamily:'Arial Black,sans-serif', fontSize:11, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', color:'#1b3d7b', marginBottom:6 }}>⚠ API not configured</div>
      <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#555', lineHeight:1.6 }}>
        Add to <code style={{ background:'#f0f0f0', padding:'1px 5px', borderRadius:2, fontSize:11 }}>apps/levi+/.env.local</code>:<br/>
        <code style={{ background:'#f0f0f0', padding:'4px 8px', borderRadius:2, fontSize:11, display:'inline-block', marginTop:4 }}>NEXT_PUBLIC_API_URL=http://localhost:3001</code>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function AdminShopPage() {
  const [hero, setHero]           = useState<HeroConfig>({ type:'image', url:'', headline:'HOUSELEVI+' });
  const [editorial, setEditorial] = useState<EditorialConfig>({ url:'', headline:'OLD MONEY HOUSELEVI+ OFFICIAL' });
  const [ann, setAnn]             = useState<Announcement[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);

  const [heroModal, setHeroModal]             = useState(false);
  const [editorialModal, setEditorialModal]   = useState(false);
  const [annModal, setAnnModal]               = useState(false);
  const [addModal, setAddModal]               = useState<string|null>(null);
  const [activeTab, setActiveTab]             = useState<'template'|'products'|'orders'>('template');
  const [tableCat, setTableCat]               = useState('all');
  const [loading, setLoading]                 = useState(true);
  const [loadErr, setLoadErr]                 = useState('');
  const apiMissing                            = !API_BASE;

  const fetchAll = useCallback(async () => {
    if (apiMissing) { setLoading(false); return; }
    setLoading(true); setLoadErr('');
    try {
      const [heroData, annData, editData, prodData] = await Promise.all([
        apiFetch<HeroConfig>('/api/shop/hero').catch(() => ({ type:'image' as const, url:'', headline:'HOUSELEVI+' })),
        apiFetch<Announcement[]>('/api/shop/announcements').catch(() => []),
        apiFetch<EditorialConfig>('/api/shop/editorial').catch(() => ({ url:'', headline:'OLD MONEY HOUSELEVI+ OFFICIAL' })),
        apiFetch<{ data: any[] }>('/api/commerce/admin/products?limit=500'),
      ]);
      setHero(heroData);
      setAnn(Array.isArray(annData) ? annData : []);
      setEditorial(editData);
      setProducts((prodData.data ?? []).map((p: any) => ({
        id:          String(p._id ?? p.id ?? Date.now()),
        name:        String(p.title ?? p.name ?? ''),
        description: String(p.description ?? ''),
        original:    Number(p.basePrice ?? p.price ?? 0),
        sale:        p.salePrice != null ? Number(p.salePrice) : null,
        onSale:      Boolean(p.onSale),
        image:       p.images?.[0]?.url ?? p.imageUrl ?? null,
        category:    String(p.category ?? ''),
        stock:       Number(p.totalStock ?? p.stock ?? 0),
        visible:     Boolean(p.visible ?? true),
        isFeatured:  Boolean(p.isFeatured),
      })));
    } catch (e) { setLoadErr(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, [apiMissing]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addProduct = (p: Product) => setProducts(v => [...v, p]);

  const toggleFeatured = async (id: string, val: boolean) => {
    setProducts(v => v.map(p => p.id === id ? { ...p, isFeatured: val } : p));
    try { await apiFetch(`/api/commerce/admin/products/${id}`, { method:'PATCH', body: JSON.stringify({ isFeatured: val }) }); }
    catch { setProducts(v => v.map(p => p.id === id ? { ...p, isFeatured: !val } : p)); }
  };

  const catProducts   = (slug: string) => slug === 'all' ? products : products.filter(p => p.category === slug);
  const tableProducts = catProducts(tableCat);
  const featuredCount = products.filter(p => p.isFeatured).length;

  const metrics = [
    { label:'Total Products', value: products.length,                          sub:`${products.filter(p => p.visible).length} live` },
    { label:'Best Sellers',   value: featuredCount,                             sub:'Featured on shop page' },
    { label:'Low Stock',      value: products.filter(p => p.stock < 5).length, sub:'Need restocking', warn: true },
    { label:'On Sale',        value: products.filter(p => p.onSale).length,    sub:'Discounted now' },
  ];

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100% { background-position: -200% 0; } 50% { background-position: 200% 0; } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Arial Black,sans-serif', fontSize:18, fontWeight:900, color:'#111', letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:4 }}>Shop Manager</h1>
          <p style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#999', letterSpacing:'0.1em', textTransform:'uppercase' }}>Changes go live on web &amp; mobile instantly</p>
        </div>
        <button onClick={() => setAddModal('old-money-closet')} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', background:'#0f1923', border:'none', cursor:'pointer', fontFamily:'Arial Black,sans-serif', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#fff', borderRadius:1 }}>
          <PlusIcon /> Add Product
        </button>
      </div>

      {apiMissing && <SetupBanner />}

      {loadErr && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', background:'rgba(160,41,30,0.05)', border:'1px solid rgba(160,41,30,0.15)', borderRadius:2, marginBottom:20 }}>
          <span style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#a0291e' }}>{loadErr}</span>
          <button onClick={fetchAll} style={{ padding:'6px 14px', background:'#a0291e', border:'none', cursor:'pointer', fontFamily:'Arial,sans-serif', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#fff', borderRadius:1 }}>Retry</button>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background:'#fff', border:'1px solid #eeebe6', borderRadius:2, padding:'16px 18px' }}>
            <div style={{ fontFamily:'Arial,sans-serif', fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#999', marginBottom:8 }}>{m.label}</div>
            {loading ? <Skeleton width={40} height={28} /> : <div style={{ fontFamily:'Arial Black,sans-serif', fontSize:26, fontWeight:900, color:(m as any).warn && m.value > 0 ? '#a0291e' : '#111', letterSpacing:'-0.02em', marginBottom:2 }}>{m.value}</div>}
            <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#bbb', marginTop:2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #eeebe6', marginBottom:24 }}>
        {(['template','products','orders'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding:'11px 18px', fontFamily:'Arial,sans-serif', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color: activeTab===t ? '#111' : '#999', background:'none', border:'none', borderBottom:`2px solid ${activeTab===t ? '#1b3d7b' : 'transparent'}`, cursor:'pointer', position:'relative', top:1, fontWeight: activeTab===t ? 600 : 400 }}>
            {t === 'template' ? 'Page Template' : t}
          </button>
        ))}
      </div>

      {/* ── TEMPLATE TAB ─────────────────────────────────────────── */}
      {activeTab === 'template' && (
        <>
          {/* Announcement Bar */}
          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.secTitle}>Announcement Bar</div>
              <button onClick={() => setAnnModal(true)} style={{ padding:'6px 14px', background:'none', border:'1px solid #d8d4cc', cursor:'pointer', fontFamily:'Arial,sans-serif', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#666', borderRadius:1 }}>Edit</button>
            </div>
            <div style={{ padding:'12px 20px', background:'#121212', display:'flex', alignItems:'center', justifyContent:'center', minHeight:44 }}>
              {loading ? <Skeleton width={300} height={12} />
                : ann.filter(a => a.active).length === 0
                  ? <span style={{ fontFamily:'Arial,sans-serif', fontSize:11, color:'rgba(255,255,255,0.2)', letterSpacing:'0.08em' }}>No announcements — click Edit</span>
                  : <span style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#fff', letterSpacing:'0.06em' }}>{ann.filter(a => a.active)[0]?.text}</span>
              }
            </div>
          </div>

          {/* Hero Banner */}
          <div style={S.card}>
            <div style={S.cardHead}>
              <div><div style={S.secTitle}>Hero Banner</div><div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#999', marginTop:2 }}>Full-width image or video · R2</div></div>
              <button onClick={() => setHeroModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#0f1923', border:'none', cursor:'pointer', fontFamily:'Arial,sans-serif', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#fff', borderRadius:1 }}>
                <EditIcon /> Edit
              </button>
            </div>
            <div onClick={() => setHeroModal(true)} style={{ position:'relative', margin:20, height:180, background:'#0f1923', borderRadius:1, overflow:'hidden', cursor:'pointer' }}>
              {loading ? <Skeleton width="100%" height={180} />
                : hero.url
                  ? hero.type === 'video' ? <video src={hero.url} style={{ width:'100%',height:'100%',objectFit:'cover' }} autoPlay muted loop /> : <img src={hero.url} alt="hero" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                  : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8 }}>
                      <div style={{ fontFamily:'serif', fontSize:28, color:'rgba(255,255,255,0.15)', letterSpacing:'0.08em' }}>{hero.headline}</div>
                      <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.12em', textTransform:'uppercase' }}>Click to add hero image or video</div>
                    </div>
              }
            </div>
          </div>

          {/* Editorial Banner */}
          <div style={S.card}>
            <div style={S.cardHead}>
              <div><div style={S.secTitle}>Editorial Banner</div><div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#999', marginTop:2 }}>OLD MONEY · HOUSELEVI+ OFFICIAL strip · R2</div></div>
              <button onClick={() => setEditorialModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#0f1923', border:'none', cursor:'pointer', fontFamily:'Arial,sans-serif', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#fff', borderRadius:1 }}>
                <EditIcon /> Edit
              </button>
            </div>
            <div onClick={() => setEditorialModal(true)} style={{ position:'relative', margin:20, height:120, background:'#111', borderRadius:1, overflow:'hidden', cursor:'pointer' }}>
              {editorial.url
                ? <img src={editorial.url} alt="editorial" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:6 }}>
                    <div style={{ fontFamily:'serif', fontSize:16, color:'rgba(255,255,255,0.3)', letterSpacing:'0.12em', textTransform:'uppercase' }}>OLD MONEY · HOUSELEVI+ OFFICIAL</div>
                    <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Click to upload banner image</div>
                  </div>
              }
            </div>
          </div>

          {/* Best Sellers preview row */}
          <div style={{ ...S.card, borderLeft:'3px solid #f59e0b' }}>
            <div style={S.cardHead}>
              <div>
                <div style={{ ...S.secTitle, display:'flex', alignItems:'center', gap:8 }}><StarIcon filled /> Best Sellers Row</div>
                <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#999', marginTop:2 }}>{featuredCount} product{featuredCount !== 1 ? 's' : ''} featured · Toggle ★ on any product to add/remove</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:16, overflowX:'auto', padding:20, scrollbarWidth:'none' }}>
              {loading
                ? Array.from({ length:4 }).map((_,i) => <div key={i} style={{ flexShrink:0,width:160 }}><Skeleton width={160} height={160} /></div>)
                : products.filter(p => p.isFeatured).length === 0
                  ? <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#bbb', fontStyle:'italic', padding:'8px 0' }}>No featured products — click ★ on any card below</div>
                  : products.filter(p => p.isFeatured).map(p => (
                    <ProductCard key={p.id} product={p} onEdit={() => {}} onToggleFeatured={() => toggleFeatured(p.id, false)} />
                  ))
              }
            </div>
          </div>

          {/* Category rows */}
          {loading
            ? Array.from({ length:3 }).map((_,i) => <div key={i} style={{ ...S.card, padding:20 }}><Skeleton height={14} width={200} /><div style={{ display:'flex', gap:16, marginTop:20 }}>{Array.from({length:4}).map((_,j) => <Skeleton key={j} width={160} height={160} />)}</div></div>)
            : CATEGORIES.map(cat => (
                <CategoryRow key={cat.id} cat={cat} products={catProducts(cat.slug)}
                  onAdd={() => setAddModal(cat.slug === 'all' ? 'old-money-closet' : cat.slug)}
                  onToggleFeatured={toggleFeatured}
                />
              ))
          }
        </>
      )}

      {/* ── PRODUCTS TABLE TAB ───────────────────────────────────── */}
      {activeTab === 'products' && (
        <div style={{ background:'#fff', border:'1px solid #eeebe6', borderRadius:2 }}>
          <div style={{ display:'flex', overflowX:'auto', borderBottom:'1px solid #eeebe6', scrollbarWidth:'none' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setTableCat(c.slug)} style={{ flexShrink:0, padding:'10px 16px', fontFamily:'Arial,sans-serif', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color: tableCat===c.slug ? '#111' : '#999', background:'none', border:'none', borderBottom:`2px solid ${tableCat===c.slug ? '#1b3d7b' : 'transparent'}`, cursor:'pointer', whiteSpace:'nowrap', position:'relative', top:1, fontWeight: tableCat===c.slug ? 600 : 400 }}>
                {c.name}
              </button>
            ))}
          </div>
          {loading ? <div style={{ padding:40, display:'flex', justifyContent:'center' }}><SpinIcon /></div> : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#f8f6f2' }}>
                {['#','Product','Category','Price','Stock','Best Seller','Status'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', fontFamily:'Arial,sans-serif', fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#999', textAlign:'left', borderBottom:'1px solid #eeebe6' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {tableProducts.length === 0
                  ? <tr><td colSpan={7} style={{ padding:48, textAlign:'center', fontFamily:'Arial,sans-serif', fontSize:12, color:'#bbb' }}>No products yet</td></tr>
                  : tableProducts.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom:'1px solid #f4f2ef' }}>
                      <td style={{ padding:'12px 16px', fontFamily:'Arial,sans-serif', fontSize:11, color:'#bbb' }}>{i+1}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', fontWeight:500 }}>{p.name}</div>
                        {p.description && <div style={{ fontFamily:'Arial,sans-serif', fontSize:10, color:'#bbb', marginTop:2, maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description}</div>}
                      </td>
                      <td style={{ padding:'12px 16px', fontFamily:'Arial,sans-serif', fontSize:11, color:'#999' }}>{CATEGORIES.find(c => c.slug === p.category)?.name ?? p.category}</td>
                      <td style={{ padding:'12px 16px', fontFamily:'Arial,sans-serif', fontSize:11, color:'#111' }}>{p.sale ? <><span style={{ textDecoration:'line-through', color:'#bbb', marginRight:6 }}>KSh {p.original.toLocaleString()}</span>KSh {p.sale.toLocaleString()}</> : `KSh ${p.original.toLocaleString()}`}</td>
                      <td style={{ padding:'12px 16px', fontFamily:'Arial,sans-serif', fontSize:11, color: p.stock < 5 ? '#a0291e' : '#111', fontWeight: p.stock < 5 ? 600 : 400 }}>{p.stock}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <button onClick={() => toggleFeatured(p.id, !p.isFeatured)} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:4 }}>
                          <StarIcon filled={p.isFeatured} /><span style={{ fontSize:10, color: p.isFeatured ? '#f59e0b' : '#bbb', letterSpacing:'0.08em' }}>{p.isFeatured ? 'Featured' : 'Add'}</span>
                        </button>
                      </td>
                      <td style={{ padding:'12px 16px' }}><span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', padding:'3px 7px', borderRadius:2, background: p.visible ? 'rgba(46,204,113,0.1)' : 'rgba(160,41,30,0.08)', color: p.visible ? '#2ecc71' : '#a0291e' }}>{p.visible ? 'Live' : 'Hidden'}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ───────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div style={{ background:'#fff', border:'1px solid #eeebe6', borderRadius:2, padding:48, textAlign:'center', color:'#bbb', fontFamily:'Arial,sans-serif', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase' }}>
          Orders module — coming next
        </div>
      )}

      {heroModal       && <HeroModal hero={hero} onClose={() => setHeroModal(false)} onSave={setHero} />}
      {editorialModal  && <EditorialModal editorial={editorial} onClose={() => setEditorialModal(false)} onSave={setEditorial} />}
      {annModal        && <AnnouncementModal items={ann} onClose={() => setAnnModal(false)} onSave={setAnn} />}
      {addModal        && <ProductModal defaultSlug={addModal} onClose={() => setAddModal(null)} onSave={p => { addProduct(p); setAddModal(null); }} />}
    </>
  );
}