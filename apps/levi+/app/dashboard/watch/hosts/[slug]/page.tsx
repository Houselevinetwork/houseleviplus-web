'use client';
/**
 * Location: apps/levi+/app/dashboard/watch/hosts/[slug]/page.tsx
 *
 * Admin host detail page — two panels:
 *   LEFT  : editable host profile (avatar, banner, bio, slug, active, sort)
 *   RIGHT : tabbed content by category — assign / unassign content items
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './host-detail.css';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Host {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

interface ContentItem {
  _id: string;
  title: string;
  type: string;
  thumbnailUrl?: string;
  posterUrl?:    string;
  mediaUrl?:     string;
  status: string;
  duration?: number;
  displayDuration?: string;
  isPremium?: boolean;
  isNew?: boolean;
  slug?: string;
  hostSlug?: string | null;   // which host this item is currently assigned to
}

interface HostDetail {
  host: Host;
  contentByCategory: Record<string, ContentItem[]>;
  totalCount: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Keys MUST match ContentType enum values in content.schema.ts exactly
const CATEGORY_META: Record<string, { label: string; Icon: () => React.ReactElement }> = {
  tv_episode: { label: 'Episodes',   Icon: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/></svg> },
  movie:      { label: 'Movies',     Icon: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" strokeLinecap="round"/></svg> },
  stage_play: { label: 'Stage Plays',Icon: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 20h20M6 20V10l6-6 6 6v10" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="14" width="6" height="6"/></svg> },
  podcast:    { label: 'Podcasts',   Icon: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" strokeLinecap="round"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round"/></svg> },
  reelfilm:   { label: 'Shorts',     Icon: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  minisode:   { label: 'Minisodes',  Icon: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg> },
  music:      { label: 'Music',      Icon: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
};

const ALL_TYPES = Object.keys(CATEGORY_META);

// ─── Inline style tokens (matches mood-tv admin CSS language) ──────────────

const S = {
  page:       { background: '#f4f2ef', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  topBar:     { background: '#fff', borderBottom: '1px solid #eeebe6', padding: '14px 28px',
                display: 'flex', alignItems: 'center', gap: 14 },
  backBtn:    { background: 'none', border: '1px solid #eeebe6', borderRadius: 2, padding: '6px 14px',
                fontSize: 12, cursor: 'pointer', color: '#0f1923', fontFamily: 'Arial, sans-serif' },
  layout:     { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, padding: '20px 28px',
                maxWidth: 1400 },
  card:       { background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, overflow: 'hidden' },
  cardHead:   { padding: '12px 16px', borderBottom: '1px solid #eeebe6', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:  { fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 11, fontWeight: 900,
                letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#0f1923' },
  cardBody:   { padding: 16 },
  label:      { display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4,
                textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input:      { width: '100%', padding: '8px 10px', border: '1px solid #d8d4cc', borderRadius: 2,
                fontSize: 13, fontFamily: 'Arial, sans-serif', color: '#0f1923',
                boxSizing: 'border-box' as const, outline: 'none' },
  textarea:   { width: '100%', padding: '8px 10px', border: '1px solid #d8d4cc', borderRadius: 2,
                fontSize: 13, fontFamily: 'Arial, sans-serif', color: '#0f1923', resize: 'vertical' as const,
                boxSizing: 'border-box' as const, outline: 'none', minHeight: 80 },
  saveBtn:    (busy: boolean) => ({
    background: busy ? '#8fa0b7' : '#1b3d7b', color: '#fff', border: 'none', borderRadius: 2,
    padding: '8px 20px', fontSize: 12, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
    fontFamily: 'Arial, sans-serif',
  }),
  toggle:     (on: boolean) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    fontSize: 12, color: on ? '#1b3d7b' : '#999', fontWeight: on ? 700 : 400,
  }),
  tab:        (active: boolean) => ({
    padding: '7px 14px', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: 12,
    fontWeight: active ? 700 : 400, fontFamily: 'Arial, sans-serif',
    background: active ? '#0f1923' : '#f4f2ef',
    color:      active ? '#f8f6f2' : '#666',
  }),
  contentCard: { border: '1px solid #eeebe6', borderRadius: 2, overflow: 'hidden', background: '#fafaf8',
                 display: 'flex', flexDirection: 'column' as const },
  badge:      (type: string) => ({
    display: 'inline-block', padding: '2px 6px', borderRadius: 2, fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase' as const, letterSpacing: '0.04em',
    background: type === 'ready' ? '#d4edda' : type === 'processing' ? '#fff3cd' : '#f8d7da',
    color:      type === 'ready' ? '#155724' : type === 'processing' ? '#856404' : '#721c24',
  }),
  unassignBtn:{ background: 'none', border: '1px solid #f5c6cb', borderRadius: 2, color: '#721c24',
                fontSize: 11, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' },
  assignBtn:  { background: '#1b3d7b', color: '#fff', border: 'none', borderRadius: 2,
                padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', gap: 6 },
  searchInput:{ width: '100%', padding: '8px 10px', border: '1px solid #d8d4cc', borderRadius: 2,
                fontSize: 13, fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' as const,
                outline: 'none' },
};

// ─── Auth helper ─────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── XHR upload with progress ────────────────────────────────────────────────

function xhrUpload(
  url: string,
  file: File,
  token: string | null,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd  = new FormData();
    const xhr = new XMLHttpRequest();
    fd.append('file', file);
    xhr.open('POST', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
    xhr.onload  = () => {
      try { const r = JSON.parse(xhr.responseText); resolve(r.url ?? r.data?.url ?? ''); }
      catch { reject(new Error('Upload response parse error')); }
    };
    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(fd);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE PANEL
// ═══════════════════════════════════════════════════════════════════════════

function ProfilePanel({ host, onSaved }: { host: Host; onSaved: (h: Host) => void }) {
  const [form,     setForm]     = useState({ ...host });
  const [busy,     setBusy]     = useState(false);
  const [msg,      setMsg]      = useState('');
  const [avPct,    setAvPct]    = useState<number | null>(null);
  const [bnPct,    setBnPct]    = useState<number | null>(null);
  const avRef = useRef<HTMLInputElement>(null);
  const bnRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  async function handleImageUpload(file: File, field: 'avatarUrl' | 'bannerUrl') {
    const token = localStorage.getItem('admin_token');
    const setP  = field === 'avatarUrl' ? setAvPct : setBnPct;
    setP(0);
    try {
      const url = await xhrUpload(
        `${API}/api/uploads/image?folder=hosts&assetType=${field === 'avatarUrl' ? 'profile' : 'banner'}&slug=${form.slug}`,
        file, token, setP,
      );
      const updated = { ...form, [field]: url };
      setForm(updated);
      // Auto-save so the URL is immediately persisted — no need to click "Save Profile"
      const res = await fetch(`${API}/api/content/admin/hosts/${host._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved = await res.json();
        onSaved(saved.data ?? saved);
        setMsg('✓ Image saved');
        setTimeout(() => setMsg(''), 2500);
      }
    } catch { setMsg('Image upload failed'); }
    finally { setTimeout(() => setP(null), 1200); }
  }

  async function save() {
    setBusy(true); setMsg('');
    try {
      const res = await fetch(`${API}/api/content/admin/hosts/${host._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      onSaved(updated.data ?? updated);
      setMsg('✓ Saved');
    } catch (e: any) { setMsg(`Error: ${e.message}`); }
    finally { setBusy(false); setTimeout(() => setMsg(''), 3000); }
  }

  return (
    <div style={S.card}>
      {/* Banner / hero */}
      <div
        onClick={() => bnRef.current?.click()}
        style={{
          position: 'relative', height: 140, overflow: 'hidden', cursor: 'pointer',
          background: form.bannerUrl ? 'none' : 'linear-gradient(135deg, #0f1923 0%, #1b3d7b 100%)',
        }}
        title="Click to upload banner"
      >
        {form.bannerUrl && (
          <img src={form.bannerUrl} alt="banner"
               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {/* Upload hint overlay */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', opacity: form.bannerUrl ? 0 : 0.6,
          transition: 'opacity 0.2s', background: 'rgba(0,0,0,0)',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = form.bannerUrl ? '0' : '0.6')}
        >
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                         background: 'rgba(0,0,0,0.45)', padding: '5px 12px', borderRadius: 2 }}>
            {form.bannerUrl ? '✎ CHANGE BANNER' : '+ UPLOAD BANNER'}
          </span>
        </div>
        {/* Avatar circle */}
        <div style={{
          position: 'absolute', bottom: -32, left: 16,
          width: 64, height: 64, borderRadius: '50%', border: '3px solid #fff',
          background: form.avatarUrl ? 'none' : '#1b3d7b', overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          {form.avatarUrl
            ? <img src={form.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                              height: '100%', color: '#fff', fontWeight: 900, fontSize: 20 }}>
                {form.name[0]}
              </span>
          }
        </div>
        {/* Hidden banner file input — triggered by clicking the whole banner div */}
        <input ref={bnRef} type="file" accept="image/*" style={{ display: 'none' }}
               onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'bannerUrl')}
               onClick={e => e.stopPropagation()} />
      </div>

      {/* Banner upload progress */}
      {bnPct !== null && (
        <div style={{ height: 3, background: '#eeebe6' }}>
          <div style={{ height: '100%', width: `${bnPct}%`, background: '#1b3d7b', transition: 'width 0.2s' }} />
        </div>
      )}

      {/* Offset for avatar overlap */}
      <div style={{ height: 36 }} />

      <div style={S.cardBody}>
        {/* Name */}
        <div style={{ marginBottom: 12 }}>
          <label style={S.label}>Name</label>
          <input style={S.input} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: 12 }}>
          <label style={S.label}>Slug</label>
          <input style={S.input} value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g,'-'))} />
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 12 }}>
          <label style={S.label}>Bio</label>
          <textarea style={S.textarea} value={form.bio ?? ''} rows={4}
                    onChange={e => set('bio', e.target.value)} />
        </div>

        {/* Avatar upload */}
        <div style={{ marginBottom: 12 }}>
          <label style={S.label}>Avatar Image</label>
          {form.avatarUrl && (
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.avatarUrl.split('/').pop()}
            </div>
          )}
          {avPct !== null && (
            <div style={{ height: 4, background: '#eeebe6', borderRadius: 2, marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${avPct}%`, background: '#1b3d7b',
                             borderRadius: 2, transition: 'width 0.2s' }} />
            </div>
          )}
          <input ref={avRef} type="file" accept="image/*" style={{ display: 'none' }}
                 onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatarUrl')} />
          <button style={{ ...S.backBtn, width: '100%', textAlign: 'center' }}
                  onClick={() => avRef.current?.click()}>
            {form.avatarUrl ? 'Replace Avatar' : 'Upload Avatar'}
          </button>
        </div>

        {/* Sort order */}
        <div style={{ marginBottom: 12 }}>
          <label style={S.label}>Sort Order</label>
          <input style={{ ...S.input, width: 80 }} type="number" value={form.sortOrder}
                 onChange={e => set('sortOrder', Number(e.target.value))} />
        </div>

        {/* Active toggle */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={S.toggle(form.isActive)}>
            <input type="checkbox" checked={form.isActive} style={{ display: 'none' }}
                   onChange={e => set('isActive', e.target.checked)} />
            <span style={{ width: 32, height: 18, borderRadius: 9,
                           background: form.isActive ? '#1b3d7b' : '#ccc',
                           display: 'inline-block', position: 'relative', transition: 'background 0.2s' }}>
              <span style={{ position: 'absolute', top: 2, left: form.isActive ? 16 : 2,
                              width: 14, height: 14, borderRadius: '50%', background: '#fff',
                              transition: 'left 0.2s' }} />
            </span>
            {form.isActive ? 'Active' : 'Inactive'}
          </label>
        </div>

        {/* Save */}
        <button style={S.saveBtn(busy)} disabled={busy} onClick={save}>
          {busy ? 'Saving…' : 'Save Profile'}
        </button>
        {msg && <div style={{ marginTop: 8, fontSize: 12,
                               color: msg.startsWith('✓') ? '#155724' : '#721c24' }}>{msg}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT GRID CARD
// ═══════════════════════════════════════════════════════════════════════════

function ContentCard({
  item, onUnassign, onStatusChange, onImagesChange, busy,
}: {
  item: ContentItem;
  onUnassign: () => void;
  onStatusChange: (newStatus: string) => void;
  onImagesChange: (posterUrl: string, thumbnailUrl: string) => void;
  busy?: boolean;
}) {
  const [statusBusy,  setStatusBusy]  = React.useState(false);
  const [imgError,    setImgError]    = React.useState(false);
  const [editImg,     setEditImg]     = React.useState(false);
  const [uploadPct,   setUploadPct]   = React.useState<number | null>(null);
  const [uploadErr,   setUploadErr]   = React.useState('');
  const posterRef   = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLInputElement>(null);

  // Best available image: prefer poster, fall back to backdrop/thumbnail
  const imgSrc = item.posterUrl || item.thumbnailUrl || '';

  async function toggleStatus() {
    const next = item.status === 'ready' ? 'draft' : 'ready';
    setStatusBusy(true);
    try {
      const res = await fetch(
        `${API}/api/content/admin/content/${item._id}/status`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ status: next }) },
      );
      if (!res.ok) throw new Error(await res.text());
      onStatusChange(next);
    } catch (e) {
      alert(`Failed to update status: ${(e as Error).message}`);
    } finally { setStatusBusy(false); }
  }

  async function uploadImg(file: File, assetType: 'poster' | 'backdrop') {
    const token = localStorage.getItem('admin_token');
    const bucketKey = item.type === 'stage_play' ? 'stageplay'
      : item.type === 'tv_episode' ? 'tv_episode'
      : item.type === 'minisode'   ? 'minisode'
      : item.type === 'reelfilm'   ? 'reelfilm'
      : item.type === 'podcast'    ? 'podcast'
      : item.type === 'music'      ? 'music'
      : 'movie';

    setUploadPct(0); setUploadErr('');
    try {
      const fd  = new FormData();
      fd.append('file', file);
      const xhr = new XMLHttpRequest();
      const url = `${API}/api/uploads/image?folder=content&assetType=${assetType}&contentType=${bucketKey}&slug=${encodeURIComponent(item.slug || item._id)}`;
      await new Promise<void>((res, rej) => {
        xhr.open('POST', url);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = e => { if (e.lengthComputable) setUploadPct(Math.round(e.loaded / e.total * 100)); };
        xhr.onload  = () => { try { res(); } catch { rej(new Error('Upload failed')); } };
        xhr.onerror = () => rej(new Error('Network error'));
        xhr.send(fd);
        return xhr;
      });
      const result = JSON.parse(xhr.responseText);
      const imgUrl: string = result?.url || result?.data?.url || '';
      if (!imgUrl) throw new Error('No URL returned');

      // Persist to the content doc
      const patch = await fetch(`${API}/api/content/admin/content/${item._id}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ [assetType]: imgUrl }),
      });
      if (!patch.ok) throw new Error('Failed to save image URL');
      const patchData = await patch.json();

      setImgError(false);
      onImagesChange(patchData.data?.posterUrl || (assetType === 'poster' ? imgUrl : item.posterUrl || ''),
                     patchData.data?.posterUrl || item.thumbnailUrl || '');
      setEditImg(false);
    } catch (e: any) { setUploadErr(e.message); }
    finally { setTimeout(() => setUploadPct(null), 1200); }
  }

  const isReady = item.status === 'ready';

  return (
    <div style={S.contentCard}>
      {/* Thumbnail */}
      <div style={{ height: 110, background: '#d8d4cc', overflow: 'hidden', position: 'relative' }}>
        {imgSrc && !imgError
          ? <img src={imgSrc} alt={item.title} onError={() => setImgError(true)}
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                           justifyContent: 'center', height: '100%', color: '#8fa0b7', gap: 4 }}>
              {CATEGORY_META[item.type]
                ? (() => { const { Icon } = CATEGORY_META[item.type]; return <Icon />; })()
                : <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20" strokeLinecap="round"/>
                  </svg>}
              <span style={{ fontSize: 9, color: '#aaa' }}>No image</span>
            </div>
        }

        {/* Status pill */}
        <span style={{
          position: 'absolute', bottom: 4, left: 4,
          background: isReady ? 'rgba(21,87,36,0.88)' : 'rgba(100,40,40,0.82)',
          color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px',
          borderRadius: 2, letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>{item.status}</span>

        {/* Camera / edit images button */}
        <button onClick={() => { setEditImg(v => !v); setUploadErr(''); }}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  background: editImg ? '#1b3d7b' : 'rgba(0,0,0,0.55)',
                  border: 'none', borderRadius: 2, padding: '3px 5px',
                  cursor: 'pointer', color: '#fff', fontSize: 11, lineHeight: 1,
                }} title="Upload poster / backdrop">
          {editImg ? '✕' : '📷'}
        </button>
      </div>

      {/* Inline image upload panel */}
      {editImg && (
        <div style={{ background: '#e8e4dc', padding: '7px 8px', borderBottom: '1px solid #ccc8bf' }}>
          {uploadPct !== null && (
            <div style={{ height: 3, background: '#d8d4cc', borderRadius: 2, marginBottom: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${uploadPct}%`, background: '#1b3d7b', transition: 'width 0.2s' }} />
            </div>
          )}
          {uploadErr && <div style={{ fontSize: 10, color: '#a82020', marginBottom: 4 }}>{uploadErr}</div>}
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => posterRef.current?.click()}
                    style={{ flex: 1, fontSize: 10, padding: '4px 0', background: '#0f1923', color: '#f8f6f2',
                             border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 700 }}>
              ↑ Poster
            </button>
            <button onClick={() => backdropRef.current?.click()}
                    style={{ flex: 1, fontSize: 10, padding: '4px 0', background: '#0f1923', color: '#f8f6f2',
                             border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 700 }}>
              ↑ Backdrop
            </button>
          </div>
          <input ref={posterRef}   type="file" accept="image/*" style={{ display: 'none' }}
                 onChange={e => e.target.files?.[0] && uploadImg(e.target.files[0], 'poster')} />
          <input ref={backdropRef} type="file" accept="image/*" style={{ display: 'none' }}
                 onChange={e => e.target.files?.[0] && uploadImg(e.target.files[0], 'backdrop')} />
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '7px 8px 9px' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#0f1923', marginBottom: 6,
          lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
        }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button disabled={statusBusy || busy} onClick={toggleStatus} style={{
            flex: 1, fontSize: 10, fontWeight: 700, padding: '4px 0',
            background: statusBusy ? '#ccc' : isReady ? '#155724' : '#1b3d7b',
            color: '#fff', border: 'none', borderRadius: 2,
            cursor: statusBusy ? 'not-allowed' : 'pointer', letterSpacing: '0.04em',
          }}>
            {statusBusy ? '…' : isReady ? '✓ Published' : '↑ Publish'}
          </button>
          <button disabled={busy || statusBusy} onClick={onUnassign} style={{
            fontSize: 10, fontWeight: 700, padding: '4px 7px',
            background: busy ? '#ccc' : 'rgba(180,40,40,0.1)',
            color: busy ? '#999' : '#a82020',
            border: '1px solid rgba(180,40,40,0.25)', borderRadius: 2,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}>
            {busy ? '…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSIGN PANEL (search + pick content to add)
// ═══════════════════════════════════════════════════════════════════════════

function AssignPanel({
  hostSlug, hostId, activeType, onAssigned, onClose,
}: {
  hostSlug: string;
  hostId: string;
  activeType: string;
  onAssigned: (item: ContentItem) => void;
  onClose: () => void;
}) {
  const [q,          setQ]          = useState('');
  const [type,       setType]       = useState(activeType === 'all' ? '' : activeType);
  const [results,    setResults]    = useState<ContentItem[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [assigning,  setAssigning]  = useState<string | null>(null);   // item._id being saved
  const [assignErr,  setAssignErr]  = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (query: string, t: string) => {
    setLoading(true);
    setAssignErr(null);
    try {
      const params = new URLSearchParams({ limit: '24' });
      if (query) params.set('q', query);
      if (t)     params.set('type', t);
      const res = await fetch(`${API}/api/content/admin/search?${params}`, {
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      setResults(data.items ?? []);
    } catch (e: any) {
      setAssignErr(e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(q, type), 350);
  }, [q, type, search]);

  async function assign(item: ContentItem) {
    if (assigning) return;                // prevent double-click
    setAssigning(item._id);
    setAssignErr(null);
    try {
      const res = await fetch(`${API}/api/content/admin/content/${item._id}/host`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body:    JSON.stringify({ hostSlug, hostId }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Server error ${res.status}: ${text}`);
      }
      // Update this item in results so button flips to "✓ Added"
      setResults(prev =>
        prev.map(r => r._id === item._id ? { ...r, hostSlug } : r)
      );
      // Notify parent with updated hostSlug so ContentPanel shows it
      onAssigned({ ...item, hostSlug });
    } catch (e: any) {
      setAssignErr(e.message);
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="assign-panel">
      <div className="assign-panel__head">
        <span style={S.cardTitle}>Assign Content</span>
        <button style={S.backBtn} onClick={onClose}>✕ Close</button>
      </div>

      {assignErr && (
        <div style={{ padding: '8px 16px', background: '#fff3cd', borderBottom: '1px solid #eeebe6',
                       fontSize: 11, color: '#856404', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          {assignErr}
          <button onClick={() => setAssignErr(null)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                           fontSize: 11, color: '#856404' }}>✕</button>
        </div>
      )}

      <div className="assign-panel__filters">
        <input style={S.searchInput} placeholder="Search by title or slug…"
               value={q} onChange={e => setQ(e.target.value)} autoFocus />
        <select value={type} onChange={e => setType(e.target.value)}
                style={{ ...S.input, width: 160 }}>
          <option value="">All types</option>
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{CATEGORY_META[t].label}</option>
          ))}
        </select>
      </div>

      {loading
        ? <div className="assign-panel__empty">Searching…</div>
        : results.length === 0
          ? <div className="assign-panel__empty">No results — try a different search</div>
          : (
            <div className="assign-panel__grid">
              {results.map(item => {
                const isThisHost   = item.hostSlug === hostSlug;
                const isOtherHost  = !!item.hostSlug && item.hostSlug !== hostSlug;
                const isBusy       = assigning === item._id;

                return (
                  <div key={item._id} className="assign-result-card">
                    <div className="assign-result-card__thumb">
                      {item.thumbnailUrl
                        ? <img src={item.thumbnailUrl} alt={item.title} />
                        : <span style={{ color: '#aaa', display: 'flex' }}>
                            {CATEGORY_META[item.type]
                              ? (() => { const { Icon } = CATEGORY_META[item.type]; return <Icon />; })()
                              : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20" strokeLinecap="round"/></svg>
                            }
                          </span>
                      }
                    </div>
                    <div className="assign-result-card__body">
                      <div className="assign-result-card__title">{item.title}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={S.badge(item.status)}>{item.status}</span>
                        <span style={{ fontSize: 10, color: '#999' }}>{CATEGORY_META[item.type]?.label ?? item.type}</span>
                      </div>
                      {isOtherHost && (
                        <div style={{ fontSize: 10, color: '#856404', marginTop: 2 }}>
                          ⚠ Assigned to another host
                        </div>
                      )}
                    </div>
                    <button
                      disabled={isThisHost || !!assigning}
                      onClick={() => assign(item)}
                      style={
                        isThisHost
                          ? { ...S.assignBtn, background: '#c3e6cb', color: '#155724', cursor: 'default' }
                          : isBusy
                          ? { ...S.assignBtn, background: '#aaa', cursor: 'not-allowed' }
                          : S.assignBtn
                      }
                    >
                      {isBusy ? '…' : isThisHost ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT PANEL (tabbed categories)
// ═══════════════════════════════════════════════════════════════════════════

function ContentPanel({ detail, onUpdate }: { detail: HostDetail; onUpdate: (d: HostDetail) => void }) {
  const [activeTab,    setActiveTab]    = useState<string>('all');
  const [showAssign,   setShowAssign]   = useState(false);

  const { host, contentByCategory, totalCount } = detail;

  // Flatten for "all" tab
  const allItems: ContentItem[] = Object.values(contentByCategory).flat();
  const displayItems = activeTab === 'all'
    ? allItems
    : (contentByCategory[activeTab] ?? []);

  const [unassigning, setUnassigning] = useState<string | null>(null);
  const [unassignErr, setUnassignErr] = useState<string | null>(null);

  async function handleUnassign(item: ContentItem) {
    if (unassigning) return;
    setUnassigning(item._id);
    setUnassignErr(null);
    // Optimistic remove
    const rollback = detail;
    const updated: HostDetail = {
      ...detail,
      totalCount: detail.totalCount - 1,
      contentByCategory: Object.fromEntries(
        Object.entries(contentByCategory).map(([k, v]) => [
          k, v.filter(c => c._id !== item._id)
        ])
      ),
    };
    onUpdate(updated);
    try {
      const res = await fetch(`${API}/api/content/admin/content/${item._id}/host`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body:    JSON.stringify({ hostSlug: null, hostId: null }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
    } catch (e: any) {
      onUpdate(rollback);   // roll back optimistic update
      setUnassignErr(e.message);
    } finally {
      setUnassigning(null);
    }
  }

  function handleAssigned(item: ContentItem) {
    const type = item.type;
    const existing = contentByCategory[type] ?? [];
    if (existing.some(c => c._id === item._id)) return;
    const updated: HostDetail = {
      ...detail,
      totalCount: detail.totalCount + 1,
      contentByCategory: {
        ...contentByCategory,
        [type]: [item, ...existing],
      },
    };
    onUpdate(updated);
  }

  return (
    <div>
      <div style={S.card}>
        {/* Tab bar */}
        <div style={{ ...S.cardHead, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button style={S.tab(activeTab === 'all')} onClick={() => setActiveTab('all')}>
              All ({totalCount})
            </button>
            {ALL_TYPES.map(type => {
              const count = (contentByCategory[type] ?? []).length;
              const { Icon, label } = CATEGORY_META[type];
              return (
                <button key={type} style={{ ...S.tab(activeTab === type), display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        onClick={() => setActiveTab(type)}>
                  <Icon />
                  {label}
                  {count > 0 && ` (${count})`}
                </button>
              );
            })}
          </div>
          <button style={S.assignBtn} onClick={() => setShowAssign(p => !p)}>
            {showAssign ? '✕ Close' : '+ Assign Content'}
          </button>
        </div>

        {/* Assign panel */}
        {showAssign && (
          <AssignPanel
            hostSlug={host.slug}
            hostId={host._id}
            activeType={activeTab}
            onAssigned={handleAssigned}
            onClose={() => setShowAssign(false)}
          />
        )}

        {/* Content grid */}
        <div style={{ padding: 16 }}>
          {displayItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: 13 }}>
              No content assigned to this category yet.
              <br />
              <button style={{ ...S.assignBtn, marginTop: 12, display: 'inline-flex' }}
                      onClick={() => setShowAssign(true)}>
                + Assign Content
              </button>
            </div>
          ) : (
            <div className="content-grid">
              {unassignErr && (
                <div style={{ gridColumn: '1 / -1', padding: '8px 12px', background: '#f8d7da',
                               border: '1px solid #f5c6cb', borderRadius: 2, fontSize: 11, color: '#721c24',
                               display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {unassignErr}
                  <button onClick={() => setUnassignErr(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#721c24' }}>✕</button>
                </div>
              )}
              {displayItems.map(item => (
                <ContentCard key={item._id} item={item}
                             busy={unassigning === item._id}
                             onUnassign={() => handleUnassign(item)}
                             onStatusChange={(newStatus) => {
                               const updated: HostDetail = {
                                 ...detail,
                                 contentByCategory: Object.fromEntries(
                                   Object.entries(detail.contentByCategory).map(([cat, items]) => [
                                     cat,
                                     items.map((c: ContentItem) =>
                                       c._id === item._id ? { ...c, status: newStatus } : c
                                     ),
                                   ])
                                 ),
                               };
                               onUpdate(updated);
                             }}
                             onImagesChange={(posterUrl, thumbnailUrl) => {
                               const updated: HostDetail = {
                                 ...detail,
                                 contentByCategory: Object.fromEntries(
                                   Object.entries(detail.contentByCategory).map(([cat, items]) => [
                                     cat,
                                     items.map((c: ContentItem) =>
                                       c._id === item._id ? { ...c, posterUrl, thumbnailUrl } : c
                                     ),
                                   ])
                                 ),
                               };
                               onUpdate(updated);
                             }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function HostDetailPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };

  const [detail, setDetail] = useState<HostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/content/admin/hosts/${slug}/detail`, {
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setDetail(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="hd-spinner" />
    </div>
  );

  if (error || !detail) return (
    <div style={{ ...S.page, padding: 40, color: '#721c24' }}>
      Failed to load host: {error}
    </div>
  );

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topBar}>
        <button style={S.backBtn} onClick={() => router.push('/dashboard/watch')}>
          ← Watch
        </button>
        <div style={{ ...S.cardTitle, fontSize: 13 }}>
          {detail.host.name}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#999' }}>
          {detail.totalCount} content item{detail.totalCount !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {/* Two-column layout */}
      <div style={S.layout}>
        {/* LEFT: profile */}
        <ProfilePanel
          host={detail.host}
          onSaved={updated => setDetail(d => d ? { ...d, host: updated } : d)}
        />

        {/* RIGHT: content */}
        <ContentPanel detail={detail} onUpdate={setDetail} />
      </div>
    </div>
  );
}