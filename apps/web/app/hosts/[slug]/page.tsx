'use client';

export const runtime = 'edge';

/**
 * Location: apps/web/app/hosts/[slug]/page.tsx
 */
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './host.css';

interface Host {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

interface ContentItem {
  _id: string;
  title: string;
  type: string;
  thumbnailUrl?: string;
  duration?: number;
  displayDuration?: string;
  isPremium?: boolean;
  isNew?: boolean;
  slug?: string;
}

interface HostPageData {
  host: Host;
  contentByCategory: Record<string, ContentItem[]>;
  totalCount: number;
  categoryLabels: Record<string, string>;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const STORAGE_KEY = 'hl_followed_hosts';

function getFollowed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function saveFollowed(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

function HostContentCard({ item }: { item: ContentItem }) {
  const router = useRouter();
  const target = item.slug ? `/watch/${item.slug}` : `/watch/${item._id}`;
  return (
    <div className="hc-card" onClick={() => router.push(target)} role="button" tabIndex={0}
         onKeyDown={e => e.key === 'Enter' && router.push(target)}>
      <div className="hc-card__thumb">
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} />
          : <div className="hc-card__thumb-placeholder" />
        }
        {item.isPremium && <span className="hc-card__badge hc-card__badge--premium">Premium</span>}
        {item.isNew     && <span className="hc-card__badge hc-card__badge--new">New</span>}
        {item.displayDuration && <span className="hc-card__duration">{item.displayDuration}</span>}
        <div className="hc-card__play">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.6)" />
            <polygon points="10,8 16,12 10,16" fill="white" />
          </svg>
        </div>
      </div>
      <div className="hc-card__title">{item.title}</div>
    </div>
  );
}

function CategoryRow({ label, items }: { label: string; items: ContentItem[] }) {
  if (!items.length) return null;
  return (
    <section className="host-category-row">
      <div className="host-category-row__header">
        <h2 className="host-category-row__title">{label}</h2>
        <span className="host-category-row__count">{items.length} title{items.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="host-category-row__scroll">
        <div className="host-category-row__track">
          {items.map(item => <HostContentCard key={item._id} item={item} />)}
        </div>
      </div>
    </section>
  );
}

function HostSkeleton() {
  return (
    <div className="host-page host-page--loading">
      <div className="host-hero host-hero--skeleton" />
      <div className="host-info-skeleton">
        <div className="skeleton-circle" />
        <div>
          <div className="skeleton-line" style={{ width: 200, height: 28 }} />
          <div className="skeleton-line" style={{ width: 320, height: 16, marginTop: 10 }} />
          <div className="skeleton-line" style={{ width: 280, height: 16, marginTop: 6 }} />
        </div>
      </div>
    </div>
  );
}

export default function HostPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [data, setData] = useState<HostPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [hoverUnfollow, setHoverUnfollow] = useState(false);

  useEffect(() => { setFollowed(getFollowed()); }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/content/hosts/${slug}`);
        if (!res.ok) throw new Error(`${res.status}`);
        setData(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  function toggleFollow() {
    if (!data) return;
    setFollowed(prev => {
      const next = new Set(prev);
      next.has(data.host._id) ? next.delete(data.host._id) : next.add(data.host._id);
      saveFollowed(next);
      return next;
    });
  }

  if (loading) return <HostSkeleton />;
  if (error || !data) return (
    <div className="host-page host-page--error">
      <p>Could not load this host page.</p>
      <button onClick={() => router.push('/watch')}>Back to Watch</button>
    </div>
  );

  const { host, contentByCategory, categoryLabels } = data;
  const isFollowed = followed.has(host._id);
  const initials = host.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const DISPLAY_ORDER = ['episode', 'series', 'movie', 'stage-play', 'documentary', 'podcast', 'short'];
  const orderedCategories = [
    ...DISPLAY_ORDER.filter(k => contentByCategory[k]?.length),
    ...Object.keys(contentByCategory).filter(k => !DISPLAY_ORDER.includes(k) && contentByCategory[k]?.length),
  ];

  return (
    <div className="host-page">
      <div className="host-hero"
           style={{ backgroundImage: host.bannerUrl ? `url(${host.bannerUrl})` : undefined }}>
        <div className="host-hero__overlay" />
        <div className="host-hero__content">
          <nav className="host-breadcrumb">
            <Link href="/watch">Watch</Link>
            <span className="host-breadcrumb__sep">&rsaquo;</span>
            <span>{host.name}</span>
          </nav>
          <div className="host-identity">
            <div className="host-avatar-lg">
              {host.avatarUrl
                ? <img src={host.avatarUrl} alt={host.name} />
                : <span>{initials}</span>
              }
            </div>
            <div className="host-identity__info">
              <h1 className="host-identity__name">{host.name}</h1>
              {data.totalCount > 0 && (
                <p className="host-identity__stat">
                  {data.totalCount} title{data.totalCount !== 1 ? 's' : ''}
                </p>
              )}
              <button
                className={`host-follow-lg${isFollowed ? ' host-follow-lg--following' : ''}`}
                onClick={toggleFollow}
                onMouseEnter={() => setHoverUnfollow(true)}
                onMouseLeave={() => setHoverUnfollow(false)}
              >
                {isFollowed ? (hoverUnfollow ? <>&#10007; Unfollow</> : <>&#10003; Following</>) : <>+ Follow</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {host.bio && (
        <div className="host-bio-section">
          <div className="host-bio-inner">
            <p className="host-bio-text">{host.bio}</p>
          </div>
        </div>
      )}

      <div className="host-content-section">
        {orderedCategories.length === 0 ? (
          <div className="host-empty">No content yet for this host.</div>
        ) : (
          orderedCategories.map(type => (
            <CategoryRow key={type} label={categoryLabels[type] ?? type} items={contentByCategory[type]} />
          ))
        )}
      </div>
    </div>
  );
}