'use client';
import { useState, useEffect, useRef } from 'react';
import type { NoteFromLevi } from '@houselevi/travel-api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function authHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hl_admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function NoteFromLeviEditor() {
  const [note, setNote] = useState<NoteFromLevi | null>(null);
  const [bodyText, setBodyText] = useState('');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/travel/note`)
      .then(r => r.json())
      .then(data => {
        const n = data.data ?? data;
        setNote(n);
        setBodyText(n.bodyText ?? '');
        setSignaturePreview(n.signatureImageUrl ?? '');
      });
  }, []);

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let signatureImageUrl = note?.signatureImageUrl;
      if (signatureFile) {
        const form = new FormData();
        form.append('image', signatureFile);
        const res = await fetch(`${API}/travel/note/signature`, {
          method: 'POST', headers: authHeader(), body: form,
        });
        if (res.ok) {
          const data = await res.json();
          signatureImageUrl = data.url;
        }
      }
      await fetch(`${API}/travel/note`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyText, signatureImageUrl }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="note-editor">
      <div className="note-editor__header">
        <h2>A Note From Levi</h2>
        <p>This appears publicly on the travel page.</p>
      </div>
      <div className="note-editor__field">
        <label>Note Body</label>
        <textarea value={bodyText} onChange={e => setBodyText(e.target.value)} rows={12} placeholder="Write Levi's personal note here..." />
        <small>Use blank lines to separate paragraphs.</small>
      </div>
      <div className="note-editor__signature">
        <label>Signature Image (optional)</label>
        {signaturePreview ? (
          <div>
            <img src={signaturePreview} alt="Signature" style={{ maxWidth: 200 }} />
            <button type="button" onClick={() => { setSignaturePreview(''); setSignatureFile(null); }}>Remove</button>
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer', padding: '20px', border: '1px dashed #ccc' }}>
            <p>Upload signature image</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleSignatureChange} style={{ display: 'none' }} />
      </div>
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Note'}
      </button>
    </div>
  );
}