'use client';
import { useRef } from 'react';
import { ContentCard, ContentItem } from './ContentCard';
import { EpisodeCard } from './EpisodeCard';

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  cardVariant?: 'portrait' | 'landscape';
  useEpisodeCard?: boolean;
  showProgress?: boolean;
  seeAllHref?: string;
}

export function ContentRow({ title, items, cardVariant = 'portrait', useEpisodeCard, showProgress, seeAllHref }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    rowRef.current?.scrollBy({ left: dir === 'left' ? -600 : 600, behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <div className="watch-section">
      <div className="watch-section__header">
        <h2 className="watch-section__title">{title}</h2>
        {seeAllHref && <a href={seeAllHref} className="watch-section__see-all">See All â†’</a>}
      </div>
      <div className="content-row-wrap">
        <button className="row-scroll-btn row-scroll-btn--left" onClick={() => scroll('left')} aria-label="Scroll left">â€¹</button>
        <div className="content-row" ref={rowRef}>
          {items.map(item =>
            useEpisodeCard
              ? <EpisodeCard key={item._id} item={item} showProgress={showProgress} />
              : <ContentCard key={item._id} item={item} variant={cardVariant} />
          )}
        </div>
        <button className="row-scroll-btn row-scroll-btn--right" onClick={() => scroll('right')} aria-label="Scroll right">â€º</button>
      </div>
    </div>
  );
}
