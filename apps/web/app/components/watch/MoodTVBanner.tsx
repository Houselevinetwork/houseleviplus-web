'use client';
/**
 * Location: apps/web/app/components/watch/MoodTVBanner.tsx
 *
 * Shows auth prompt modal for guests instead of navigating directly.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/auth';
import { AuthPromptModal } from '../common/AuthPromptModal';

interface NowPlaying {
  title:     string;
  startTime: string;
  endTime:   string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function MoodTVBanner() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const [nowPlaying,    setNowPlaying]    = useState<NowPlaying | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetch(`${API}/linear-tv/now-playing`)
      .then(r => r.json())
      .then(d => {
        const b = d.block;
        if (b) setNowPlaying({
          title:     b.metadata?.title ?? b.name,
          startTime: b.startTime,
          endTime:   b.endTime,
        });
      })
      .catch(() => {});
  }, []);

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true); // Ã¢Å“â€¦ modal, not redirect
    } else {
      router.push('/live-tv');
    }
  };

  return (
    <>
      <div
        className="moodtv-banner"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
      >
        <div className="moodtv-banner__bg" />
        <div className="moodtv-banner__inner">
          <div className="moodtv-banner__left">
            <div className="moodtv-banner__logo-wrap">
              <div className="moodtv-banner__logo">HL <span>LIVE</span> TV</div>
              <div className="moodtv-banner__tagline">24/7 Live Channel</div>
            </div>
            <div className="moodtv-banner__divider" />
            <div className="moodtv-banner__now">
              <div className="moodtv-banner__live-row">
                <div className="moodtv-banner__live-dot" />
                <span className="moodtv-banner__live-label">Live Now</span>
              </div>
              {nowPlaying ? (
                <>
                  <div className="moodtv-banner__now-title">{nowPlaying.title}</div>
                  <div className="moodtv-banner__now-time">
                    {nowPlaying.startTime} Ã¢â‚¬â€œ {nowPlaying.endTime}
                  </div>
                </>
              ) : (
                <div className="moodtv-banner__now-title" style={{ color: '#555', fontSize: 14 }}>
                  Loading scheduleÃ¢â‚¬Â¦
                </div>
              )}
            </div>
          </div>
          <button
            className="moodtv-banner__cta"
            onClick={e => { e.stopPropagation(); handleClick(); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Watch Live
          </button>
        </div>
      </div>

      {/* Ã¢Å“â€¦ Auth prompt modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        contentTitle="HL Live TV Ã¢â‚¬â€ 24/7 Live"
        moodTV
      />
    </>
  );
}
