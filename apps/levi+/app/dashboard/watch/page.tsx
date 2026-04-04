'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import './watch.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Host {
  _id: string;
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface ContentItem {
  _id: string;
  title: string;
  type: string;
  thumbnailUrl: string;
  isPremium: boolean;
  isNew: boolean;
  duration: string;
  showName: string;
}

// ─── API helper ───────────────────────────────────────────────────────────────
// Attaches Authorization: Bearer <token> when a token exists in localStorage.
// Falls back to cookie-only auth (credentials: 'include') if no token found.
// This matches the pattern used by the XHR upload — never send "Bearer " (empty).
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options?.headers as Record<string, string> | undefined),
      },
    });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11v6M14 11v6" strokeLinecap="round"/><path d="M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const FolderIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
    <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
  </svg>
);

// ─── Mood-TV style tokens (mirrors S.* in mood-tv admin page) ─────────────────
const MS = {
  overlay:  { position: 'fixed' as const, inset: 0, background: 'rgba(10,15,22,0.78)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' as const },
  modal:    { background: '#fff', width: '100%', maxWidth: 520, borderRadius: 2, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden' },
  head:     { padding: '18px 24px', borderBottom: '1px solid #eeebe6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title:    { fontFamily: 'Arial Black, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: '0.06em', color: '#111', textTransform: 'uppercase' as const, margin: 0 },
  sub:      { fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 3 },
  body:     { padding: 24, display: 'flex', flexDirection: 'column' as const, gap: 16 },
  footer:   { padding: '16px 24px', borderTop: '1px solid #eeebe6', display: 'flex', gap: 10, justifyContent: 'flex-end' },
  label:    { display: 'block', fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#999', marginBottom: 7 },
  input:    { width: '100%', padding: '10px 13px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '10px 13px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 80 },
  hint:     { fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#bbb', marginTop: 5 },
  error:    { fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#a0291e', padding: '10px 14px', background: 'rgba(160,41,30,0.07)', border: '1px solid rgba(160,41,30,0.15)', borderRadius: 1, lineHeight: 1.5 },
  btnCancel:{ padding: '10px 20px', background: 'none', border: '1px solid #d8d4cc', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#999', borderRadius: 1 },
  btnSave:  (busy: boolean) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: busy ? '#aaa' : '#0f1923', border: 'none', cursor: busy ? 'not-allowed' as const : 'pointer' as const, fontFamily: 'Arial Black, sans-serif', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#fff', borderRadius: 1 }),
  btnDanger:{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#a0291e', border: 'none', cursor: 'pointer' as const, fontFamily: 'Arial Black, sans-serif', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#fff', borderRadius: 1 },
  toggle:   (on: boolean) => ({ padding: '10px 16px', borderRadius: 1, border: on ? '1px solid #1b3d7b' : '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer' as const, background: on ? 'rgba(27,61,123,0.06)' : 'none', color: on ? '#1b3d7b' : '#999' }),
};

// ─── Host Modal ────────────────────────────────────────────────────────────────
interface HostModalProps {
  host?: Host | null;
  onClose: () => void;
  onSaved: () => void;
}

function HostModal({ host, onClose, onSaved }: HostModalProps) {
  const isEdit = !!host;
  const [name,      setName]      = useState(host?.name      || '');
  const [slug,      setSlug]      = useState(host?.slug      || '');
  const [bio,       setBio]       = useState(host?.bio       || '');
  const [avatarUrl, setAvatarUrl] = useState(host?.avatarUrl || '');
  const [sortOrder, setSortOrder] = useState(host?.sortOrder ?? 0);
  const [isActive,  setIsActive]  = useState(host?.isActive  ?? true);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [preview,   setPreview]   = useState(host?.avatarUrl || '');
  const [uploadOk,  setUploadOk]  = useState(!!host?.avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-slug from name
  useEffect(() => {
    if (!isEdit && name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [name, isEdit]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true); setUploadPct(0); setError(''); setUploadOk(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Pass slug so R2 stores under hosts/{slug}/profile/{filename}
      // Use current slug state, or derive from name if slug not yet set
      const hostSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `host-${Date.now()}`;
      const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/uploads/image?folder=hosts&assetType=profile&slug=${encodeURIComponent(hostSlug)}`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';
      const xhr = new XMLHttpRequest();
      const url = await new Promise<string>((resolve, reject) => {
        xhr.open('POST', uploadUrl);
        xhr.withCredentials = true;
        // Only send Authorization header when token is present.
        // Sending "Bearer " (empty string) causes JWT guard to reject the request
        // even when a valid session cookie is already present via withCredentials.
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = ev => { if (ev.lengthComputable) setUploadPct(Math.round(ev.loaded / ev.total * 100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const d = JSON.parse(xhr.responseText);
            const u = d.url || d.data?.url || d.data?.publicUrl || '';
            u ? resolve(u) : reject(new Error('No URL returned from upload'));
          } else reject(new Error(`Upload failed (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
      setAvatarUrl(url); setPreview(url); setUploadOk(true);
    } catch (err: any) {
      setError(err.message || 'Upload failed'); setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!slug.trim()) { setError('Slug is required'); return; }
    setSaving(true); setError('');
    try {
      const payload = { name, slug, bio, avatarUrl, sortOrder, isActive };
      const endpoint = isEdit ? `/api/content/admin/hosts/${host!._id}` : '/api/content/admin/hosts';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`, {
        method: isEdit ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Save failed'); }
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save host');
    } finally { setSaving(false); }
  };

  const busy = uploading || saving;

  return (
    <div style={MS.overlay} onClick={onClose}>
      <div style={MS.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={MS.head}>
          <div>
            <div style={MS.title}>{isEdit ? 'Edit Host' : 'Add Host'}</div>
            <div style={MS.sub}>{isEdit ? `Editing: ${host!.name}` : 'Avatar · Name · Bio · Visibility'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={MS.body}>

          {/* Avatar drop zone */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              onClick={() => !busy && fileRef.current?.click()}
              style={{
                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                border: `2px dashed ${uploadOk ? '#00B77F' : '#d8d4cc'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: busy ? 'default' : 'pointer',
                background: preview ? 'transparent' : '#f8f6f2',
                position: 'relative', transition: 'border-color 0.2s',
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#bbb' }}>
                  {uploading ? <SpinnerIcon /> : <UploadIcon />}
                  <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.06em' }}>
                    {uploading ? 'Uploading' : 'Upload photo'}
                  </span>
                </div>
              )}
              {/* Hover hint when photo exists */}
              {preview && !uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,25,35,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%', fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                >Change</div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#bbb' }}>Recommended: 400×400px · JPG or PNG</span>

            {/* Upload progress bar */}
            {uploading && (
              <div style={{ width: '100%', maxWidth: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Uploading to R2</span>
                  <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 12, color: '#111' }}>{uploadPct}%</span>
                </div>
                <div style={{ height: 6, background: '#eeebe6', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadPct}%`, background: 'linear-gradient(90deg,#1b3d7b,#0f1923)', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Upload success indicator */}
            {uploadOk && !uploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#00B77F' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Photo uploaded successfully
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label style={MS.label}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wakhata Levi" style={MS.input} />
          </div>

          {/* Slug */}
          <div>
            <label style={MS.label}>Slug *</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. wakhata-levi" style={MS.input} />
            <div style={MS.hint}>URL: /hosts/<strong style={{ color: '#555' }}>{slug || 'slug'}</strong></div>
          </div>

          {/* Bio */}
          <div>
            <label style={MS.label}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Short description of this host..." rows={3} style={MS.textarea} />
          </div>

          {/* Sort order + Active toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={MS.label}>Sort Order</label>
              <input type="number" min={0} value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value))} style={MS.input} />
            </div>
            <div>
              <label style={MS.label}>Visibility</label>
              <button style={MS.toggle(isActive)} onClick={() => setIsActive(v => !v)}>
                {isActive ? '● Active' : '○ Hidden'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div style={MS.error}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={MS.footer}>
          <button onClick={onClose} style={MS.btnCancel}>Cancel</button>
          <button onClick={handleSave} disabled={busy} style={MS.btnSave(busy)}>
            {saving && <SpinnerIcon />}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Host'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={MS.overlay} onClick={onCancel}>
      <div style={{ ...MS.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div style={MS.head}>
          <div>
            <div style={MS.title}>Delete Host</div>
            <div style={MS.sub}>This action cannot be undone</div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={MS.body}>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#555', lineHeight: 1.65, margin: 0 }}>
            Remove <strong style={{ color: '#111' }}>{name}</strong> from the watch page?
            Their content will stay, but the host will no longer appear in the Browse by Host row.
          </p>
        </div>
        <div style={MS.footer}>
          <button onClick={onCancel} style={MS.btnCancel}>Cancel</button>
          <button onClick={onConfirm} style={MS.btnDanger}>Delete Host</button>
        </div>
      </div>
    </div>
  );
}

// ─── Content Row (read-only, admin view) ──────────────────────────────────────
function AdminContentRow({ title, items }: { title: string; items: ContentItem[] }) {
  if (!items.length) return null;
  return (
    <section className="aw-content-row">
      <h3 className="aw-row-title">{title}</h3>
      <div className="aw-row-scroll">
        {items.map(item => (
          <div key={item._id} className="aw-card">
            <div className="aw-card-thumb">
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt={item.title}/>
                : <div className="aw-card-placeholder">{item.title[0]}</div>
              }
              {item.isPremium && <span className="aw-card-badge aw-card-badge--gold">★</span>}
              {item.isNew    && <span className="aw-card-badge aw-card-badge--new">NEW</span>}
            </div>
            <div className="aw-card-info">
              <p className="aw-card-title">{item.title}</p>
              {item.showName && <p className="aw-card-sub">{item.showName}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminWatchPage() {
  const router = useRouter();

  const [hosts,         setHosts]         = useState<Host[]>([]);
  const [latestItems,   setLatestItems]   = useState<ContentItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<ContentItem[]>([]);
  const [loading,       setLoading]       = useState(true);

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingHost,  setEditingHost]  = useState<Host | null>(null);
  const [deletingHost, setDeletingHost] = useState<Host | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [hostsRes, latestRes, featuredRes] = await Promise.all([
      apiFetch<{ hosts: Host[] }>('/api/content/admin/hosts',                   { hosts: [] }),
      apiFetch<{ items: ContentItem[] }>('/api/content/latest-episodes?limit=12', { items: [] }),
      apiFetch<{ items: ContentItem[] }>('/api/content/featured?limit=12',        { items: [] }),
    ]);
    setHosts(hostsRes.hosts);
    setLatestItems(latestRes.items);
    setFeaturedItems(featuredRes.items);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deletingHost) return;
    await apiFetch(`/api/content/admin/hosts/${deletingHost._id}`, null, { method: 'DELETE' });
    setDeletingHost(null);
    loadData();
  };

  const openAdd  = () => { setEditingHost(null); setModalOpen(true); };
  const openEdit = (h: Host) => { setEditingHost(h); setModalOpen(true); };

  return (
    <>

      <div className="aw-page">

        {/* ── Hosts Section ──────────────────────────────────────────────────── */}
        <section className="aw-hosts-section">
          <div className="aw-section-header">
            <div>
              <h2 className="aw-section-title">Browse by Host</h2>
              <p className="aw-section-meta">{hosts.length} host{hosts.length !== 1 ? 's' : ''} · visible on watch page</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/content/upload')}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', background: '#0f1923', border: '1px solid #0f1923',
                borderRadius: 2, cursor: 'pointer', fontFamily: 'Arial Black, sans-serif',
                fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f4f2ef',
              }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
                <polyline points="17 8 12 3 7 8" strokeLinecap="round"/>
                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
              </svg>
              Upload Content
            </button>
          </div>

          <div className="aw-hosts-row">
            {/* Always-visible Add button */}
            <div className="aw-host-add" onClick={openAdd} title="Add host">
              <div className="aw-host-add-circle"><PlusIcon /></div>
              <span className="aw-host-add-label">Add host</span>
            </div>

            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aw-host-card">
                    <div className="aw-skeleton" style={{ width: 76, height: 76, borderRadius: '50%' }}/>
                    <div className="aw-skeleton" style={{ width: 60, height: 10, marginTop: 4 }}/>
                  </div>
                ))
              : hosts.map(host => (
                  <div key={host._id} className="aw-host-card">
                    <div className="aw-host-avatar-wrap">
                      {host.avatarUrl
                        ? <img src={host.avatarUrl} alt={host.name} className="aw-host-avatar"/>
                        : <div className="aw-host-avatar-placeholder">{host.name[0]}</div>
                      }
                      {/* Edit / delete / open on hover */}
                      <div className="aw-host-actions">
                        <button className="aw-host-action-btn aw-host-action-btn--open"
                          title="Manage content" onClick={() => router.push(`/dashboard/watch/hosts/${host.slug}`)}>
                          <FolderIcon />
                        </button>
                        <button className="aw-host-action-btn aw-host-action-btn--edit"
                          title="Edit profile" onClick={() => openEdit(host)}>
                          <EditIcon />
                        </button>
                        <button className="aw-host-action-btn aw-host-action-btn--delete"
                          title="Delete" onClick={() => setDeletingHost(host)}>
                          <TrashIcon />
                        </button>
                      </div>
                      {/* Gold dot = has content assigned */}
                      {host.isActive && (
                        <div className="aw-host-badge" title="Active">
                          <StarIcon />
                        </div>
                      )}
                    </div>
                    {/* Host name */}
                    <span className="aw-host-name">{host.name}</span>
                  </div>
                ))
            }
          </div>
        </section>

        {/* ── Content Rows ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="aw-empty">Loading content...</div>
        ) : (
          <>
            <AdminContentRow title="Latest Episodes" items={latestItems} />
            <AdminContentRow title="Featured"        items={featuredItems} />
          </>
        )}

      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <HostModal
          host={editingHost}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      )}

      {deletingHost && (
        <ConfirmDialog
          name={deletingHost.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingHost(null)}
        />
      )}
    </>
  );
}