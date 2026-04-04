'use client';
/**
 * Location: apps/levi+/app/dashboard/content/upload/page.tsx
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MediaZone } from './MediaZone';

interface Host   { _id: string; name: string; slug: string; avatarUrl?: string }
interface Series { seriesId: string; title: string; totalEpisodes: number }

type ContentTypeKey =
  | 'movie' | 'tv_episode' | 'stage_play' | 'podcast' | 'reelfilm' | 'minisode' | 'music';

interface Form {
  title:          string;
  description:    string;
  type:           ContentTypeKey | '';
  genre:          string;
  releaseYear:    string;
  isPremium:      boolean;
  isFeatured:     boolean;
  isNewContent:   boolean;
  displayDuration:string;
  seriesMode:     'new' | 'existing';
  seriesId:       string;
  seriesTitle:    string;
  seriesDesc:     string;
  season:         string;
  episode:        string;
  episodeTitle:   string;
  hostId:         string;
  hostSlug:       string;
  hostName:       string;
  director:       string;
  cast:           string;
  posterUrl:      string;
  backdropUrl:    string;
  mediaFile:      File | null;
  mediaUrl:       string;
  mediaFileName:  string;
  mediaFileSize:  number;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const BUCKET_KEY: Record<string, string> = {
  tv_episode: 'tv_episode',
  movie:      'movie',
  stage_play: 'stageplay',
  podcast:    'podcast',
  reelfilm:   'reelfilm',
  minisode:   'minisode',
  music:      'music',
};

const CONTENT_TYPES: { key: ContentTypeKey; label: string; desc: string; Icon: () => React.ReactNode; accept: string }[] = [
  { key: 'movie',      label: 'Movie',      accept: 'video/*',          desc: 'Feature film or full-length documentary',    Icon: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" strokeLinecap="round"/></svg> },
  { key: 'tv_episode', label: 'TV Episode', accept: 'video/*',          desc: 'Episode in a series or show',                Icon: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/></svg> },
  { key: 'stage_play', label: 'Stage Play', accept: 'video/*',          desc: 'Theatre performance or live show',           Icon: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 20h20M6 20V10l6-6 6 6v10" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="14" width="6" height="6"/></svg> },
  { key: 'podcast',    label: 'Podcast',    accept: 'audio/*,video/*',  desc: 'Audio or video podcast episode',             Icon: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" strokeLinecap="round"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round"/></svg> },
  { key: 'reelfilm',   label: 'Short Film', accept: 'video/*',          desc: 'Under 20 minutes — reel or short',          Icon: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'minisode',   label: 'Minisode',   accept: 'video/*',          desc: 'Micro-episode under 10 minutes',            Icon: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg> },
  { key: 'music',      label: 'Music',      accept: 'audio/*,video/*',  desc: 'Music video, single or album track',        Icon: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
];

const GENRES_BY_TYPE: Record<ContentTypeKey, string[]> = {
  movie:      ['Drama','Comedy','Romance','Thriller','Crime','Action','Documentary','Animation','Historical','Coming-of-Age','Family'],
  tv_episode: ['Drama','Comedy','Romance','Thriller','Crime','Action','Documentary','Animation','Historical','Coming-of-Age','Family'],
  stage_play: ['Drama','Comedy','Romance','Historical','Musical'],
  podcast:    ['Documentary','Interview','Talk Show','Investigative Journalism','Storytelling / Narrative','Business & Technology','Culture & Society','History','Wellness & Mental Health','Education','Comedy Podcast'],
  reelfilm:   ['Drama','Comedy','Romance','Thriller','Action','Short Film'],
  minisode:   ['Drama','Comedy','Action','Talk Show'],
  music:      ['Afrobeats','Afro Pop','Hip-Hop / Rap','R&B / Soul','Jazz & Blues','Traditional / Folk','Gospel / Spiritual','Reggae / Dancehall','Electronic / House','Instrumental / Soundscape'],
};

const STEPS = ['Type','Details','Series','Host','Media','Images','Publish'] as const;
type Step = typeof STEPS[number];

function authHeaders(): Record<string, string> {
  const t = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function apiFetch<T>(path: string, fallback: T, opts?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(opts?.headers as any) } });
    if (!res.ok) return fallback;
    return await res.json();
  } catch { return fallback; }
}

function xhrUpload(url: string, file: File, token: string | null, onProgress: (p: number) => void): Promise<any> {
  return new Promise((res, rej) => {
    const fd = new FormData(); const xhr = new XMLHttpRequest();
    fd.append('file', file); xhr.open('POST', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
    xhr.onload  = () => { try { res(JSON.parse(xhr.responseText)); } catch { rej(new Error('Parse error')); } };
    xhr.onerror = () => rej(new Error('Network error'));
    xhr.send(fd);
  });
}

const INIT: Form = {
  title: '', description: '', type: '', genre: '', releaseYear: new Date().getFullYear().toString(),
  isPremium: false, isFeatured: false, isNewContent: true, displayDuration: '',
  seriesMode: 'existing', seriesId: '', seriesTitle: '', seriesDesc: '', season: '1', episode: '',
  episodeTitle: '', hostId: '', hostSlug: '', hostName: '', director: '', cast: '',
  posterUrl: '', backdropUrl: '', mediaFile: null, mediaUrl: '', mediaFileName: '', mediaFileSize: 0,
};

const C = {
  page:      { background: '#0f1923', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#f8f6f2' },
  topBar:    { background: '#0a1118', borderBottom: '1px solid #1e2d3d', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky' as const, top: 0, zIndex: 10 },
  backBtn:   { background: 'none', border: '1px solid #1e2d3d', borderRadius: 2, padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: '#8fa0b7', fontFamily: 'Arial, sans-serif' },
  body:      { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 0, minHeight: 'calc(100vh - 53px)' },
  sidebar:   { background: '#0a1118', borderRight: '1px solid #1e2d3d', padding: '24px 0' },
  stepBtn:   (active: boolean, done: boolean) => ({ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 20px', background: active ? 'rgba(27,61,123,0.25)' : 'none', borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: active ? '3px solid #1b3d7b' : '3px solid transparent', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: active ? 700 : 400, color: active ? '#f8f6f2' : done ? '#4a8f4a' : '#8fa0b7', textAlign: 'left' as const }),
  stepDot:   (done: boolean, active: boolean) => ({ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#1a6e1a' : active ? '#1b3d7b' : '#1e2d3d', border: active ? '2px solid #4a7fd4' : 'none' }),
  main:      { padding: '32px 40px', maxWidth: 820 },
  heading:   { fontFamily: 'Arial Black, sans-serif', fontSize: 20, fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#f8f6f2', marginBottom: 6 },
  subtext:   { fontSize: 12, color: '#8fa0b7', marginBottom: 24 },
  label:     { display: 'block', fontSize: 10, fontWeight: 700, color: '#8fa0b7', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  input:     { width: '100%', padding: '10px 12px', background: '#0a1118', border: '1px solid #1e2d3d', borderRadius: 2, fontSize: 13, color: '#f8f6f2', fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box' as const },
  textarea:  { width: '100%', padding: '10px 12px', background: '#0a1118', border: '1px solid #1e2d3d', borderRadius: 2, fontSize: 13, color: '#f8f6f2', fontFamily: 'Arial, sans-serif', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, minHeight: 90 },
  select:    { width: '100%', padding: '10px 12px', background: '#0a1118', border: '1px solid #1e2d3d', borderRadius: 2, fontSize: 13, color: '#f8f6f2', fontFamily: 'Arial, sans-serif', outline: 'none' },
  row:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  field:     { marginBottom: 16 },
  btnPrimary:(busy: boolean) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: busy ? '#1e2d3d' : '#1b3d7b', border: 'none', borderRadius: 2, color: '#f8f6f2', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'Arial Black, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 900 }),
  btnGhost:  { padding: '11px 24px', background: 'none', border: '1px solid #1e2d3d', borderRadius: 2, color: '#8fa0b7', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 12 },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  toggle:    (on: boolean) => ({ width: 36, height: 20, borderRadius: 10, background: on ? '#1b3d7b' : '#1e2d3d', position: 'relative' as const, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }),
  toggleKnob:(on: boolean) => ({ position: 'absolute' as const, top: 3, left: on ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: '#f8f6f2', transition: 'left 0.2s' }),
  divider:   { borderTop: '1px solid #1e2d3d', margin: '24px 0' },
  hint:      { fontSize: 11, color: '#4a5e72', marginTop: 5 },
  tag:       { display: 'inline-block', padding: '3px 8px', background: '#1e2d3d', borderRadius: 2, fontSize: 10, color: '#8fa0b7', marginRight: 6, marginBottom: 4 },
  error:     { fontSize: 11, color: '#e05c5c', marginTop: 4 },
  progressBar: { height: 4, background: '#1e2d3d', borderRadius: 2, overflow: 'hidden', marginTop: 8 },
};

function Progress({ pct }: { pct: number }) {
  return <div style={C.progressBar}><div style={{ height: '100%', width: `${pct}%`, background: '#1b3d7b', transition: 'width 0.3s' }} /></div>;
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={C.toggleRow} onClick={() => onChange(!on)}>
      <div style={C.toggle(on)}><div style={C.toggleKnob(on)} /></div>
      <span style={{ fontSize: 12, color: on ? '#f8f6f2' : '#8fa0b7', cursor: 'pointer' }}>{label}</span>
    </div>
  );
}

function TypeCard({ ct, selected, onSelect }: { ct: typeof CONTENT_TYPES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} style={{ background: selected ? 'rgba(27,61,123,0.3)' : '#0a1118', border: selected ? '2px solid #1b3d7b' : '2px solid #1e2d3d', borderRadius: 4, padding: '20px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}>
      <div style={{ color: selected ? '#4a7fd4' : '#8fa0b7', marginBottom: 10 }}><ct.Icon /></div>
      <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 13, fontWeight: 900, color: selected ? '#f8f6f2' : '#c0ccd8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{ct.label}</div>
      <div style={{ fontSize: 11, color: '#4a5e72', lineHeight: 1.4 }}>{ct.desc}</div>
    </button>
  );
}

function ImageField({ label, hint, value, onChange, fieldKey, slug, bucketKey }: {
  label: string; hint: string; value: string; onChange: (url: string) => void;
  fieldKey: string; slug: string; bucketKey: string;
}) {
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    const token = localStorage.getItem('admin_token');
    setPct(0); setErr('');
    try {
      const result = await xhrUpload(
        `${API}/api/uploads/image?folder=content&assetType=${fieldKey}&contentType=${encodeURIComponent(bucketKey)}&slug=${encodeURIComponent(slug || 'new')}`,
        file, token, setPct,
      );
      onChange(result?.url ?? result?.data?.url ?? '');
    } catch (e: any) { setErr(e.message); }
    finally { setTimeout(() => setPct(null), 1200); }
  }

  return (
    <div style={C.field}>
      <label style={C.label}>{label}</label>
      <div style={{ fontSize: 11, color: '#4a5e72', marginBottom: 8 }}>{hint}</div>
      {value && (
        <div style={{ position: 'relative', marginBottom: 8, height: fieldKey === 'poster' ? 140 : 80, border: '1px solid #1e2d3d', borderRadius: 2, overflow: 'hidden' }}>
          <img src={value} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => onChange('')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: 2, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}>✕</button>
        </div>
      )}
      {pct !== null && <Progress pct={pct} />}
      {err && <div style={C.error}>{err}</div>}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
      <button style={{ ...C.btnGhost, fontSize: 11, padding: '8px 14px' }} onClick={() => ref.current?.click()}>
        {value ? 'Replace' : 'Upload'} {label}
      </button>
    </div>
  );
}

function SeriesStep({ form, setForm, seriesList }: { form: Form; setForm: React.Dispatch<React.SetStateAction<Form>>; seriesList: Series[] }) {
  const set = (k: keyof Form, v: any) => setForm({ ...form, [k]: v });
  return (
    <div>
      <div style={C.heading}>Series</div>
      <div style={C.subtext}>Link this episode to an existing series or start a new one.</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['existing', 'new'] as const).map(mode => (
          <button key={mode} onClick={() => set('seriesMode', mode)} style={{ padding: '8px 20px', borderRadius: 2, border: form.seriesMode === mode ? '2px solid #1b3d7b' : '2px solid #1e2d3d', background: form.seriesMode === mode ? 'rgba(27,61,123,0.25)' : '#0a1118', color: form.seriesMode === mode ? '#f8f6f2' : '#8fa0b7', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: form.seriesMode === mode ? 700 : 400 }}>
            {mode === 'existing' ? 'Add to Existing Series' : 'Create New Series'}
          </button>
        ))}
      </div>
      {form.seriesMode === 'existing' ? (
        <div style={C.field}>
          <label style={C.label}>Select Series</label>
          {seriesList.length === 0
            ? <div style={{ fontSize: 12, color: '#4a5e72', padding: '12px 0' }}>No series yet — use "Create New Series" above.</div>
            : <select style={C.select} value={form.seriesId} onChange={e => { const s = seriesList.find(s => s.seriesId === e.target.value); setForm({ ...form, seriesId: e.target.value, seriesTitle: s?.title ?? '' }); }}>
                <option value="">— Choose a series —</option>
                {seriesList.map(s => <option key={s.seriesId} value={s.seriesId}>{s.title} ({s.totalEpisodes} ep{s.totalEpisodes !== 1 ? 's' : ''})</option>)}
              </select>
          }
        </div>
      ) : (
        <>
          <div style={C.field}>
            <label style={C.label}>Series Title *</label>
            <input style={C.input} value={form.seriesTitle} placeholder="e.g. The Lagos Chronicles" onChange={e => { const title = e.target.value; setForm({ ...form, seriesTitle: title, seriesId: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }); }} />
          </div>
          <div style={C.field}>
            <label style={C.label}>Series Description</label>
            <textarea style={C.textarea} rows={3} value={form.seriesDesc} placeholder="What is this series about?" onChange={e => set('seriesDesc', e.target.value)} />
          </div>
        </>
      )}
      <div style={C.divider} />
      <div style={C.row}>
        <div><label style={C.label}>Season</label><input style={C.input} type="number" min="1" value={form.season} onChange={e => set('season', e.target.value)} /></div>
        <div><label style={C.label}>Episode Number</label><input style={C.input} type="number" min="1" value={form.episode} placeholder="e.g. 3" onChange={e => set('episode', e.target.value)} /></div>
      </div>
      <div style={C.field}>
        <label style={C.label}>Episode Title</label>
        <input style={C.input} value={form.episodeTitle} placeholder="e.g. The Return" onChange={e => set('episodeTitle', e.target.value)} />
        <div style={C.hint}>Optional — shown in episode list instead of the main title</div>
      </div>
    </div>
  );
}

function ReviewCard({ form }: { form: Form }) {
  const ct = CONTENT_TYPES.find(c => c.key === form.type);
  const fields: [string, string][] = [
    ['Type',     ct?.label ?? ''],
    ['Title',    form.title],
    ['Genre',    form.genre],
    ['Year',     form.releaseYear],
    ['Duration', form.displayDuration || '—'],
    ['Host',     form.hostName || '—'],
    ...(form.type === 'tv_episode' ? [['Series', form.seriesTitle], ['Episode', `S${form.season.padStart(2,'0')}E${(form.episode||'?').padStart(2,'0')}`]] as [string,string][] : []),
    ['Media',    form.mediaUrl ? `✓ Uploaded (${form.mediaFileName})` : '⚠ No media — will save as draft'],
    ['Poster',   form.posterUrl ? '✓ Set' : '—'],
    ['Backdrop', form.backdropUrl ? '✓ Set' : '—'],
  ];
  return (
    <div style={{ background: '#0a1118', border: '1px solid #1e2d3d', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 16, padding: 16 }}>
        {form.posterUrl && <img src={form.posterUrl} alt="poster" style={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />}
        {form.backdropUrl && !form.posterUrl && <img src={form.backdropUrl} alt="backdrop" style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          {fields.map(([k, v]) => v ? (
            <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: '#4a5e72', width: 72, flexShrink: 0 }}>{k}</span>
              <span style={{ color: k === 'Media' && !form.mediaUrl ? '#e09b4a' : '#c0ccd8', fontWeight: 600 }}>{v}</span>
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  );
}

export default function ContentUploadPage() {
  const router = useRouter();
  const [form,       setForm]       = useState<Form>(INIT);
  const [step,       setStep]       = useState<Step>('Type');
  const [hosts,      setHosts]      = useState<Host[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [busy,       setBusy]       = useState(false);
  const [published,  setPublished]  = useState<{ id: string; title: string } | null>(null);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const setF = useCallback((k: keyof Form, v: any) => setForm(p => ({ ...p, [k]: v })), []);

  useEffect(() => {
    apiFetch<{ hosts: Host[] }>('/api/content/admin/hosts', { hosts: [] }).then(r => setHosts(r.hosts));
    apiFetch<{ series: Series[] }>('/api/content/admin/series', { series: [] }).then(r => setSeriesList(r.series));
  }, []);

  const visibleSteps = STEPS.filter(s => s !== 'Series' || form.type === 'tv_episode');
  const stepIndex = (s: Step) => visibleSteps.indexOf(s);
  const isDone    = (s: Step) => stepIndex(s) < stepIndex(step);
  const isActive  = (s: Step) => s === step;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (step === 'Type'   && !form.type)         e.type       = 'Choose a content type';
    if (step === 'Details'&& !form.title.trim()) e.title      = 'Title is required';
    if (step === 'Series' && form.seriesMode === 'new'      && !form.seriesTitle.trim()) e.seriesTitle = 'Series title is required';
    if (step === 'Series' && form.seriesMode === 'existing' && !form.seriesId)           e.seriesId    = 'Select a series';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() { if (!validate()) return; const i = stepIndex(step); if (i < visibleSteps.length - 1) setStep(visibleSteps[i + 1]); }
  function back() { const i = stepIndex(step); if (i > 0) setStep(visibleSteps[i - 1]); }

  async function publish(asDraft = false) {
    if (!validate()) return;
    setBusy(true);

    const MEDIA_TYPE_MAP: Record<string, string> = { tv_episode: 'tvshow', movie: 'movie', stage_play: 'stageplay', podcast: 'podcast', reelfilm: 'reelfilm', minisode: 'miniseries', music: 'music' };
    const AUDIO_TYPES = new Set(['podcast', 'music']);
    const hasMedia = !!(form.mediaUrl && form.mediaFileName && form.mediaFileSize > 0);

    try {
      const payload: any = {
        mediaType:       MEDIA_TYPE_MAP[form.type] ?? form.type,
        ...(hasMedia ? { type: AUDIO_TYPES.has(form.type) ? 'audio' : 'video', storageMethod: 'r2', fileName: form.mediaFileName, fileSize: form.mediaFileSize } : {}),
        genre:           form.genre ? [form.genre] : [],
        title:           form.title,
        description:     form.description,
        releaseYear:     form.releaseYear ? Number(form.releaseYear) : undefined,
        isPremium:       form.isPremium,
        isFeatured:      form.isFeatured,
        isNewContent:    form.isNewContent,
        displayDuration: form.displayDuration || undefined,
        status:          asDraft ? 'draft' : (hasMedia ? 'ready' : 'draft'),
        hostId:          form.hostId   || undefined,
        hostSlug:        form.hostSlug || undefined,
        hostName:        form.hostName || undefined,
        director:        form.director || undefined,
        cast:            form.cast ? form.cast.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        images:          { poster: form.posterUrl || undefined, backdrop: form.backdropUrl || undefined },
        mediaUrl:        form.mediaUrl || undefined,
        ...(form.type === 'tv_episode' ? {
          seriesId: form.seriesId, season: Number(form.season) || 1, episode: Number(form.episode) || undefined,
          series: { title: form.seriesTitle, description: form.seriesDesc },
          metadata: { episodeTitle: form.episodeTitle || undefined },
        } : {}),
      };

      const res = await fetch(`${API}/api/uploads/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const contentId = data?.data?._id ?? data?._id;
      setPublished({ id: contentId, title: form.title });
    } catch (e: any) {
      setErrors({ publish: e.message });
    } finally { setBusy(false); }
  }

  if (published) {
    return (
      <div style={{ ...C.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ color: '#4a8f4a', marginBottom: 20 }}>
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round"/></svg>
          </div>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Content Created</div>
          <div style={{ fontSize: 13, color: '#8fa0b7', marginBottom: 28, lineHeight: 1.6 }}>
            <strong style={{ color: '#f8f6f2' }}>{published.title}</strong> has been submitted.<br />
            {form.mediaUrl ? 'It will appear on the platform shortly.' : 'Saved as draft — upload media to publish.'}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => { setForm(INIT); setStep('Type'); setPublished(null); }} style={C.btnPrimary(false)}>Upload Another</button>
            <button onClick={() => router.push('/dashboard/watch')} style={C.btnGhost}>Back to Watch</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={C.page}>
      <div style={C.topBar}>
        <button style={C.backBtn} onClick={() => router.push('/dashboard/watch')}>← Watch</button>
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f8f6f2' }}>Upload Content</span>
        {form.type && <span style={{ marginLeft: 8, ...C.tag }}>{CONTENT_TYPES.find(c => c.key === form.type)?.label}</span>}
      </div>

      <div style={C.body}>
        <div style={C.sidebar}>
          <div style={{ padding: '0 20px 16px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a5e72', fontWeight: 700 }}>Steps</div>
          {visibleSteps.map((s, i) => (
            <button key={s} style={C.stepBtn(isActive(s), isDone(s))} onClick={() => isDone(s) && setStep(s)}>
              <div style={C.stepDot(isDone(s), isActive(s))}>
                {isDone(s)
                  ? <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeLinecap="round"/></svg>
                  : <span style={{ fontSize: 9, fontWeight: 700, color: isActive(s) ? '#f8f6f2' : '#4a5e72' }}>{i+1}</span>
                }
              </div>
              {s}
            </button>
          ))}
        </div>

        <div style={C.main}>

          {step === 'Type' && (
            <div>
              <div style={C.heading}>What are you uploading?</div>
              <div style={C.subtext}>Choose the content type — this determines metadata fields and storage bucket.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
                {CONTENT_TYPES.map(ct => <TypeCard key={ct.key} ct={ct} selected={form.type === ct.key} onSelect={() => setF('type', ct.key)} />)}
              </div>
              {errors.type && <div style={C.error}>{errors.type}</div>}
            </div>
          )}

          {step === 'Details' && (
            <div>
              <div style={C.heading}>Details</div>
              <div style={C.subtext}>Core metadata — this is what viewers see on the watch page.</div>
              <div style={C.field}><label style={C.label}>Title *</label><input style={C.input} value={form.title} placeholder="e.g. The Last Kingdom" onChange={e => setF('title', e.target.value)} />{errors.title && <div style={C.error}>{errors.title}</div>}</div>
              <div style={C.field}><label style={C.label}>Description</label><textarea style={C.textarea} rows={4} value={form.description} placeholder="Synopsis shown on the content detail page…" onChange={e => setF('description', e.target.value)} /></div>
              <div style={C.row}>
                <div><label style={C.label}>Genre</label><select style={C.select} value={form.genre} onChange={e => setF('genre', e.target.value)}><option value="">— Select genre —</option>{(form.type ? GENRES_BY_TYPE[form.type] : []).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><label style={C.label}>Release Year</label><input style={C.input} type="number" min="1900" max="2099" value={form.releaseYear} onChange={e => setF('releaseYear', e.target.value)} /></div>
              </div>
              <div style={C.row}>
                <div><label style={C.label}>Duration</label><input style={C.input} value={form.displayDuration} placeholder="e.g. 1h 42m" onChange={e => setF('displayDuration', e.target.value)} /></div>
                <div><label style={C.label}>Director</label><input style={C.input} value={form.director} placeholder="e.g. Ngozi Adichie" onChange={e => setF('director', e.target.value)} /></div>
              </div>
              <div style={C.field}><label style={C.label}>Cast</label><input style={C.input} value={form.cast} placeholder="Comma-separated: Actor A, Actor B" onChange={e => setF('cast', e.target.value)} /><div style={C.hint}>Separate names with commas</div></div>
              <div style={C.divider} />
              <div style={{ marginBottom: 4, fontSize: 11, color: '#8fa0b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Flags</div>
              <Toggle on={form.isPremium}    onChange={v => setF('isPremium', v)}    label="Premium — subscription required to watch" />
              <Toggle on={form.isNewContent} onChange={v => setF('isNewContent', v)} label='Show "NEW" badge on watch page' />
              <Toggle on={form.isFeatured}   onChange={v => setF('isFeatured', v)}   label="Set as hero item on watch page (replaces current hero)" />
            </div>
          )}

          {step === 'Series' && <SeriesStep form={form} setForm={setForm} seriesList={seriesList} />}

          {step === 'Host' && (
            <div>
              <div style={C.heading}>Host Assignment</div>
              <div style={C.subtext}>Assign this content to a host so it appears on their profile page.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
                <button onClick={() => setForm({ ...form, hostId: '', hostSlug: '', hostName: '' })} style={{ border: !form.hostId ? '2px solid #1b3d7b' : '2px solid #1e2d3d', background: !form.hostId ? 'rgba(27,61,123,0.2)' : '#0a1118', borderRadius: 4, padding: '16px 12px', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e2d3d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#4a5e72' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round"/><circle cx="12" cy="7" r="4"/></svg></div>
                  <div style={{ fontSize: 11, color: !form.hostId ? '#f8f6f2' : '#4a5e72' }}>No Host</div>
                </button>
                {hosts.map(h => (
                  <button key={h._id} onClick={() => setForm({ ...form, hostId: h._id, hostSlug: h.slug, hostName: h.name })} style={{ border: form.hostId === h._id ? '2px solid #1b3d7b' : '2px solid #1e2d3d', background: form.hostId === h._id ? 'rgba(27,61,123,0.2)' : '#0a1118', borderRadius: 4, padding: '16px 12px', cursor: 'pointer', textAlign: 'center' }}>
                    {h.avatarUrl ? <img src={h.avatarUrl} alt={h.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 8px' }} /> : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1b3d7b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontFamily: 'Arial Black', fontSize: 18, color: '#f8f6f2' }}>{h.name[0]}</div>}
                    <div style={{ fontSize: 11, fontWeight: form.hostId === h._id ? 700 : 400, color: form.hostId === h._id ? '#f8f6f2' : '#8fa0b7', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{h.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'Media' && (
            <div>
              <div style={C.heading}>Media File</div>
              <div style={C.subtext}>
                {form.type === 'podcast' || form.type === 'music'
                  ? 'Upload the audio or video file. Stored directly in your R2 bucket.'
                  : 'Upload the video file. Stored in your R2 bucket.'}
              </div>
              {/* KEY FIX: only MediaZone.tsx handles upload — no inline duplicate */}
              <MediaZone
                form={form}
                setForm={setForm}
                apiBase={API}
                bucketKey={BUCKET_KEY[form.type] ?? form.type}
              />
              {!form.mediaUrl && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#0a1118', border: '1px solid #1e2d3d', borderRadius: 2, fontSize: 12, color: '#8fa0b7' }}>
                  <strong style={{ color: '#c0ccd8' }}>Tip:</strong> You can skip media upload and come back later. Content saves as draft until media is attached.
                </div>
              )}
            </div>
          )}

          {step === 'Images' && (
            <div>
              <div style={C.heading}>Images</div>
              <div style={C.subtext}>Poster shown on content cards. Backdrop used in hero banners.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <ImageField label="Poster" hint="Portrait 2:3 — e.g. 600×900px" value={form.posterUrl} onChange={u => setF('posterUrl', u)} fieldKey="poster" slug={form.title} bucketKey={BUCKET_KEY[form.type] ?? 'movie'} />
                <ImageField label="Backdrop" hint="Landscape 16:9 — e.g. 1920×1080px" value={form.backdropUrl} onChange={u => setF('backdropUrl', u)} fieldKey="backdrop" slug={form.title} bucketKey={BUCKET_KEY[form.type] ?? 'movie'} />
              </div>
            </div>
          )}

          {step === 'Publish' && (
            <div>
              <div style={C.heading}>Review & Publish</div>
              <div style={C.subtext}>Check everything looks right before submitting.</div>
              <ReviewCard form={form} />
              {!form.mediaUrl && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(224,155,74,0.1)', border: '1px solid rgba(224,155,74,0.3)', borderRadius: 2, fontSize: 12, color: '#e09b4a' }}>
                  ⚠ No media uploaded — content will be saved as a draft. Go back to Media step to upload.
                </div>
              )}
              {errors.publish && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 2, fontSize: 12, color: '#e05c5c' }}>{errors.publish}</div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button style={C.btnPrimary(busy)} disabled={busy} onClick={() => publish(false)}>{busy ? 'Submitting…' : form.mediaUrl ? 'Publish Content' : 'Save as Draft'}</button>
                <button style={C.btnGhost} disabled={busy} onClick={() => publish(true)}>Save as Draft</button>
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: '#4a5e72', lineHeight: 1.6 }}>
                Publishing creates the content record immediately. Content becomes visible on the watch page once published with media.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 32, paddingTop: 24, borderTop: '1px solid #1e2d3d' }}>
            {step !== 'Type'    && <button style={C.btnGhost} onClick={back}>← Back</button>}
            {step !== 'Publish' && <button style={{ ...C.btnPrimary(false), marginLeft: step === 'Type' ? 0 : 'auto' }} onClick={next}>Continue →</button>}
          </div>

        </div>
      </div>
    </div>
  );
}
