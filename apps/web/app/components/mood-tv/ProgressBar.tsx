interface ProgressBarProps {
  currentTime: number;
  duration: number;
  showHandle?: boolean;
}

export function ProgressBar({ currentTime, duration, showHandle = true }: ProgressBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        >
          {showHandle && (
            <div className="progress-bar-handle" />
          )}
        </div>
      </div>
    </div>
  );
}
