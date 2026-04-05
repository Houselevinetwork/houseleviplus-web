'use client';

import { useRef } from 'react';
import { ScheduleCard } from './ScheduleCard';

interface ScheduleBlock {
  startTime: string;
  endTime: string;
  metadata: { title: string };
  name: string;
}

interface ScheduleCarouselProps {
  schedule: ScheduleBlock[];
  currentBlockIndex?: number;
}

export function ScheduleCarousel({ schedule, currentBlockIndex = 0 }: ScheduleCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Current block pinned first â€” upcoming scroll right only
  const current  = schedule[currentBlockIndex];
  const upcoming = [
    ...schedule.slice(currentBlockIndex + 1),
    ...schedule.slice(0, currentBlockIndex),
  ];
  const ordered = current ? [current, ...upcoming] : schedule;

  return (
    <div className="schedule-section">
      <div className="schedule-header">
        <h2 className="schedule-title">SCHEDULE</h2>
      </div>

      <div className="schedule-carousel">
        <div
          className="schedule-carousel-track"
          ref={scrollContainerRef}
        >
          {ordered.map((block, index) => (
            <ScheduleCard
              key={index}
              startTime={block.startTime}
              endTime={block.endTime}
              title={block.metadata.title}
              showName={block.name}
              isPlaying={index === 0}
            />
          ))}
        </div>

        {/* Only right scroll â€” can't scroll left past current block */}
        <button
          className="schedule-carousel-btn schedule-carousel-btn--right"
          onClick={() => scrollContainerRef.current?.scrollBy({ left: 450, behavior: 'smooth' })}
          aria-label="Scroll right"
        >
          
        </button>
      </div>
    </div>
  );
}
