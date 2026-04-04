'use client';
/**
 * Location: apps/web/app/mood-tv/page.tsx
 *
 * HL Mood TV — 24/7 live stream.
 * AUTH GATE: Entire page requires sign in (nothing to browse first).
 */

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/auth';
import { VideoPlayer }     from '../components/mood-tv/VideoPlayer';
import { BrandingSection } from '../components/mood-tv/BrandingSection';
import './mood-tv.css';

interface MoodTVBlock {
  _id:       string;
  name:      string;
  startTime: string;
  endTime:   string;
  videoUrl:  string;
  isActive:  boolean;
  metadata:  { title: string; description: string; genre: string };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Redirect guest to authorize-ui login */
function redirectToLogin() {
  const state = Math.random().toString(36).substring(2, 15);
  const nonce = Math.random().toString(36).substring(2, 15);
  const base  = process.env.NEXT_PUBLIC_AUTHORIZE_UI_URL || 'http://localhost:3003';
  window.location.href = `${base}/login?state=${state}&nonce=${nonce}&returnTo=${encodeURIComponent('/mood-tv')}`;
}

export default function MoodTVPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  const [schedule,   setSchedule]   = useState<MoodTVBlock[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MoodTVBlock | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);

  // -- Auth gate: redirect guest before fetching schedule ---------------------
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, authLoading]);

  // -- Fetch schedule only when authenticated ---------------------------------
  const fetchData = async () => {
    try {
      const [nowData, scheduleData] = await Promise.all([
        fetch(`${API}/linear-tv/now-playing`).then(r => r.json()),
        fetch(`${API}/linear-tv/schedule/today`).then(r => r.json()),
      ]);
      setNowPlaying(nowData.block ?? null);
      setSchedule(scheduleData.blocks ?? []);
    } catch (err) {
      console.error('Mood TV fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return; // don't fetch until auth confirmed
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const currentIdx = nowPlaying
    ? schedule.findIndex(b => b._id === nowPlaying._id)
    : -1;
  const nextBlock = currentIdx >= 0
    ? schedule[(currentIdx + 1) % schedule.length] ?? null
    : null;

  // Show spinner while auth resolves or schedule loads
  if (authLoading || isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f1923',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <svg
          width="32" height="32" viewBox="0 0 24 24"
          fill="none" stroke="#3a5a7c" strokeWidth="2"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
        </svg>
        <p style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 11,
          color: '#3a5a7c',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          Loading Mood TV
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Guest will have been redirected by now — but as a safety net, render nothing
  if (!isAuthenticated) return null;

  return (
    <main className="mood-tv">
      <VideoPlayer
        currentBlock={nowPlaying}
        nextBlock={nextBlock}
        allBlocks={schedule}
        isLive={true}
      />
      <BrandingSection />
    </main>
  );
}
