'use client';
import { useRouter } from 'next/navigation';
import { ContentItem } from './ContentCard';

interface EpisodeCardProps {
  item: ContentItem;
  showProgress?: boolean;
}

export function EpisodeCard({ item, showProgress }: EpisodeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (item.isPremium) { router.push('/choose-plan'); return; }
    router.push(`/watch/${item.slug ?? item._id}`);
  };

  return (
    <div className="episode-card" onClick={handleClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleClick()}>
      <div className="episode-card__thumb-wrap">
        {item.thumbnailUrl
          ? <img src={item.thumbnailUrl} alt={item.title} className="episode-card__thumb" />
          : <div style={{ width: '100%', aspectRatio: '16/9', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 12 }}>{item.title}</div>
        }
        {item.duration && <div className="episode-card__duration">{item.duration}</div>}
        {item.isPremium && (
          <div style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
        )}
      </div>
      <div className="episode-card__info">
        {item.showName && <div className="episode-card__show">{item.showName}</div>}
        <div className="episode-card__title">{item.title}</div>
        <div className="episode-card__meta">{item.year}{item.genre ? ` · ${item.genre}` : ''}</div>
        {showProgress && typeof item.progressPercent === 'number' && (
          <div className="episode-card__progress-bar">
            <div className="episode-card__progress-fill" style={{ width: `${item.progressPercent}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
