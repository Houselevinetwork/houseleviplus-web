'use client';

/**
 * Location: apps/levi+/app/dashboard/travel/page.tsx
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

type Continent = 'Africa' | 'Europe' | 'Asia' | 'Australia' | 'Americas';

interface TravelPackage {
  id: string; destination: string; continent: Continent;
  description: string; imageUrl: string | null;
  departureDate: string; returnDate: string;
  totalSpots: number; spotsRemaining: number;
  priceUSD: number; slug: string; status: string;
}
interface Inquiry {
  id: string; firstName: string; lastName: string; email: string; phone?: string;
  type: 'package' | 'custom'; destination?: string; packageId?: string;
  continent?: string; travelDate?: string; groupSize?: number;
  budget?: string; notes?: string; message?: string; createdAt: string;
}
interface Testimonial {
  id: string; clientName: string; destination: string; quote: string;
  rating: number; status: 'pending' | 'approved' | 'rejected';
  imageUrl?: string; side?: 'left' | 'right'; createdAt: string;
}
interface NoteData { body: string; imageUrl?: string; }

const CONTINENTS: Continent[] = ['Africa', 'Europe', 'Asia', 'Australia', 'Americas'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL not set');
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})) as any; throw new Error(e.message ?? String(res.status)); }
  return res.json() as Promise<T>;
}

async function uploadToR2(file: File, path: string): Promise<string> {
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch(`${API_BASE}/travel/${path}/upload`, {
    method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})) as any; throw new Error(e.message ?? 'Upload failed'); }
  return ((await res.json()) as { url: string }).url;
}

// ── Shared styles ─────────────────────────────────────────────
const S = {
  label:    { display: 'block', fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#999', marginBottom: 7 },
  input:    { width: '100%', padding: '11px 14px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '11px 14px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 80 },
  mHead:    { padding: '18px 24px', borderBottom: '1px solid #eeebe6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mTitle:   { fontFamily: 'Arial Black, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: '0.06em', color: '#111', textTransform: 'uppercase' as const },
  card:     { background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, marginBottom: 20 },
  cardHead: { padding: '14px 20px', borderBottom: '1px solid #eeebe6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  secTitle: { fontFamily: 'Arial Black, sans-serif', fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#111' },
};

// ── Icons ──────────────────────────────────────────────────────
const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>;
const UpIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const SpinIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;

function Skeleton({ width = '100%', height = 16 }: { width?: string|number; height?: number }) {
  return <div style={{ width, height, borderRadius: 2, background: 'linear-gradient(90deg,#f4f2ef 0%,#eeebe6 50%,#f4f2ef 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

function Modal({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,22,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: wide ? 680 : 560, borderRadius: 2, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden' }}>{children}</div>
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

function DropZone({ preview, onFile, dark = false, height = 160 }: { preview: string|null; onFile: (f: File) => void; dark?: boolean; height?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => ref.current?.click()} style={{ width: '100%', height, background: dark ? '#0f1923' : '#f8f6f2', border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.12)' : '#d8d4cc'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
      {preview
        ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ textAlign: 'center', color: dark ? 'rgba(255,255,255,0.3)' : '#bbb' }}>
            <div style={{ margin: '0 auto 8px', width: 'fit-content' }}><UpIcon /></div>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Click to upload</p>
          </div>
      }
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

// ── Hero Modal — image + headline ──────────────────────────────
function HeroModal({ current, onClose, onSave }: {
  current: { imageUrl: string; headline: string };
  onClose: () => void;
  onSave: (data: { imageUrl: string; headline: string }) => void;
}) {
  const [preview, setPreview] = useState<string|null>(current.imageUrl || null);
  const [file, setFile]       = useState<File|null>(null);
  const [headline, setHeadline] = useState(current.headline);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      let imageUrl = current.imageUrl;
      if (file) imageUrl = await uploadToR2(file, 'hero');
      await apiFetch('/travel/hero', { method: 'PUT', body: JSON.stringify({ imageUrl, headline }) });
      onSave({ imageUrl, headline }); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal>
      <div style={S.mHead}>
        <div><div style={S.mTitle}>Travel Hero</div><div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 2 }}>Full-screen background image + optional headline</div></div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 22 }}>×</button>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={S.label}>Hero Image</label>
          <DropZone preview={preview} dark height={180} onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)); }} />
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#bbb', lineHeight: 1.6, marginTop: 8 }}>Use a high-quality landscape photo. The <strong>"View Upcoming Journeys"</strong> CTA is always shown.</p>
        </div>
        <div>
          <label style={S.label}>Headline <span style={{ fontWeight: 400, color: '#bbb' }}>(optional — shown centre-screen over image)</span></label>
          <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Travel with HouseLevi+" style={S.input} />
        </div>
        {err && <InlineError msg={err} />}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} label="Publish Hero" />
    </Modal>
  );
}

// ── Note from Levi Modal ───────────────────────────────────────
function NoteModal({ current, onClose, onSave }: {
  current: NoteData;
  onClose: () => void;
  onSave: (n: NoteData) => void;
}) {
  const [body, setBody]           = useState(current.body);
  const [preview, setPreview]     = useState<string|null>(current.imageUrl ?? null);
  const [file, setFile]           = useState<File|null>(null);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState('');

  const handleSave = async () => {
    if (!body.trim()) { setErr('Note body is required'); return; }
    setSaving(true); setErr('');
    try {
      let imageUrl = current.imageUrl;
      if (file) imageUrl = await uploadToR2(file, 'note');
      await apiFetch('/travel/note', { method: 'PUT', body: JSON.stringify({ body, imageUrl }) });
      onSave({ body, imageUrl }); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal>
      <div style={S.mHead}>
        <div><div style={S.mTitle}>Note from Levi</div><div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 2 }}>Shown on the web travel page below packages</div></div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 22 }}>×</button>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={S.label}>Profile Photo <span style={{ fontWeight: 400, color: '#bbb' }}>(optional — shown as a circular thumbnail)</span></label>
          <DropZone preview={preview} height={120} onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)); }} />
        </div>
        <div>
          <label style={S.label}>Note Body *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={7}
            placeholder={"Travel has been one of the most transformative forces in my life…\n\nUse blank lines to separate paragraphs — each will render as a separate paragraph on the web page."}
            style={{ ...S.textarea, minHeight: 160 }}
          />
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#bbb', marginTop: 6 }}>Separate paragraphs with a blank line.</p>
        </div>
        {err && <InlineError msg={err} />}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} label="Save Note" />
    </Modal>
  );
}

// ── Package Modal ──────────────────────────────────────────────
function PackageModal({ pkg, onClose, onSave }: { pkg?: TravelPackage; onClose: () => void; onSave: (p: TravelPackage) => void }) {
  const editing = !!pkg;
  const [form, setForm] = useState({
    destination:    pkg?.destination          ?? '',
    continent:      (pkg?.continent           ?? 'Africa') as Continent,
    description:    pkg?.description          ?? '',
    departureDate:  pkg?.departureDate?.slice(0,10) ?? '',
    returnDate:     pkg?.returnDate?.slice(0,10)    ?? '',
    totalSpots:     String(pkg?.totalSpots    ?? 8),
    spotsRemaining: String(pkg?.spotsRemaining ?? 8),
    priceUSD:       String(pkg?.priceUSD      ?? 0),
    status:         pkg?.status               ?? 'active',
  });
  const [preview, setPreview] = useState<string|null>(pkg?.imageUrl ?? null);
  const [file, setFile]       = useState<File|null>(null);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.destination.trim()) { setErr('Destination required'); return; }
    if (!form.description.trim()) { setErr('Description required'); return; }
    setSaving(true); setErr('');
    try {
      let imageUrl = pkg?.imageUrl ?? null;
      if (file) imageUrl = await uploadToR2(file, 'packages');
      const body = { ...form, imageUrl, totalSpots: Number(form.totalSpots), spotsRemaining: Number(form.spotsRemaining), priceUSD: Number(form.priceUSD) };
      const result: any = editing
        ? await apiFetch(`/travel/packages/${pkg!.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await apiFetch('/travel/packages', { method: 'POST', body: JSON.stringify(body) });
      onSave({ ...body, id: result?.id ?? result?._id ?? pkg?.id ?? Date.now().toString(), imageUrl, slug: result?.slug ?? '' });
      onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal wide>
      <div style={S.mHead}>
        <div>
          <div style={S.mTitle}>{editing ? 'Edit Package' : 'Add Travel Package'}</div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 2 }}>Image · Destination · Description · Dates · Spots</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 22 }}>×</button>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '72vh', overflowY: 'auto' }}>
        <div>
          <label style={S.label}>Package Image <span style={{ fontWeight: 400, color: '#bbb' }}>(required for publication)</span></label>
          <DropZone preview={preview} height={200} onFile={f => { setFile(f); setPreview(URL.createObjectURL(f)); }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={S.label}>Destination *</label><input value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Kenya, East Africa" style={S.input} /></div>
          <div>
            <label style={S.label}>Continent *</label>
            <select value={form.continent} onChange={e => set('continent', e.target.value)} style={{ ...S.input, appearance: 'none' }}>
              {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={S.label}>Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the journey — what makes it special, what to expect…" style={S.textarea} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={S.label}>Departure Date</label><input type="date" value={form.departureDate} onChange={e => set('departureDate', e.target.value)} style={S.input} /></div>
          <div><label style={S.label}>Return Date</label><input type="date" value={form.returnDate} onChange={e => set('returnDate', e.target.value)} style={S.input} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div><label style={S.label}>Total Spots</label><input type="number" min="1" value={form.totalSpots} onChange={e => set('totalSpots', e.target.value)} style={S.input} /></div>
          <div><label style={S.label}>Spots Remaining</label><input type="number" min="0" value={form.spotsRemaining} onChange={e => set('spotsRemaining', e.target.value)} style={S.input} /></div>
          <div><label style={S.label}>Price (USD)</label><input type="number" min="0" value={form.priceUSD} onChange={e => set('priceUSD', e.target.value)} placeholder="3500" style={S.input} /></div>
        </div>

        <div>
          <label style={S.label}>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...S.input, appearance: 'none' }}>
            <option value="active">Active (visible on site)</option>
            <option value="draft">Draft (hidden)</option>
            <option value="full">Fully Booked</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {err && <InlineError msg={err} />}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} label={editing ? 'Update Package' : 'Publish Package'} />
    </Modal>
  );
}

// ── Testimonial card ───────────────────────────────────────────
function TestimonialCard({ t, onApprove, onReject }: { t: Testimonial; onApprove: () => void; onReject: () => void }) {
  const [busy, setBusy] = useState(false);
  const statusColors = { pending: '#d97706', approved: '#16a34a', rejected: '#a0291e' };
  return (
    <div style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 2 }}>{t.clientName}</div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999' }}>{t.destination}</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, background: 'rgba(0,0,0,0.04)', color: statusColors[t.status] }}>{t.status}</span>
      </div>
      <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', lineHeight: 1.65, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
      {t.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={async () => { setBusy(true); try { await apiFetch(`/travel/testimonials/${t.id}/approve`, { method: 'PATCH' }); onApprove(); } finally { setBusy(false); } }} disabled={busy} style={{ padding: '7px 16px', background: '#16a34a', border: 'none', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}>Approve</button>
          <button onClick={async () => { setBusy(true); try { await apiFetch(`/travel/testimonials/${t.id}/reject`, { method: 'PATCH' }); onReject(); } finally { setBusy(false); } }} disabled={busy} style={{ padding: '7px 16px', background: 'none', border: '1px solid #d8d4cc', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a0291e', borderRadius: 1 }}>Reject</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function AdminTravelPage() {
  const [hero, setHero]               = useState<{ imageUrl: string; headline: string }>({ imageUrl: '', headline: '' });
  const [note, setNote]               = useState<NoteData>({ body: '', imageUrl: undefined });
  const [packages, setPackages]       = useState<TravelPackage[]>([]);
  const [inquiries, setInquiries]     = useState<Inquiry[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadErr, setLoadErr]         = useState('');

  const [heroModal, setHeroModal]     = useState(false);
  const [noteModal, setNoteModal]     = useState(false);
  const [pkgModal, setPkgModal]       = useState<TravelPackage | true | null>(null);
  const [activeTab, setActiveTab]     = useState<'packages'|'inquiries'|'testimonials'>('packages');
  const [inqTab, setInqTab]           = useState<'package'|'custom'>('package');

  const apiMissing = !API_BASE;

  const fetchAll = useCallback(async () => {
    if (apiMissing) { setLoading(false); return; }
    setLoading(true); setLoadErr('');
    try {
      const [heroD, noteD, pkgD, inqD, testD] = await Promise.all([
        apiFetch<any>('/travel/hero').catch(() => ({ imageUrl: '', headline: '' })),
        apiFetch<any>('/travel/note').catch(() => ({ body: '' })),
        apiFetch<any>('/travel/packages?status=all').catch(() => ({ data: [] })),
        apiFetch<any>('/travel/inquiries').catch(() => []),
        apiFetch<any>('/travel/testimonials?status=all').catch(() => ({ data: [] })),
      ]);
      setHero({ imageUrl: heroD?.imageUrl ?? '', headline: heroD?.headline ?? '' });
      setNote({ body: noteD?.body ?? noteD?.data?.body ?? '', imageUrl: noteD?.imageUrl ?? noteD?.data?.imageUrl });
      setPackages((pkgD?.data ?? pkgD ?? []).map((p: any) => ({
        id: String(p._id ?? p.id ?? ''), destination: p.destination ?? '', continent: p.continent ?? 'Africa',
        description: p.description ?? '', imageUrl: p.imageUrl ?? null,
        departureDate: p.departureDate ?? '', returnDate: p.returnDate ?? '',
        totalSpots: Number(p.totalSpots ?? 0), spotsRemaining: Number(p.spotsRemaining ?? 0),
        priceUSD: Number(p.priceUSD ?? 0), slug: p.slug ?? '', status: p.status ?? 'active',
      })));
      setInquiries(Array.isArray(inqD) ? inqD : (inqD?.data ?? []));
      setTestimonials((testD?.data ?? testD ?? []).map((t: any) => ({
        id: String(t._id ?? t.id ?? ''),
        clientName: t.clientName ?? t.author ?? '',     // ← normalise both field names
        destination: t.destination ?? '',
        quote: t.quote ?? t.body ?? '',                 // ← normalise both field names
        rating: Number(t.rating ?? 5),
        status: t.status ?? 'pending',
        imageUrl: t.imageUrl,
        side: t.side,
        createdAt: t.createdAt ?? '',
      })));
    } catch (e) { setLoadErr(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, [apiMissing]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deletePackage = async (id: string) => {
    if (!confirm('Archive this package?')) return;
    try {
      await apiFetch(`/travel/packages/${id}`, { method: 'DELETE' });
      setPackages(v => v.filter(p => p.id !== id));
    } catch (e) { alert(e instanceof Error ? e.message : 'Delete failed'); }
  };

  const metrics = [
    { label: 'Packages',        value: packages.length,                                         sub: `${packages.filter(p=>p.status==='active').length} active` },
    { label: 'Inquiries',       value: inquiries.length,                                        sub: 'Total received' },
    { label: 'Pending Reviews', value: testimonials.filter(t=>t.status==='pending').length,     sub: 'Awaiting approval', warn: true },
    { label: 'Spots Remaining', value: packages.reduce((s,p)=>s+p.spotsRemaining,0),            sub: 'Across active packages' },
  ];

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}} @keyframes shimmer{0%,100%{background-position:-200% 0;}50%{background-position:200% 0;}}`}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 18, fontWeight: 900, color: '#111', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Travel Manager</h1>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hero · Packages · Note · Inquiries · Testimonials</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPkgModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#0f1923', border: 'none', cursor: 'pointer', fontFamily: 'Arial Black, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}>
            <PlusIcon /> Add Package
          </button>
        </div>
      </div>

      {apiMissing && (
        <div style={{ margin: '0 0 20px', padding: '16px 20px', background: 'rgba(27,61,123,0.05)', border: '1px solid rgba(27,61,123,0.2)', borderRadius: 2 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555' }}>Set <code style={{ background:'#f0f0f0',padding:'1px 5px',fontSize:11,borderRadius:2 }}>NEXT_PUBLIC_API_URL</code> in <code style={{ background:'#f0f0f0',padding:'1px 5px',fontSize:11,borderRadius:2 }}>.env.local</code></div>
        </div>
      )}

      {loadErr && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(160,41,30,0.05)', border: '1px solid rgba(160,41,30,0.15)', borderRadius: 2, marginBottom: 20 }}>
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#a0291e' }}>{loadErr}</span>
          <button onClick={fetchAll} style={{ padding: '6px 14px', background: '#a0291e', border: 'none', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}>Retry</button>
        </div>
      )}

      {/* ── Hero + Note cards — side by side ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Hero card */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div>
              <div style={S.secTitle}>Hero Image & Headline</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 2 }}>Full-screen background · optional headline text</div>
            </div>
            <button onClick={() => setHeroModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#0f1923', border: 'none', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}><EditIcon /> Edit</button>
          </div>
          <div onClick={() => setHeroModal(true)} style={{ position: 'relative', margin: 20, height: 140, background: '#0f1923', borderRadius: 1, overflow: 'hidden', cursor: 'pointer' }}>
            {hero.imageUrl
              ? <img src={hero.imageUrl} alt="hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontFamily: 'serif', fontSize: 18, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em' }}>TRAVEL WITH HOUSELEVI+</div>
                  <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Click to upload</div>
                </div>
            }
            {hero.headline && (
              <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center' }}>
                <span style={{ fontFamily: 'serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', background: 'rgba(0,0,0,0.4)', padding: '3px 10px', borderRadius: 1 }}>{hero.headline}</span>
              </div>
            )}
          </div>
          {hero.headline && (
            <div style={{ padding: '0 20px 16px', fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#999' }}>
              Headline: <span style={{ color: '#111', fontWeight: 600 }}>{hero.headline}</span>
            </div>
          )}
        </div>

        {/* Note from Levi card */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div>
              <div style={S.secTitle}>Note from Levi</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 2 }}>Personal note shown below packages on web</div>
            </div>
            <button onClick={() => setNoteModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#0f1923', border: 'none', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}><EditIcon /> {note.body ? 'Edit' : 'Add Note'}</button>
          </div>
          <div style={{ padding: 20 }}>
            {note.body ? (
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {note.imageUrl && <img src={note.imageUrl} alt="Levi" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #eeebe6' }} />}
                <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.body}</p>
              </div>
            ) : (
              <div onClick={() => setNoteModal(true)} style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px dashed #d8d4cc', borderRadius: 2, flexDirection: 'column', gap: 8 }}>
                <PlusIcon />
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Add note from Levi</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Metrics ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, padding: '16px 18px' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>{m.label}</div>
            {loading ? <Skeleton width={40} height={28} /> : <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 26, fontWeight: 900, color: (m as any).warn && m.value > 0 ? '#d97706' : '#111', letterSpacing: '-0.02em', marginBottom: 2 }}>{m.value}</div>}
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#bbb', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eeebe6', marginBottom: 24 }}>
        {(['packages','inquiries','testimonials'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '11px 18px', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: activeTab===t ? '#111' : '#999', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab===t ? '#1b3d7b' : 'transparent'}`, cursor: 'pointer', position: 'relative', top: 1, fontWeight: activeTab===t ? 600 : 400 }}>
            {t}{t === 'testimonials' && testimonials.filter(x=>x.status==='pending').length > 0 && <span style={{ marginLeft: 6, background: '#d97706', color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 9, padding: '2px 6px', borderRadius: 10 }}>{testimonials.filter(x=>x.status==='pending').length}</span>}
          </button>
        ))}
      </div>

      {/* ── Packages tab ───────────────────────────────────── */}
      {activeTab === 'packages' && (
        <div>
          {loading
            ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>{[0,1,2].map(i => <div key={i}><Skeleton width="100%" height={260} /></div>)}</div>
            : packages.length === 0
              ? <div style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, padding: 48, textAlign: 'center', color: '#bbb', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
                  No packages yet — <button onClick={() => setPkgModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1b3d7b', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>add your first package</button>
                </div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {packages.map(pkg => (
                    <div key={pkg.id} style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ position: 'relative', height: 200, background: '#f4f2ef' }}>
                        {pkg.imageUrl
                          ? <img src={pkg.imageUrl} alt={pkg.destination} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#bbb' }}>No image</span>
                            </div>
                        }
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.55)', padding: '4px 10px', fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 1 }}>{pkg.continent}</div>
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, background: pkg.status === 'active' ? 'rgba(22,163,74,0.15)' : 'rgba(160,41,30,0.1)', color: pkg.status === 'active' ? '#16a34a' : '#a0291e' }}>{pkg.status}</span>
                        </div>
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 12, fontWeight: 900, color: '#111', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkg.destination}</div>
                        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#bbb', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkg.description}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#111' }}>${pkg.priceUSD.toLocaleString()} USD</span>
                          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: pkg.spotsRemaining < 3 ? '#a0291e' : '#999' }}>{pkg.spotsRemaining}/{pkg.totalSpots} spots</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setPkgModal(pkg)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', background: 'none', border: '1px solid #d8d4cc', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', borderRadius: 1 }}><EditIcon /> Edit</button>
                          <button onClick={() => deletePackage(pkg.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', background: 'none', border: '1px solid rgba(160,41,30,0.2)', cursor: 'pointer', color: '#a0291e', borderRadius: 1 }}><TrashIcon /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          }
        </div>
      )}

      {/* ── Inquiries tab ──────────────────────────────────── */}
      {activeTab === 'inquiries' && (
        <div>
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #eeebe6' }}>
            {(['package','custom'] as const).map(t => (
              <button key={t} onClick={() => setInqTab(t)} style={{ padding: '9px 16px', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: inqTab===t ? '#111' : '#999', background: 'none', border: 'none', borderBottom: `2px solid ${inqTab===t ? '#1b3d7b' : 'transparent'}`, cursor: 'pointer', position: 'relative', top: 1 }}>
                {t === 'package' ? 'Package Inquiries' : 'Custom Inquiries'}
              </button>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2 }}>
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}><SpinIcon /></div> : (() => {
              const list = inquiries.filter(i => i.type === inqTab);
              if (list.length === 0) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#bbb' }}>No {inqTab} inquiries yet</div>;
              return (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8f6f2' }}>
                    {['Name','Email','Destination','Group Size','Received'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#999', textAlign: 'left', borderBottom: '1px solid #eeebe6' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {list.map(i => (
                      <tr key={i.id} style={{ borderBottom: '1px solid #f4f2ef' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#111', fontWeight: 500 }}>{[i.firstName, i.lastName].filter(Boolean).join(' ') || '—'}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555' }}>{i.email}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555' }}>{i.destination ?? '—'}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555' }}>{i.groupSize ?? '—'}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#bbb' }}>{i.createdAt ? new Date(i.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Testimonials tab ───────────────────────────────── */}
      {activeTab === 'testimonials' && (
        <div>
          {loading
            ? <Skeleton width="100%" height={120} />
            : testimonials.length === 0
              ? <div style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, padding: 48, textAlign: 'center', color: '#bbb', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>No testimonials submitted yet</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                  {testimonials.map(t => (
                    <TestimonialCard
                      key={t.id} t={t}
                      onApprove={() => setTestimonials(v => v.map(x => x.id === t.id ? { ...x, status: 'approved' } : x))}
                      onReject={()  => setTestimonials(v => v.map(x => x.id === t.id ? { ...x, status: 'rejected' } : x))}
                    />
                  ))}
                </div>
          }
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {heroModal && <HeroModal current={hero} onClose={() => setHeroModal(false)} onSave={d => setHero(d)} />}
      {noteModal && <NoteModal current={note} onClose={() => setNoteModal(false)} onSave={n => setNote(n)} />}
      {pkgModal === true && <PackageModal onClose={() => setPkgModal(null)} onSave={p => { setPackages(v => [...v, p]); setPkgModal(null); }} />}
      {pkgModal && pkgModal !== true && <PackageModal pkg={pkgModal as TravelPackage} onClose={() => setPkgModal(null)} onSave={p => { setPackages(v => v.map(x => x.id === p.id ? p : x)); setPkgModal(null); }} />}
    </>
  );
}