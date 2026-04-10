'use client';

export const runtime = 'edge';

/**
 * Location: apps/web/app/watch/[slug]/page.tsx
 *
 * FIX 1: fetch now calls /api/content/watch/:slug (public OptionalJwtAuthGuard)
 *         instead of /api/content/:slug (protected JwtAuthGuard + SubscriptionGuard).
 * FIX 2: response extracted from data.data (formatForWatch shape), not data.item.
 * FIX 3: videoUrl correctly resolved from storage.originalUrl.
 */
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './watch-player.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

interface StorageInfo {
  originalUrl?:        string;
  thumbnail?:          string;
  duration?:           number;
  mimeType?:           string;
  cloudflareStreamId?: string;
  cloudflareKey?:      string;
  provider?:           string;
  size?:               number;
}

interface ContentItem {
  _id:              string;
  title:            string;
  type:             string;
  slug?:            string;
  description?:     string;
  thumbnailUrl?:    string;
  posterUrl?:       string;
  isPremium?:       boolean;
  isNew?:           boolean;
  isNewContent?:    boolean;
  displayDuration?: string;
  hostName?:        string;
  hostSlug?:        string | null;
  year?:            number | null;
  genre?:           string;
  viewCount?:       number;
  storage?:         StorageInfo;
  metadata?:        Record<string, any>;
  series?:          any;
  season?:          number | null;
  episode?:         number | null;
}

export default function WatchSlugPage() {
  const { slug } = useParams() as { slug: string };
  const router   = useRouter();

  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);
      setError('');

      try {
        // ✅ Public endpoint — no auth required for free content
        const res = await fetch(`${API}/api/content/watch/${slug}`);

        if (!res.ok) throw new Error(`${res.status}`);

        const json = await res.json();

        // formatForWatch returns { success: true, data: { ... } }
        const raw: ContentItem = json.data ?? json.item ?? json;

        setContent(raw);
      } catch (e: any) {
        setError(e.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="wp-page wp-page--loading">
      <div className="wp-spinner">
        <div className="wp-spinner__ring" />
      </div>
    </div>
  );

  // ─── Error ───────────────────────────────────────────────────────────────────

  if (error || !content) return (
    <div className="wp-page wp-page--error">
      <h2>Content not found</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        {error === '401'
          ? 'You need to be signed in to view this.'
          : 'This content may have moved or been removed.'}
      </p>
      <button
        onClick={() => router.push('/watch')}
        className="wp-back-link"
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '10px 24px',
          cursor: 'pointer',
          fontSize: 13,
          marginTop: 8,
        }}
      >
        ← Back to Watch
      </button>
    </div>
  );

  // ─── Resolve media ────────────────────────────────────────────────────────────

  const videoUrl           = content.storage?.originalUrl || '';
  const cloudflareStreamId = content.storage?.cloudflareStreamId || '';
  const thumbnailUrl       =
    content.thumbnailUrl    ||
    content.posterUrl       ||
    content.storage?.thumbnail ||
    '';

  // ─── Page ─────────────────────────────────────────────────────────────────────

  return (
    <div className="wp-page">

      {/* ── Media area ── */}
      {videoUrl ? (
        <div className="wp">
          <video
            className="wp__video"
            src={videoUrl}
            controls
            autoPlay
            playsInline
            poster={thumbnailUrl || undefined}
          />
        </div>
      ) : cloudflareStreamId ? (
        <div className="wp">
          <iframe
            src={`https://iframe.cloudflarestream.com/${cloudflareStreamId}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={content.title}
          />
        </div>
      ) : (
        <div className="wp-no-media">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={content.title}
              className="wp-no-media__poster"
            />
          )}
          <div className="wp-no-media__overlay">No video available</div>
        </div>
      )}

      {/* ── Info panel ── */}
      <div className="wp-info">
        <div className="wp-info__inner">

          <Link href="/watch" className="wp-info__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Watch
          </Link>

          <div className="wp-info__header">
            <div className="wp-info__badges">
              {content.type && (
                <span className="wp-badge wp-badge--type">
                  {content.type.replace(/_/g, ' ')}
                </span>
              )}
              {(content.isNew || content.isNewContent) && (
                <span className="wp-badge wp-badge--new">New</span>
              )}
              {content.isPremium && (
                <span className="wp-badge wp-badge--premium">Premium</span>
              )}
              {content.year && (
                <span className="wp-badge wp-badge--year">{content.year}</span>
              )}
              {content.genre && (
                <span className="wp-badge wp-badge--genre">{content.genre}</span>
              )}
            </div>

            <h1 className="wp-info__title">{content.title}</h1>

            {(content.hostName || content.displayDuration) && (
              <p className="wp-info__subtitle">
                {content.hostName && <>by {content.hostName}</>}
                {content.hostName && content.displayDuration && ' · '}
                {content.displayDuration}
              </p>
            )}
          </div>

          {content.description && (
            <p className="wp-info__desc">{content.description}</p>
          )}

          <div className="wp-info__meta">
            {content.hostName && (
              <div className="wp-meta-item">
                <span className="wp-meta-label">Creator</span>
                {content.hostSlug ? (
                  <Link href={`/watch/hosts/${content.hostSlug}`} className="wp-meta-link">
                    {content.hostName}
                  </Link>
                ) : (
                  <span>{content.hostName}</span>
                )}
              </div>
            )}
            {content.series?.title && (
              <div className="wp-meta-item">
                <span className="wp-meta-label">Series</span>
                <span>{content.series.title}</span>
              </div>
            )}
            {(content.season != null || content.episode != null) && (
              <div className="wp-meta-item">
                <span className="wp-meta-label">Episode</span>
                <span>
                  {content.season != null && `S${content.season}`}
                  {content.season != null && content.episode != null && ' · '}
                  {content.episode != null && `E${content.episode}`}
                </span>
              </div>
            )}
            {typeof content.viewCount === 'number' && content.viewCount > 0 && (
              <div className="wp-meta-item">
                <span className="wp-meta-label">Views</span>
                <span>{content.viewCount.toLocaleString()}</span>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}