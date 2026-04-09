interface ScheduleCardProps {
  startTime: string;
  endTime: string;
  title: string;
  showName: string;
  isPlaying?: boolean;
}

export function ScheduleCard({
  startTime,
  endTime,
  title,
  showName,
  isPlaying = false,
}: ScheduleCardProps) {
  return (
    <div className={`schedule-card ${isPlaying ? 'schedule-card--playing' : ''}`}>
      {isPlaying && (
        <div className="schedule-card-playing-badge">
          <div className="schedule-card-playing-dot" />
          <span>PLAYING NOW</span>
        </div>
      )}
      
      <div className="schedule-card-time">
        {isPlaying ? '| ' : ''}{startTime} - {endTime}
      </div>
      
      <h3 className="schedule-card-title">{title}</h3>
      
      <p className="schedule-card-show">{showName}</p>
    </div>
  );
}
