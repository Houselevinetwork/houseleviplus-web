'use client';
/**
 * MediaZone.tsx — Multipart chunked upload
 *
 * FILES ≤ 50 MB  →  POST /api/uploads/media          (simple, through NestJS)
 * FILES  > 50 MB  →  Multipart flow:
 *   1. POST /api/uploads/multipart/init               → jobId, totalParts
 *   2. POST /api/uploads/multipart/part-url (×N)      → presigned PUT URL per chunk
 *      browser PUTs chunk directly to R2, collects ETag from response header
 *   3. POST /api/uploads/multipart/complete           → publicUrl
 *
 * FEATURES:
 *   ✓ 3 chunks upload in parallel — fast on any connection
 *   ✓ Per-chunk retry (3 attempts) — survives brief network drops
 *   ✓ Aggregated progress bar across all chunks
 *   ✓ Clear human-readable error at every failure point
 *   ✓ Navigation blocked while uploading (warning message)
 *   ✓ Success state persists across step navigation
 *   ✓ Replace button to swap the file
 */

import { useState, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Form {
  type:          string;
  title:         string;
  mediaFile:     File | null;
  mediaUrl:      string;
  mediaFileName: string;
  mediaFileSize: number;
}

interface Props {
  form:      Form;
  setForm:   React.Dispatch<React.SetStateAction<any>>;
  apiBase:   string;
  bucketKey: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SMALL_FILE_THRESHOLD = 50 * 1024 * 1024;   // 50 MB — use simple upload below
const CHUNK_SIZE            = 50 * 1024 * 1024;   // 50 MB chunks for multipart
const PARALLEL_PARTS        = 3;                   // upload 3 chunks simultaneously
const MAX_RETRIES           = 3;                   // retry a failed chunk this many times

const CONTENT_TYPE_META: { key: string; label: string; accept: string }[] = [
  { key: 'movie',      label: 'Movie',      accept: 'video/*' },
  { key: 'tv_episode', label: 'TV Episode', accept: 'video/*' },
  { key: 'stage_play', label: 'Stage Play', accept: 'video/*' },
  { key: 'podcast',    label: 'Podcast',    accept: 'audio/*,video/*' },
  { key: 'reelfilm',   label: 'Short Film', accept: 'video/*' },
  { key: 'minisode',   label: 'Minisode',   accept: 'video/*' },
  { key: 'music',      label: 'Music',      accept: 'audio/*,video/*' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024)        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function authHeaders(): Record<string, string> {
  const t = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// PUT one chunk directly to R2 via presigned URL.
// Returns the ETag R2 puts in the response header.
function putChunk(
  uploadUrl: string,
  chunk: Blob,
  mimeType: string,
  onProgress: (loaded: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', mimeType);

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(e.loaded);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // ETag comes back in the response header — required for CompleteMultipartUpload
        const etag = xhr.getResponseHeader('ETag') ?? xhr.getResponseHeader('etag') ?? '';
        if (!etag) {
          reject(new Error(
            `R2 did not return an ETag for this part (HTTP ${xhr.status}). ` +
            `Check that your CORS policy exposes the ETag header.`
          ));
        } else {
          resolve(etag.replace(/"/g, '')); // strip surrounding quotes R2 sometimes adds
        }
      } else {
        reject(new Error(`R2 rejected chunk (HTTP ${xhr.status})`));
      }
    };

    xhr.onerror   = () => reject(new Error('Network error uploading chunk'));
    xhr.ontimeout = () => reject(new Error('Chunk upload timed out'));
    xhr.send(chunk);
  });
}

// Retry wrapper — attempts fn up to maxRetries times with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number, label: string): Promise<T> {
  let lastErr: Error = new Error('Unknown error');
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      if (attempt < maxRetries) {
        const delay = attempt * 1500; // 1.5s, 3s, 4.5s
        console.warn(`[MediaZone] ${label} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, e.message);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressBar({ pct, color = '#1b3d7b' }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 5, background: '#1e2d3d', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, transition: 'width 0.2s' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function MediaZone({ form, setForm, apiBase, bucketKey }: Props) {
  const [pct,       setPct]       = useState(0);
  const [status,    setStatus]    = useState('');
  const [err,       setErr]       = useState('');
  const [uploading, setUploading] = useState(false);
  const [drag,      setDrag]      = useState(false);
  const ref                       = useRef<HTMLInputElement>(null);
  const abortRef                  = useRef<(() => void) | null>(null); // called on Replace
  const ct                        = CONTENT_TYPE_META.find(c => c.key === form.type);
  const isAudio                   = form.type === 'podcast' || form.type === 'music';

  // Warn the user if they try to close the tab during an upload
  useEffect(() => {
    if (!uploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Upload in progress — leaving will cancel it.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [uploading]);

  // ── Already uploaded — show success card ────────────────────────────────
  if (form.mediaUrl) {
    return (
      <div style={{ background: '#0a1118', border: '1px solid #1a6e1a', borderRadius: 4, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: '#4a8f4a', flexShrink: 0 }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/>
              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4a8f4a' }}>Media uploaded</div>
            <div style={{ fontSize: 11, color: '#4a5e72', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.mediaFileName || 'File ready'}
              {form.mediaFileSize > 0 && ` · ${fmtSize(form.mediaFileSize)}`}
            </div>
          </div>
          <button
            onClick={() => {
              abortRef.current?.();
              setForm((p: any) => ({ ...p, mediaFile: null, mediaUrl: '', mediaFileName: '', mediaFileSize: 0 }));
            }}
            style={{ padding: '6px 12px', background: 'none', border: '1px solid #1e2d3d', borderRadius: 2, color: '#8fa0b7', cursor: 'pointer', fontSize: 11, flexShrink: 0 }}
          >
            Replace
          </button>
        </div>
      </div>
    );
  }

  // ── Simple upload for files ≤ 50 MB ──────────────────────────────────────
  async function uploadSmall(file: File): Promise<void> {
    const token    = localStorage.getItem('admin_token');
    const safeSlug = (form.title || 'upload').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
    const url      = `${apiBase}/api/uploads/media?contentType=${encodeURIComponent(bucketKey)}&slug=${encodeURIComponent(safeSlug)}`;

    await new Promise<void>((resolve, reject) => {
      const fd  = new FormData();
      fd.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const p = Math.round(e.loaded / e.total * 100);
          setPct(p);
          setStatus(p < 100 ? `Uploading… ${p}%` : 'Finalising…');
        }
      };

      xhr.onload = () => {
        let result: any;
        try { result = JSON.parse(xhr.responseText); } catch {
          reject(new Error(
            `Server returned a non-JSON response (HTTP ${xhr.status}). ` +
            `This usually means a gateway timeout — try again.`
          ));
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300 && result?.url) {
          setForm((p: any) => ({
            ...p,
            mediaFile: file, mediaUrl: result.url,
            mediaFileName: file.name, mediaFileSize: file.size,
          }));
          resolve();
        } else {
          reject(new Error(result?.message || `Upload failed — server responded with HTTP ${xhr.status}`));
        }
      };

      xhr.onerror   = () => reject(new Error('Network error — check your connection and try again'));
      xhr.ontimeout = () => reject(new Error('Request timed out'));
      xhr.send(fd);
    });
  }

  // ── Multipart upload for files > 50 MB ───────────────────────────────────
  async function uploadMultipart(file: File): Promise<void> {
    let aborted = false;
    abortRef.current = () => { aborted = true; };

    const safeSlug = (form.title || 'upload').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);

    // ── Step 1: Initiate ──────────────────────────────────────────────────
    setStatus('Preparing upload…');
    const initRes = await fetch(`${apiBase}/api/uploads/multipart/init`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        contentType: bucketKey,
        slug:        safeSlug,
        fileName:    file.name,
        fileSize:    file.size,
        mimeType:    file.type || 'video/mp4',
      }),
    });

    if (!initRes.ok) {
      const txt = await initRes.text();
      let msg = `Could not start upload (HTTP ${initRes.status})`;
      try { msg = JSON.parse(txt)?.message || msg; } catch {}
      throw new Error(msg);
    }

    const { jobId, totalParts, publicUrl } = await initRes.json();

    // ── Step 2: Upload all parts in parallel batches ──────────────────────
    // bytesUploaded[partIndex] tracks progress per chunk for the aggregate bar
    const bytesUploaded = new Array(totalParts).fill(0);
    const totalBytes    = file.size;

    function updateProgress() {
      const uploaded = bytesUploaded.reduce((a, b) => a + b, 0);
      const p        = Math.round(uploaded / totalBytes * 95); // reserve last 5% for complete
      setPct(p);
      setStatus(`Uploading… ${p}% of ${fmtSize(totalBytes)}`);
    }

    const completedParts: { partNumber: number; etag: string }[] = [];

    // Process parts in batches of PARALLEL_PARTS
    for (let batchStart = 1; batchStart <= totalParts; batchStart += PARALLEL_PARTS) {
      if (aborted) throw new Error('Upload cancelled');

      const batchEnd    = Math.min(batchStart + PARALLEL_PARTS - 1, totalParts);
      const batchNums   = Array.from({ length: batchEnd - batchStart + 1 }, (_, i) => batchStart + i);

      await Promise.all(batchNums.map(async partNumber => {
        const partIndex  = partNumber - 1;
        const byteStart  = partIndex * CHUNK_SIZE;
        const byteEnd    = Math.min(byteStart + CHUNK_SIZE, file.size);
        const chunk      = file.slice(byteStart, byteEnd);

        // Get presigned URL for this part
        const partUrlRes = await withRetry(async () => {
          const r = await fetch(`${apiBase}/api/uploads/multipart/part-url`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ jobId, partNumber }),
          });
          if (!r.ok) throw new Error(`Failed to get part URL (HTTP ${r.status})`);
          return r.json();
        }, MAX_RETRIES, `part-url part ${partNumber}`);

        // Upload chunk directly to R2
        const etag = await withRetry(
          () => putChunk(
            partUrlRes.uploadUrl,
            chunk,
            file.type || 'video/mp4',
            loaded => {
              bytesUploaded[partIndex] = loaded;
              updateProgress();
            },
          ),
          MAX_RETRIES,
          `chunk upload part ${partNumber}`,
        );

        bytesUploaded[partIndex] = byteEnd - byteStart; // mark as fully done
        updateProgress();
        completedParts.push({ partNumber, etag });
      }));
    }

    if (aborted) throw new Error('Upload cancelled');

    // ── Step 3: Complete — tell R2 to assemble ────────────────────────────
    setStatus('Assembling file…');
    setPct(97);

    const completeRes = await withRetry(async () => {
      const r = await fetch(`${apiBase}/api/uploads/multipart/complete`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ jobId, parts: completedParts }),
      });
      if (!r.ok) {
        const txt = await r.text();
        let msg = `Failed to complete upload (HTTP ${r.status})`;
        try { msg = JSON.parse(txt)?.message || msg; } catch {}
        throw new Error(msg);
      }
      return r.json();
    }, MAX_RETRIES, 'complete');

    setPct(100);
    setForm((p: any) => ({
      ...p,
      mediaFile:     file,
      mediaUrl:      completeRes.publicUrl ?? publicUrl,
      mediaFileName: file.name,
      mediaFileSize: file.size,
    }));
  }

  // ── Entry point — routes to simple or multipart based on size ────────────
  async function upload(file: File) {
    setUploading(true);
    setPct(0);
    setErr('');
    setStatus('');

    try {
      if (file.size <= SMALL_FILE_THRESHOLD) {
        await uploadSmall(file);
      } else {
        await uploadMultipart(file);
      }
      setStatus('');
    } catch (e: any) {
      if (e.message !== 'Upload cancelled') {
        setErr(e.message || 'Upload failed — please try again');
      }
    } finally {
      setUploading(false);
      setPct(0);
      abortRef.current = null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => !uploading && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!uploading) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault(); setDrag(false);
          if (!uploading) { const f = e.dataTransfer.files[0]; if (f) upload(f); }
        }}
        style={{
          border:       drag ? '2px dashed #1b3d7b' : '2px dashed #1e2d3d',
          borderRadius: 4,
          padding:      '40px 20px',
          textAlign:    'center',
          cursor:       uploading ? 'not-allowed' : 'pointer',
          background:   drag ? 'rgba(27,61,123,0.1)' : 'transparent',
          opacity:      uploading ? 0.55 : 1,
          transition:   'all 0.15s',
        }}
      >
        <div style={{ color: '#4a5e72', marginBottom: 12 }}>
          <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
            <polyline points="17 8 12 3 7 8" strokeLinecap="round"/>
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#c0ccd8', marginBottom: 4 }}>
          {uploading ? 'Upload in progress…' : `Drop ${ct?.label ?? 'file'} here`}
        </div>
        <div style={{ fontSize: 11, color: '#4a5e72', marginBottom: 8 }}>
          {isAudio ? 'MP3, WAV, MP4, MOV' : 'MP4, MOV, MKV, WebM'} — or click to browse
        </div>
        <div style={{ fontSize: 10, color: '#2a3e52', letterSpacing: '0.05em' }}>
          ≤ 50 MB uploads via server &nbsp;·&nbsp; Larger files upload in parallel chunks directly to storage &nbsp;·&nbsp; Max 10 GB
        </div>
      </div>

      {/* Progress */}
      {uploading && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
            <span style={{ color: '#8fa0b7' }}>{status}</span>
            <span style={{ color: '#4a7fd4', fontWeight: 700 }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
          <div style={{ fontSize: 10, color: '#4a5e72', marginTop: 6 }}>
            ⚠ Do not close this tab or navigate away while uploading
          </div>
        </div>
      )}

      {/* Error */}
      {err && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 2, fontSize: 12, color: '#e05c5c', lineHeight: 1.5 }}>
          <strong>Upload failed:</strong> {err}
          <button
            onClick={() => setErr('')}
            style={{ marginLeft: 10, background: 'none', border: 'none', color: '#e05c5c', cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <input
        ref={ref}
        type="file"
        accept={ct?.accept ?? 'video/*,audio/*'}
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
      />
    </div>
  );
}
