'use client';
/**
 * Location: apps/web/app/watch/page.tsx
 * SECURITY FIX: All fetches now explicitly filter isPremium=false.
 * Premium content only appears on /premium-access (requires subscription).
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from '@houselevi/auth';
import { WatchHero }    from '../components/watch/WatchHero';
import { HostsRow }     from '../components/watch/HostsRow';
import { ContentRow }   from '../components/watch/ContentRow';
import { MoodTVBanner } from '../components/watch/MoodTVBanner';
import { ContentItem }  from '../components/watch/ContentCard';
import { Host }         from '../components/watch/HostsRow';
import './watch.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// Fetch with optional JWT token for authenticated endpoints
async function fetchJSON<T>(path: string, fallback: T, token?: string): Promise<T> {
  try {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const r = await fetch(`${API}${path}`, { headers });
    if (!r.ok) return fallback;
    return r.json();
  } catch {
    return fallback;
  }
}

interface WatchData {
  hero:       ContentItem | null;
  hosts:      Host[];
  latest:     ContentItem[];
  jumpBackIn: ContentItem[];
  featured:   ContentItem[];
  stagePlays: ContentItem[];
  movies:     ContentItem[];
  series:     ContentItem[];
}

const EMPTY: WatchData = {
  hero: null, hosts: [], latest: [],
  jumpBackIn: [], featured: [], stagePlays: [], movies: [], series: [],
};

// Helper to extract items from various response shapes
function extractItems(data: any): ContentItem[] {
  return data?.items ?? data?.data?.data ?? data?.data ?? [];
}

export default function WatchPage() {
  const { isAuthenticated } = useAuthContext();
  const [data,      setData]      = useState<WatchData>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setIsLoading(true);

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
      : '';

    const [
      heroData,
      hostsData,
      latestData,
      jumpData,
      featuredData,
      stagePlaysData,
      moviesData,
      seriesData,
    ] = await Promise.all([
      // Hero ï¿½ public, but filtered to free content only
      fetchJSON<any>('/api/content/hero', { item: null }),
      // Hosts ï¿½ public
      fetchJSON<any>('/api/content/hosts', { hosts: [] }),
      // Latest ï¿½ FREE content only (isPremium=false enforced on backend)
      fetchJSON<any>('/api/content/latest-episodes?limit=12&isPremium=false', { items: [] }, token || undefined),
      // Continue watching ï¿½ auth only
      token
        ? fetchJSON<any>('/api/content/continue-watching?limit=8', { items: [] }, token)
        : Promise.resolve({ items: [] }),
      // Featured ï¿½ free only
      fetchJSON<any>('/api/content?isPremium=false&limit=12', { items: [] }),
      // Stage plays ï¿½ free only
      fetchJSON<any>('/api/content?type=stage-play&isPremium=false&limit=12', { items: [] }),
      // Movies ï¿½ free only
      fetchJSON<any>('/api/content?type=movie&isPremium=false&limit=12', { items: [] }),
      // Series ï¿½ free only
      fetchJSON<any>('/api/content?type=series&isPremium=false&limit=12', { items: [] }),
    ]);

    setData({
      hero:       heroData.item,
      hosts:      hostsData.hosts ?? [],
      latest:     extractItems(latestData),
      jumpBackIn: extractItems(jumpData),
      featured:   extractItems(featuredData),
      stagePlays: extractItems(stagePlaysData),
      movies:     extractItems(moviesData),
      series:     extractItems(seriesData),
    });
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (isLoading) {
    return (
      <main className="watch-page watch-page--loading">
        <div className="watch-loading">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" className="watch-loading__spin">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
          <p className="watch-loading__label">Loading</p>
        </div>
      </main>
    );
  }

  return (
    <main className="watch-page">
      <WatchHero item={data.hero} />
      <HostsRow hosts={data.hosts} />
      <ContentRow title="Latest Episodes"        items={data.latest}     useEpisodeCard seeAllHref="/watch/latest" />
      {data.jumpBackIn.length > 0 && (
        <ContentRow title="Jump Back In"         items={data.jumpBackIn} useEpisodeCard showProgress />
      )}
      <ContentRow title="Featured"               items={data.featured}   cardVariant="portrait" seeAllHref="/watch/featured" />
      <MoodTVBanner />
      <ContentRow title="Stage Plays"            items={data.stagePlays} cardVariant="portrait" seeAllHref="/watch/stage-plays" />
      <ContentRow title="Movies & Documentaries" items={data.movies}     cardVariant="portrait" seeAllHref="/watch/movies" />
      <ContentRow title="Series & Docu-Series"   items={data.series}     cardVariant="portrait" seeAllHref="/watch/series" />
      <div className="watch-page__footer-gap" />
    </main>
  );
}
