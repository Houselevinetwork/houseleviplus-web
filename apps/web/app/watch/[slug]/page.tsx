'use client';

export const runtime = 'edge';

/**
 * Location: apps/web/app/watch/[slug]/page.tsx
 */
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './watch-player.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

interface ContentItem {
  _id: string;
  title: string;
  type: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  isPremium?: boolean;
  duration?: number;
  displayDuration?: string;
  slug?: string;
  hostId?: string;
  hostName?: string;
}

export default function WatchSlugPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/content/${slug}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setContent(data.item ?? data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !content) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 16 }}>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Content not found</p>
      <button onClick={() => router.push('/watch')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 24px', cursor: 'pointer', fontSize: 13 }}>
        Back to Watch
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <nav style={{ marginBottom: 24, fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/watch" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Watch</Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{content.title}</span>
        </nav>

        {content.videoUrl ? (
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', marginBottom: 24 }}>
            <video
              src={content.videoUrl}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', display: 'block' }}
              poster={content.thumbnailUrl}
            />
          </div>
        ) : content.thumbnailUrl ? (
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#111', marginBottom: 24, overflow: 'hidden' }}>
            <img src={content.thumbnailUrl} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#111', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No preview available</span>
          </div>
        )}

        <h1 style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 400, marginBottom: 12, letterSpacing: '-0.01em' }}>{content.title}</h1>

        {content.hostName && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
            by {content.hostName}
            {content.displayDuration && ` • ${content.displayDuration}`}
          </p>
        )}

        {content.isPremium && (
          <div style={{ display: 'inline-block', background: '#D4AF37', color: '#000', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: 16 }}>
            Premium
          </div>
        )}

        {content.description && (
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 720 }}>
            {content.description}
          </p>
        )}
      </div>
    </div>
  );
}