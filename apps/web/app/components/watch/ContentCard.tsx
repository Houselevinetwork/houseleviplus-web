'use client';
/**
 * Location: apps/web/app/components/watch/ContentCard.tsx
 *
 * Auth gate uses AuthPromptModal (Netflix-style) instead of hard redirect.
 * Page stays visible behind modal â€” builds desire, improves conversion.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/auth';
import { AuthPromptModal } from '../common/AuthPromptModal';

export interface ContentItem {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  type: 'movie' | 'series' | 'podcast' | 'short' | 'stage-play' | 'documentary' | 'music' | 'sport';
  isPremium?: boolean;
  isNew?: boolean;
  year?: number;
  duration?: string;
  showName?: string;
  progressPercent?: number;
  genre?: string;
  hostName?: string;
  slug?: string;
}

interface ContentCardProps {
  item: ContentItem;
  variant?: 'portrait' | 'landscape';
  showInfo?: boolean;
}

export function ContentCard({ item, variant = 'portrait', showInfo = true }: ContentCardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const userIsPremium = user?.isPremium && user?.subscriptionStatus === 'ACTIVE';

  const handleClick = () => {
    // Guest â†’ show modal (page stays visible behind it)
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Free user + premium content â†’ upgrade
    if (item.isPremium && !userIsPremium) {
      router.push('/choose-plans');
      return;
    }

    // Authenticated and allowed â†’ go to player
    router.push(`/watch/${item.slug ?? item._id}`);
  };

  const imgSrc = variant === 'portrait'
    ? (item.posterUrl ?? item.thumbnailUrl)
    : item.thumbnailUrl;

  // Overlay icon changes based on auth + premium state
  const overlayIcon = !isAuthenticated
    ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    )
    : item.isPremium && !userIsPremium
    ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    )
    : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
        <polygon points="5,3 19,12 5,21"/>
      </svg>
    );

  return (
    <>
      <div
        className={`content-card content-card--${variant}${item.isPremium ? ' content-card--premium' : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: variant === 'portrait' ? '2/3' : '16/9',
          overflow: 'hidden',
          background: '#111',
        }}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item.title}
              className="content-card__thumb"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div className="content-card__thumb-placeholder">{item.title}</div>
          )}

          <div className="content-card__overlay">
            <div className="content-card__play">{overlayIcon}</div>
            <div className="content-card__hover-title">{item.title}</div>
          </div>

          {item.isPremium && (
            <div className="content-card__lock">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          )}

          {item.isNew && !item.isPremium && (
            <div className="content-card__new-badge">New</div>
          )}

          {typeof item.progressPercent === 'number' && item.progressPercent > 0 && (
            <div className="content-card__progress">
              <div className="content-card__progress-fill" style={{ width: `${item.progressPercent}%` }} />
            </div>
          )}
        </div>

        {showInfo && (
          <div className="content-card__info">
            <div className="content-card__title">{item.title}</div>
            {(item.showName || item.year) && (
              <div className="content-card__sub">{item.showName ?? item.year}</div>
            )}
          </div>
        )}
      </div>

      {/* Auth prompt modal â€” renders over the page, not a redirect */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        contentTitle={item.title}
        isPremium={item.isPremium}
      />
    </>
  );
}
