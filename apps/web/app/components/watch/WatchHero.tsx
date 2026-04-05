'use client';
/**
 * Location: apps/web/app/components/watch/WatchHero.tsx
 *
 * Auth gate on "Watch Now" â€” shows AuthPromptModal for guests
 * instead of hard redirect.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/auth';
import { AuthPromptModal } from '../common/AuthPromptModal';
import { ContentItem } from './ContentCard';

interface WatchHeroProps {
  item: ContentItem | null;
}

export function WatchHero({ item }: WatchHeroProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const userIsPremium = user?.isPremium && user?.subscriptionStatus === 'ACTIVE';

  if (!item) return (
    <div className="watch-hero">
      <div className="watch-hero__backdrop-placeholder" />
      <div className="watch-hero__gradient" />
    </div>
  );

  const handleWatch = () => {
    // Guest â†’ modal
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    // Free user + premium content â†’ upgrade
    if (item.isPremium && !userIsPremium) {
      router.push('/choose-plans');
      return;
    }
    router.push(`/watch/${item.slug ?? item._id}`);
  };

  return (
    <>
      <div className="watch-hero">
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} className="watch-hero__backdrop" />
          : <div className="watch-hero__backdrop-placeholder" />
        }
        <div className="watch-hero__gradient" />
        <div className="watch-hero__content">

          <div className="watch-hero__eyebrow">
            <span className="watch-hero__eyebrow-dot" />
            {item.type === 'movie'      ? 'Featured Film'
            : item.type === 'series'    ? 'Featured Series'
            : item.type === 'stage-play'? 'Stage Play'
            : 'Featured'}
          </div>

          <h1 className="watch-hero__title">{item.title}</h1>

          <div className="watch-hero__meta">
            {item.isNew && <span className="watch-hero__badge watch-hero__badge--new">New</span>}
            <span className="watch-hero__badge watch-hero__badge--film">{item.type}</span>
            {item.year && <span className="watch-hero__year">{item.year}</span>}
            {item.year && item.duration && <span className="watch-hero__sep" />}
            {item.duration && <span className="watch-hero__runtime">{item.duration}</span>}
            {item.genre && <><span className="watch-hero__sep" /><span className="watch-hero__runtime">{item.genre}</span></>}
          </div>

          {item.isPremium && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span style={{ fontSize: 12, color: '#D4AF37', letterSpacing: '0.08em', fontWeight: 600 }}>
                Premium Access Required
              </span>
            </div>
          )}

          <div className="watch-hero__actions">
            <button
              className={`watch-btn ${item.isPremium && !userIsPremium ? 'watch-btn--locked' : 'watch-btn--primary'}`}
              onClick={handleWatch}
            >
              {!isAuthenticated ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  Watch Now
                </>
              ) : item.isPremium && !userIsPremium ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Subscribe to Watch
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  Watch Now
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Auth prompt modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        contentTitle={item.title}
        isPremium={item.isPremium}
      />
    </>
  );
}
