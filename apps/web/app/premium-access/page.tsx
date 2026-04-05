'use client';
/**
 * Location: apps/web/app/premium-access/page.tsx
 *
 * CHANGES IN THIS VERSION:
 *   1. PremiumCard now links to /watch/[slug] Ã¯Â¿Â½ full player experience
 *   2. Single click on card navigates to watch page (primary behaviour)
 *   3. Inline overlay player kept as fallback Ã¯Â¿Â½ triggered via a secondary
 *      "Play here" button on the card for users who don't want to leave the page
 *   4. mimeType now read from play response and passed to inline VideoPlayer
 *   5. handlePlay reads d.playUrl (controller returns playUrl not url)
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@houselevi/auth';
import './premium-access.css';

const API        = process.env.NEXT_PUBLIC_API_URL              ?? 'http://localhost:4000';
const GO_PREMIUM = process.env.NEXT_PUBLIC_GOPREMIUM_URL        ?? 'http://localhost:3004';
const AUTH_URL   = process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL ?? 'http://localhost:3003';

function getToken() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token')       ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

function redirectToLogin() {
  const state = Math.random().toString(36).substring(2, 15);
  const nonce = Math.random().toString(36).substring(2, 15);
  window.location.href = `${AUTH_URL}/login?state=${state}&nonce=${nonce}`;
}

function redirectToGoPremium() {
  const token = getToken();
  window.location.href = token
    ? `${GO_PREMIUM}/choose-plans?t=${encodeURIComponent(token)}`
    : `${GO_PREMIUM}/choose-plans`;
}

// -- Types ---------------------------------------------------------------------
interface ContentItem {
  _id:              string;
  title:            string;
  slug?:            string;
  type?:            string;
  thumbnailUrl?:    string;
  posterUrl?:       string;
  isPremium?:       boolean;
  displayDuration?: string;
  year?:            number;
  genre?:           string;
}

// -- Spinner -------------------------------------------------------------------
function Spinner({ size = 32, color = '#D4AF37' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

// -- Hero ----------------------------------------------------------------------
function PremiumHero({ badge }: { badge?: string }) {
  return (
    <div className="premium-hero">
      <div className="premium-hero__backdrop" />
      <div className="premium-hero__gradient" />
      <div className="premium-hero__content">
        <div className="premium-hero__eyebrow">
          <span className="premium-hero__eyebrow-dot" />
          Premium Access
        </div>
        <h1 className="premium-hero__title">Exclusive Content</h1>
        <p className="premium-hero__subtitle">
          Premium originals, exclusive series and live events Ã¯Â¿Â½ all in one place.
        </p>
        {badge && <div className="premium-hero__badge">{badge}</div>}
      </div>
    </div>
  );
}

// -- Subscription wall ---------------------------------------------------------
function SubscriptionWall({
  title, subtitle, ctaLabel, onCta, secondaryLabel, onSecondary, showFeatures,
}: {
  title: string; subtitle: string; ctaLabel: string; onCta: () => void;
  secondaryLabel?: string; onSecondary?: () => void; showFeatures?: boolean;
}) {
  return (
    <div className="premium-cta-section premium-cta-section--gold">
      <div style={{ marginBottom: 24 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="rgba(212,175,55,0.8)" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="premium-cta-section__title">{title}</h2>
      <p className="premium-cta-section__subtitle">{subtitle}</p>
      {showFeatures && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', textAlign: 'left', maxWidth: 360 }}>
          {['Unlimited premium originals', 'Exclusive series and live events',
            'Early releases before public', 'Ad-free viewing experience',
            'Download for offline viewing'].map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
              <span style={{ color: '#D4AF37', fontSize: 16 }}>?</span> {f}
            </li>
          ))}
        </ul>
      )}
      <button className="premium-btn premium-btn--primary" onClick={onCta}
        style={{ marginBottom: 12 }}>
        {ctaLabel}
      </button>
      {secondaryLabel && onSecondary && (
        <button onClick={onSecondary} style={{ background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
          textDecoration: 'underline' }}>
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}

// -- Content card --------------------------------------------------------------
// PRIMARY action: click card ? navigate to /watch/[slug]  (full player)
// SECONDARY action: "Play here" button ? inline overlay    (fallback)
function PremiumCard({ item, isLoading, onWatchPage, onPlayInline }: {
  item:          ContentItem;
  isLoading:     boolean;
  onWatchPage:   () => void;   // navigate to /watch/[slug]
  onPlayInline:  () => void;   // open inline overlay
}) {
  const image = item.posterUrl || item.thumbnailUrl;

  return (
    <div className="premium-card" style={{ position: 'relative', cursor: 'pointer' }}>

      {/* Main clickable area ? watch page */}
      <div onClick={onWatchPage} style={{ display: 'block' }}>
        <div className="premium-card__thumb-wrap">
          {image
            ? <img src={image} alt={item.title} className="premium-card__thumb" loading="lazy" />
            : <div className="premium-card__thumb-placeholder">{item.title[0]}</div>
          }
          <div className="premium-card__overlay">
            {isLoading
              ? <Spinner size={28} />
              : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )
            }
          </div>
          <div style={{ position: 'absolute', top: 8, left: 8, background: '#D4AF37',
            color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 6px',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            PREMIUM
          </div>
        </div>
        <div className="premium-card__info">
          <h3 className="premium-card__title">{item.title}</h3>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {item.year && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.year}</span>}
            {item.displayDuration && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.displayDuration}</span>}
            {item.genre && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.genre}</span>}
          </div>
        </div>
      </div>

      {/* Secondary "Play here" button Ã¯Â¿Â½ inline overlay fallback */}
      <button
        onClick={e => { e.stopPropagation(); onPlayInline(); }}
        title="Play here without leaving this page"
        style={{
          position: 'absolute', bottom: 40, right: 8,
          background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 3, color: 'rgba(255,255,255,0.6)', fontSize: 10,
          padding: '4px 8px', cursor: 'pointer', letterSpacing: '0.04em',
          backdropFilter: 'blur(4px)',
        }}
      >
        Play here
      </button>
    </div>
  );
}

// -- Inline video / audio player overlay (fallback) ----------------------------
function VideoPlayer({ url, mimeType, onClose, onError }: {
  url:      string;
  mimeType?: string;
  onClose:  () => void;
  onError:  (msg: string) => void;
}) {
  const isAudio = (mimeType?.startsWith('audio/') ||
    /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(url)) ?? false;

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const el   = e.currentTarget as HTMLMediaElement;
    const code = el.error?.code ?? 0;
    const msgs: Record<number, string> = {
      1: 'Playback was aborted.',
      2: 'A network error occurred while loading.',
      3: 'The media could not be decoded.',
      4: 'This format is not supported by your browser.',
    };
    onError(msgs[code] || 'Playback error Ã¯Â¿Â½ please try again.');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
      display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          Playing inline Ã¯Â¿Â½ <a href="#" onClick={e => { e.preventDefault(); onClose(); }}
            style={{ color: '#D4AF37', textDecoration: 'none' }}>
            open full player ?
          </a>
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none',
          color: '#fff', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>Ã¯Â¿Â½</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '0 40px' }}>
        {isAudio ? (
          <audio controls autoPlay style={{ width: '100%', maxWidth: 640 }}
            onError={handleError}>
            <source src={url} type={mimeType || 'audio/mp4'} />
          </audio>
        ) : (
          <video controls autoPlay style={{ width: '100%', maxHeight: '85vh' }}
            onError={handleError}>
            <source src={url} type={mimeType || 'video/mp4'} />
          </video>
        )}
      </div>
    </div>
  );
}

// -- Main page -----------------------------------------------------------------
export default function PremiumAccessPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();

  const [items,          setItems]          = useState<ContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [loadingId,      setLoadingId]      = useState<string | null>(null);
  const [playUrl,        setPlayUrl]        = useState<string | null>(null);
  const [playMimeType,   setPlayMimeType]   = useState<string>('');
  const [playError,      setPlayError]      = useState('');

  // Premium check Ã¯Â¿Â½ tolerant of both 'ACTIVE' and 'active'
  const userIsPremium = isAuthenticated &&
    user?.isPremium === true &&
    user?.subscriptionStatus?.toUpperCase() === 'ACTIVE';

  // Load premium content
  const loadContent = useCallback(async () => {
    if (!isAuthenticated) return;
    setContentLoading(true);
    try {
      const token = getToken();
      let res = await fetch(`${API}/api/content/premium?limit=40`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        // SubscriptionGuard blocking Ã¯Â¿Â½ fall back to fetching all and filtering
        res = await fetch(`${API}/api/content?limit=40`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load content');
        const d = await res.json();
        const all: ContentItem[] = d.items ?? d.data?.data ?? [];
        setItems(all.filter(i => i.isPremium));
        return;
      }

      if (res.status === 401) { redirectToLogin(); return; }
      if (!res.ok) throw new Error('Failed to load premium content');

      const d = await res.json();
      setItems(d.items ?? []);
    } catch (err) {
      console.error('Premium content load failed:', err);
    } finally {
      setContentLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) loadContent();
  }, [authLoading, loadContent]);

  // PRIMARY: navigate to full watch player
  const handleWatchPage = (item: ContentItem) => {
    const ref = item.slug || item._id;
    router.push(`/watch/${ref}`);
  };

  // SECONDARY: play inline overlay (fallback)
  const handlePlayInline = async (item: ContentItem) => {
    setLoadingId(item._id);
    setPlayError('');
    setPlayUrl(null);

    try {
      const token      = getToken();
      const contentRef = item.slug || item._id;

      const res = await fetch(`${API}/api/content/${contentRef}/play`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) { redirectToLogin(); return; }

      if (res.ok) {
        const d = await res.json();
        // Controller returns playUrl Ã¯Â¿Â½ also accept url/originalUrl as fallbacks
        const mediaUrl = d.playUrl || d.url || d.originalUrl || '';
        if (mediaUrl) {
          setPlayUrl(mediaUrl);
          // mimeType now returned from controller Ã¯Â¿Â½ critical for correct playback
          setPlayMimeType(d.mimeType || '');
          return;
        }
      }

      setPlayError('Could not load media. Please try the full player instead.');
    } catch (err: any) {
      setPlayError(err.message || 'Playback failed.');
    } finally {
      setLoadingId(null);
    }
  };

  // Auth loading
  if (authLoading) {
    return (
      <main className="premium-page">
        <div className="premium-page__loading"><Spinner /></div>
      </main>
    );
  }

  // Guest wall
  if (!isAuthenticated) {
    return (
      <main className="premium-page">
        <PremiumHero />
        <SubscriptionWall
          title="Sign in to access Premium"
          subtitle="Create your account to unlock exclusive originals, live events and premium series."
          ctaLabel="Sign In"
          onCta={redirectToLogin}
          secondaryLabel="Learn about Premium ?"
          onSecondary={() => router.push('/about-premium')}
        />
      </main>
    );
  }

  // Free user wall
  if (!userIsPremium) {
    return (
      <main className="premium-page">
        <PremiumHero />
        <SubscriptionWall
          title="Upgrade to HL+ Premium"
          subtitle="Get unlimited access to exclusive originals, live events, premium series and early releases."
          ctaLabel="View Plans"
          onCta={redirectToGoPremium}
          secondaryLabel="What's included ?"
          onSecondary={() => router.push('/about-premium')}
          showFeatures
        />
      </main>
    );
  }

  // Premium subscriber view
  const TYPE_LABELS: Record<string, string> = {
    movie:      'Premium Movies',
    tv_episode: 'Premium Series',
    stage_play: 'Premium Stage Plays',
    podcast:    'Premium Podcasts',
    reelfilm:   'Premium Shorts',
    minisode:   'Minisodes',
    music:      'Music',
  };

  return (
    <main className="premium-page">

      {/* Inline player overlay (fallback) */}
      {playUrl && (
        <VideoPlayer
          url={playUrl}
          mimeType={playMimeType}
          onClose={() => { setPlayUrl(null); setPlayMimeType(''); }}
          onError={(msg) => {
            setPlayError(msg);
            setPlayUrl(null);
            setPlayMimeType('');
          }}
        />
      )}

      {/* Error toast */}
      {playError && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%',
          transform: 'translateX(-50%)', background: '#dc2626', color: '#fff',
          padding: '12px 24px', fontSize: 13, zIndex: 999, borderRadius: 4,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          {playError}
          <button onClick={() => setPlayError('')} style={{ marginLeft: 8,
            background: 'none', border: 'none', color: '#fff',
            cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>Ã¯Â¿Â½</button>
        </div>
      )}

      <PremiumHero badge="? You have Premium Access" />

      {contentLoading ? (
        <div className="premium-page__loading">
          <Spinner />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
            Loading your premium content...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px',
          color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          No premium content available yet. Check back soon.
        </div>
      ) : (
        Object.entries(TYPE_LABELS).map(([type, label]) => {
          const typeItems = items.filter(i => i.type === type);
          if (!typeItems.length) return null;
          return (
            <section key={type} className="premium-section">
              <div className="premium-section__header">
                <h2 className="premium-section__title">{label}</h2>
                <span className="premium-section__count">{typeItems.length} titles</span>
              </div>
              <div className="premium-content-row">
                {typeItems.map(item => (
                  <PremiumCard
                    key={item._id}
                    item={item}
                    isLoading={loadingId === item._id}
                    onWatchPage={() => handleWatchPage(item)}
                    onPlayInline={() => handlePlayInline(item)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      <div className="premium-page__footer-gap" />
    </main>
  );
}
