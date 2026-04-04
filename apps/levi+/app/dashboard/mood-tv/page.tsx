'use client';
/**
 * Location: apps/levi+/app/dashboard/mood-tv/page.tsx
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VideoPlayer }      from '../../components/mood-tv/VideoPlayer';
import { ScheduleCarousel } from '../../components/mood-tv/ScheduleCarousel';
import { BrandingSection }  from '../../components/mood-tv/BrandingSection';

interface MoodTVBlock {
  _id:       string;
  name:      string;
  startTime: string;
  endTime:   string;
  videoUrl:  string;
  videoKey:  string;
  isActive:  boolean;
  priority:  number;
  metadata: {
    title:       string;
    description: string;
    genre:       string;
    thumbnail?:  string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_URL not set');
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({})) as any;
    throw new Error(e.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const S = {
  label:    { display: 'block', fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#999', marginBottom: 7 },
  input:    { width: '100%', padding: '10px 13px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '10px 13px', background: '#f8f6f2', border: '1px solid #d8d4cc', fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', outline: 'none', borderRadius: 1, boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 80 },
  mHead:    { padding: '18px 24px', borderBottom: '1px solid #eeebe6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mTitle:   { fontFamily: 'Arial Black, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: '0.06em', color: '#111', textTransform: 'uppercase' as const },
};

const SpinIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>;
const EditIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>;
const UpIcon    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;

function InlineError({ msg }: { msg: string }) {
  return <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#a0291e', padding: '10px 14px', background: 'rgba(160,41,30,0.07)', border: '1px solid rgba(160,41,30,0.15)', borderRadius: 1, marginTop: 4, lineHeight: 1.5 }}>{msg}</div>;
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,22,0.78)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
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

const GENRE_COLORS: Record<string, string> = {
  Jazz: '#5a3d91', Music: '#1b5e8a', Podcast: '#a0521e', Ambient: '#2e6b4f', default: '#555',
};

// ── Upload Video Modal ────────────────────────────────────────
function UploadVideoModal({ block, onClose, onDone }: {
  block:   MoodTVBlock;
  onClose: () => void;
  onDone:  (videoUrl: string, videoKey: string) => void;
}) {
  const [file, setFile]         = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage]       = useState<'idle' | 'presigning' | 'uploading' | 'saving' | 'done' | 'error'>('idle');
  const [err, setErr]           = useState('');
  const inputRef                = useRef<HTMLInputElement>(null);

  // Store presign result so we can retry the save independently
  const presignRef = useRef<{ uploadUrl: string; cloudflareKey: string; publicUrl: string } | null>(null);

  const saveToMongo = async (cloudflareKey: string, publicUrl: string) => {
    setStage('saving');
    try {
      await apiFetch(`/linear-tv/blocks/${block._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ videoUrl: publicUrl, videoKey: cloudflareKey }),
      });
      setStage('done');
      setTimeout(() => { onDone(publicUrl, cloudflareKey); onClose(); }, 1000);
    } catch (e) {
      // Save failed — show error with the URL so admin can retry manually
      const msg = e instanceof Error ? e.message : 'Save failed';
      setErr(
        `⚠️ Video uploaded to R2 successfully but failed to save to database: ${msg}\n\n` +
        `R2 Key: ${cloudflareKey}\n` +
        `Public URL: ${publicUrl}\n\n` +
        `Click "Save URL Manually" below to retry.`
      );
      setStage('error');
    }
  };

  const handleUpload = async () => {
    if (!file) { setErr('Please select a video file'); return; }
    setErr(''); setStage('presigning');
    try {
      const presign = await apiFetch<{ uploadUrl: string; cloudflareKey: string; publicUrl: string }>(
        '/linear-tv/blocks/presign',
        { method: 'POST', body: JSON.stringify({ fileName: file.name }) },
      );
      presignRef.current = presign;

      setStage('uploading');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presign.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload  = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`R2 upload failed with status ${xhr.status}`));
        xhr.onerror = () => reject(new Error('Network error during R2 upload — check CORS policy on ltv bucket'));
        xhr.send(file);
      });

      await saveToMongo(presign.cloudflareKey, presign.publicUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
      setStage('error');
    }
  };

  // Retry just the save step (upload already in R2)
  const handleRetrySave = async () => {
    if (!presignRef.current) return;
    setErr('');
    await saveToMongo(presignRef.current.cloudflareKey, presignRef.current.publicUrl);
  };

  const busy = ['presigning', 'uploading', 'saving', 'done'].includes(stage);
  const btnLabel: Record<string, string> = {
    idle: 'Upload Video', presigning: 'Preparing...', uploading: `Uploading ${progress}%`,
    saving: 'Saving...', done: 'Done ✓', error: 'Retry Upload',
  };

  return (
    <Modal>
      <div style={S.mHead}>
        <div>
          <div style={S.mTitle}>Upload Video — {block.name}</div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 2 }}>{block.startTime}–{block.endTime} · {block.metadata.genre}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 22 }}>×</button>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Drop zone */}
        <div
          onClick={() => !busy && inputRef.current?.click()}
          style={{ height: 140, border: `2px dashed ${file ? '#00B77F' : '#d8d4cc'}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy ? 'default' : 'pointer', background: file ? 'rgba(0,183,127,0.04)' : '#f8f6f2', flexDirection: 'column', gap: 10 }}
        >
          {file ? (
            <>
              <div style={{ color: '#00B77F' }}><CheckIcon /></div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#111', fontWeight: 600 }}>{file.name}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#999' }}>{(file.size / (1024 ** 3)).toFixed(2)} GB · {Math.round(file.size / (1024 ** 2))} MB</div>
            </>
          ) : (
            <>
              <div style={{ color: '#bbb' }}><UpIcon /></div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#555' }}>Click to select video</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>MP4 · MOV · Large files supported</div>
            </>
          )}
          <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setErr(''); }}} />
        </div>

        {/* Upload progress */}
        {stage === 'uploading' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Uploading to Cloudflare R2 — keep this tab open</span>
              <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 12, color: '#111' }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: '#eeebe6', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #1b3d7b, #0f1923)', borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#bbb', marginTop: 6 }}>
              {progress < 100 ? `${Math.round((progress / 100) * (file?.size ?? 0) / (1024 ** 2))} MB of ${Math.round((file?.size ?? 0) / (1024 ** 2))} MB transferred` : 'Processing...'}
            </div>
          </div>
        )}

        {/* Saving indicator */}
        {stage === 'saving' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(27,61,123,0.06)', borderRadius: 1 }}>
            <SpinIcon />
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#1b3d7b' }}>Upload complete — saving to database...</span>
          </div>
        )}

        {/* Existing video info */}
        {block.videoUrl && stage === 'idle' && (
          <div style={{ padding: '9px 12px', background: '#f8f6f2', borderRadius: 1, fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#555' }}>
            <span style={{ color: '#999', marginRight: 8 }}>Current:</span>
            <a href={block.videoUrl} target="_blank" rel="noreferrer" style={{ color: '#1b3d7b' }}>{block.videoKey.split('/').pop()}</a>
            <span style={{ color: '#bbb', marginLeft: 8 }}>(will be replaced)</span>
          </div>
        )}

        {/* Success */}
        {stage === 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(0,183,127,0.08)', borderRadius: 1, fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#00B77F' }}>
            <CheckIcon /> Video uploaded and saved successfully
          </div>
        )}

        {/* Error — with retry save button if upload completed */}
        {err && (
          <>
            <InlineError msg={err} />
            {presignRef.current && stage === 'error' && (
              <button
                onClick={handleRetrySave}
                style={{ padding: '10px 16px', background: '#1b3d7b', border: 'none', cursor: 'pointer', fontFamily: 'Arial Black, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}
              >
                Save URL to Database (Retry)
              </button>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #eeebe6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', background: 'none', border: '1px solid #d8d4cc', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', borderRadius: 1 }}>
          {stage === 'done' ? 'Close' : 'Cancel'}
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || busy}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: !file || busy ? '#aaa' : stage === 'done' ? '#00B77F' : '#0f1923', border: 'none', cursor: !file || busy ? 'not-allowed' : 'pointer', fontFamily: 'Arial Black, sans-serif', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}
        >
          {['presigning', 'uploading', 'saving'].includes(stage) && <SpinIcon />}
          {btnLabel[stage]}
        </button>
      </div>
    </Modal>
  );
}

// ── Edit Block Modal ──────────────────────────────────────────
function EditBlockModal({ block, onClose, onSave }: {
  block:   MoodTVBlock;
  onClose: () => void;
  onSave:  (b: MoodTVBlock) => void;
}) {
  const [form, setForm] = useState({
    name: block.name, startTime: block.startTime, endTime: block.endTime,
    title: block.metadata.title, description: block.metadata.description, genre: block.metadata.genre,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.startTime || !form.endTime) { setErr('Name and times are required'); return; }
    setSaving(true); setErr('');
    try {
      const updated = await apiFetch<MoodTVBlock>(`/linear-tv/blocks/${block._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: form.name, startTime: form.startTime, endTime: form.endTime, metadata: { title: form.title, description: form.description, genre: form.genre } }),
      });
      onSave(updated); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal>
      <div style={S.mHead}>
        <div><div style={S.mTitle}>Edit Block</div><div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', marginTop: 2 }}>Times · Genre · Description</div></div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 22 }}>×</button>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={S.label}>Block Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} style={S.input} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={S.label}>Start (HH:MM) · EAT</label><input value={form.startTime} onChange={e => set('startTime', e.target.value)} placeholder="06:00" style={S.input} /></div>
          <div><label style={S.label}>End (HH:MM) · EAT</label><input value={form.endTime} onChange={e => set('endTime', e.target.value)} placeholder="10:00" style={S.input} /></div>
        </div>
        <div><label style={S.label}>Display Title</label><input value={form.title} onChange={e => set('title', e.target.value)} style={S.input} /></div>
        <div><label style={S.label}>Genre</label><input value={form.genre} onChange={e => set('genre', e.target.value)} placeholder="Jazz / Music / Ambient / Podcast" style={S.input} /></div>
        <div><label style={S.label}>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={S.textarea} /></div>
        {err && <InlineError msg={err} />}
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} label="Save Changes" />
    </Modal>
  );
}

// ── Block Card ────────────────────────────────────────────────
function BlockCard({ block, onEdit, onUpload, onToggle, onDelete }: {
  block:    MoodTVBlock;
  onEdit:   () => void;
  onUpload: () => void;
  onToggle: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const genreColor = GENRE_COLORS[block.metadata.genre] ?? GENRE_COLORS.default;
  const hasVideo   = !!block.videoUrl;

  return (
    <div style={{ background: '#fff', border: `1px solid ${block.isActive ? '#eeebe6' : '#f0eee9'}`, borderRadius: 2, overflow: 'hidden', opacity: block.isActive ? 1 : 0.6 }}>
      <div style={{ background: block.isActive ? '#0f1923' : '#888', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 13, color: '#fff' }}>{block.startTime} – {block.endTime} <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, opacity: 0.6, marginLeft: 4 }}>EAT</span></div>
        <button
          onClick={async () => { setToggling(true); try { await onToggle(); } finally { setToggling(false); } }}
          disabled={toggling}
          style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}
        >
          {toggling ? '...' : block.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 13, color: '#111', marginBottom: 3 }}>{block.name}</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#777', lineHeight: 1.5 }}>{block.metadata.description}</div>
          </div>
          <span style={{ marginLeft: 10, flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, background: `${genreColor}18`, color: genreColor }}>{block.metadata.genre}</span>
        </div>
        <div style={{ marginBottom: 12, padding: '8px 12px', background: hasVideo ? 'rgba(0,183,127,0.06)' : '#f8f6f2', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: hasVideo ? '#00B77F' : '#d8d4cc' }} />
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: hasVideo ? '#00B77F' : '#aaa' }}>
              {hasVideo ? 'Video ready' : 'No video — upload needed'}
            </span>
          </div>
          <button onClick={onUpload} style={{ padding: '5px 12px', background: hasVideo ? 'none' : '#0f1923', border: hasVideo ? '1px solid #d8d4cc' : 'none', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: hasVideo ? '#555' : '#fff', borderRadius: 1 }}>
            {hasVideo ? 'Replace' : 'Upload'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', background: 'none', border: '1px solid #d8d4cc', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', borderRadius: 1 }}>
            <EditIcon /> Edit
          </button>
          <button
            onClick={async () => { if (!confirm(`Delete "${block.name}"? This will also remove the video from R2.`)) return; setDeleting(true); try { await onDelete(); } finally { setDeleting(false); } }}
            disabled={deleting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', background: 'none', border: '1px solid rgba(160,41,30,0.2)', cursor: 'pointer', color: '#a0291e', borderRadius: 1 }}
          >
            {deleting ? <SpinIcon /> : <TrashIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function AdminMoodTVPage() {
  const [blocks, setBlocks]       = useState<MoodTVBlock[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadErr, setLoadErr]     = useState('');
  const [seeding, setSeeding]     = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'preview'>('manage');
  const [nowPlaying, setNowPlaying] = useState<{ block: MoodTVBlock | null; localTime: string; timezone: string } | null>(null);
  const [editBlock,   setEditBlock]   = useState<MoodTVBlock | null>(null);
  const [uploadBlock, setUploadBlock] = useState<MoodTVBlock | null>(null);

  const fetchBlocks = useCallback(async () => {
    if (!API_BASE) { setLoading(false); return; }
    setLoading(true); setLoadErr('');
    try {
      const [data, nowData] = await Promise.all([
        apiFetch<MoodTVBlock[]>('/linear-tv/blocks'),
        apiFetch<any>('/linear-tv/now-playing').catch(() => null),
      ]);
      setBlocks(Array.isArray(data) ? data : []);
      if (nowData) setNowPlaying({ block: nowData.block, localTime: nowData.localTime, timezone: nowData.timezone ?? 'EAT' });
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const handleSeed = async () => {
    setSeeding(true);
    try { await apiFetch('/linear-tv/seed', { method: 'POST' }); await fetchBlocks(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Seed failed'); }
    finally { setSeeding(false); }
  };

  const handleToggle = async (block: MoodTVBlock) => {
    const updated = await apiFetch<MoodTVBlock>(`/linear-tv/blocks/${block._id}/toggle`, { method: 'PATCH', body: JSON.stringify({ isActive: !block.isActive }) });
    setBlocks(v => v.map(b => b._id === block._id ? updated : b));
  };

  const handleDelete = async (block: MoodTVBlock) => {
    await apiFetch(`/linear-tv/blocks/${block._id}`, { method: 'DELETE' });
    setBlocks(v => v.filter(b => b._id !== block._id));
  };

  const videosReady  = blocks.filter(b => b.videoUrl).length;
  const activeBlocks = blocks.filter(b => b.isActive).length;
  const scheduleForCarousel = blocks.map(b => ({ name: b.name, startTime: b.startTime, endTime: b.endTime, metadata: b.metadata }));
  const currentIdx = nowPlaying?.block ? blocks.findIndex(b => b.name === nowPlaying.block!.name) : 0;

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%,100%{background-position:-200% 0}50%{background-position:200% 0}}`}</style>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 18, fontWeight: 900, color: '#111', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>HL Mood TV</h1>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {nowPlaying?.block
              ? `▶ On air: ${nowPlaying.block.name} · ${nowPlaying.localTime} ${nowPlaying.timezone}`
              : `No block active · ${nowPlaying?.localTime ?? ''} ${nowPlaying?.timezone ?? 'EAT'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchBlocks} style={{ padding: '9px 14px', background: 'none', border: '1px solid #d8d4cc', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666', borderRadius: 1 }}>Refresh</button>
          {blocks.length === 0 && !loading && (
            <button onClick={handleSeed} disabled={seeding} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#1b3d7b', border: 'none', cursor: seeding ? 'not-allowed' : 'pointer', fontFamily: 'Arial Black, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}>
              {seeding && <SpinIcon />} Seed Default Schedule
            </button>
          )}
        </div>
      </div>

      {!API_BASE && <div style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(27,61,123,0.05)', border: '1px solid rgba(27,61,123,0.2)', borderRadius: 2, fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555' }}>Set <code>NEXT_PUBLIC_API_URL</code> in <code>.env.local</code></div>}
      {loadErr && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(160,41,30,0.05)', border: '1px solid rgba(160,41,30,0.15)', borderRadius: 2, marginBottom: 20 }}>
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#a0291e' }}>{loadErr}</span>
          <button onClick={fetchBlocks} style={{ padding: '6px 14px', background: '#a0291e', border: 'none', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 10, textTransform: 'uppercase', color: '#fff', borderRadius: 1 }}>Retry</button>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Blocks', value: blocks.length },
          { label: 'Active',       value: activeBlocks },
          { label: 'Videos Ready', value: videosReady, warn: videosReady < blocks.length },
          { label: 'Coverage',     value: `${blocks.length > 0 ? Math.round((videosReady / blocks.length) * 100) : 0}%` },
        ].map(m => (
          <div key={m.label} style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, padding: '16px 18px' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 26, fontWeight: 900, color: (m as any).warn ? '#d97706' : '#111' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eeebe6', marginBottom: 24 }}>
        {(['manage', 'preview'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '11px 18px', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: activeTab === t ? '#111' : '#999', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t ? '#1b3d7b' : 'transparent'}`, cursor: 'pointer', position: 'relative', top: 1, fontWeight: activeTab === t ? 600 : 400 }}>
            {t === 'manage' ? 'Manage Schedule' : 'Preview Channel'}
          </button>
        ))}
      </div>

      {activeTab === 'manage' && (
        loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[0,1,2,3,4,5].map(i => <div key={i} style={{ height: 220, background: 'linear-gradient(90deg,#f4f2ef 0%,#eeebe6 50%,#f4f2ef 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 2 }} />)}
          </div>
        ) : blocks.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #eeebe6', borderRadius: 2, padding: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 14, color: '#111', marginBottom: 8, textTransform: 'uppercase' }}>No Schedule</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#999' }}>Click "Seed Default Schedule" to create the 8 default time blocks.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {blocks.map(block => (
              <BlockCard
                key={block._id}
                block={block}
                onEdit={()   => setEditBlock(block)}
                onUpload={()  => setUploadBlock(block)}
                onToggle={()  => handleToggle(block)}
                onDelete={()  => handleDelete(block)}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'preview' && (
        <div style={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eeebe6' }}>
          <VideoPlayer
            streamUrl={nowPlaying?.block?.videoUrl || undefined}
            currentShow={nowPlaying?.block ? { title: nowPlaying.block.metadata.title, showName: nowPlaying.block.name, startTime: nowPlaying.block.startTime, endTime: nowPlaying.block.endTime } : undefined}
            isLive={true}
          />
          <ScheduleCarousel schedule={scheduleForCarousel} currentBlockIndex={currentIdx >= 0 ? currentIdx : 0} />
          <BrandingSection />
        </div>
      )}

      {uploadBlock && (
        <UploadVideoModal
          block={uploadBlock}
          onClose={() => setUploadBlock(null)}
          onDone={(videoUrl, videoKey) => {
            setBlocks(v => v.map(b => b._id === uploadBlock._id ? { ...b, videoUrl, videoKey } : b));
            setUploadBlock(null);
          }}
        />
      )}
      {editBlock && (
        <EditBlockModal
          block={editBlock}
          onClose={() => setEditBlock(null)}
          onSave={updated => setBlocks(v => v.map(b => b._id === updated._id ? updated : b))}
        />
      )}
    </>
  );
}