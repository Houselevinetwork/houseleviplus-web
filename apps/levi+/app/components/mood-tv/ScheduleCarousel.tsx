'use client';

import { useRef } from 'react';
import { ScheduleCard } from './ScheduleCard';

interface ScheduleBlock {
  startTime: string;
  endTime: string;
  metadata: {
    title: string;
  };
  name: string;
}

interface ScheduleCarouselProps {
  schedule: ScheduleBlock[];
  currentBlockIndex?: number;
}

export function ScheduleCarousel({ schedule, currentBlockIndex = 0 }: ScheduleCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 450;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="schedule-section">
      <div className="schedule-header">
        <h2 className="schedule-title">SCHEDULE</h2>
      </div>
      
      <div className="schedule-carousel">
        <button 
          className="schedule-carousel-btn schedule-carousel-btn--left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          
        </button>
        
        <div 
          className="schedule-carousel-track"
          ref={scrollContainerRef}
        >
          {schedule.map((block, index) => (
            <ScheduleCard
              key={index}
              startTime={block.startTime}
              endTime={block.endTime}
              title={block.metadata.title}
              showName={block.name}
              isPlaying={index === currentBlockIndex}
            />
          ))}
        </div>
        
        <button 
          className="schedule-carousel-btn schedule-carousel-btn--right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          
        </button>
      </div>
    </div>
  );
}
