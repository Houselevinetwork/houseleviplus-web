'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ProgressBar } from './ProgressBar';

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

function getEATSeconds(): number {
  const eat = new Date(Date.now() + EAT_OFFSET_MS);
  return eat.getUTCHours() * 3600 + eat.getUTCMinutes() * 60 + eat.getUTCSeconds();
}
function timeToSeconds(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 3600 + m * 60;
}
function secondsToHHMM(s: number): string {
  const abs = Math.abs(s);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const sec = Math.floor(abs % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2,'0')}m`;
  if (m > 0) return `${m}m ${sec.toString().padStart(2,'0')}s`;
  return `${sec}s`;
}
function formatClock(s: number): string {
  const h = Math.floor(s / 3600) % 24;
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}
function secondsIntoBlock(startTime: string, endTime: string): number {
  const now   = getEATSeconds();
  const start = timeToSeconds(startTime);
  const end   = timeToSeconds(endTime);
  if (end > start) return Math.max(0, now - start);
  const DAY = 86400;
  if (now >= start) return now - start;
  return (DAY - start) + now;
}
function blockDurationSeconds(startTime: string, endTime: string): number {
  const start = timeToSeconds(startTime);
  const end   = timeToSeconds(endTime);
  if (end > start) return end - start;
  return 86400 - start + end;
}

interface MoodTVBlock {
  _id: string; name: string; startTime: string; endTime: string;
  videoUrl: string;
  metadata: { title: string; description: string; genre: string };
}
interface VideoPlayerProps {
  currentBlock?: MoodTVBlock | null;
  nextBlock?:    MoodTVBlock | null;
  allBlocks?:    MoodTVBlock[];
  streamUrl?:    string;
  currentShow?:  { title: string; showName: string; startTime: string; endTime: string };
  isLive?:       boolean;
}

const GENRE_PALETTE: Record<string, { bg: string; accent: string }> = {
  Jazz:    { bg: '#1a0f2e', accent: '#7c5cbf' },
  Music:   { bg: '#0a1628', accent: '#2d6fa8' },
  Podcast: { bg: '#1c0f05', accent: '#c26b28' },
  Ambient: { bg: '#071510', accent: '#1a6b47' },
  default: { bg: '#0f1923', accent: '#3a5a7c' },
};

/* -- Volume icon — DailyWire+ style: solid filled speaker + arc waves -- */
function VolumeIcon({ muted, volume }: { muted: boolean; volume: number }) {
  if (muted || volume === 0) {
    // Muted: solid speaker + X cross
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
    );
  }
  if (volume < 40) {
    // Low: solid speaker + one short arc
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
  }
  // Full: solid speaker + two arcs
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  );
}

export function VideoPlayer({
  currentBlock, nextBlock, allBlocks, streamUrl, currentShow, isLive = true,
}: VideoPlayerProps) {
  const block = currentBlock ?? (currentShow ? {
    _id: '', name: currentShow.showName, startTime: currentShow.startTime,
    endTime: currentShow.endTime, videoUrl: streamUrl ?? '',
    metadata: { title: currentShow.title, description: '', genre: '' },
  } : null);

  const videoUrl = block?.videoUrl ?? streamUrl ?? '';
  const isR2 = videoUrl.includes('r2.dev') || /\.(mp4|webm|mov)(\?|$)/i.test(videoUrl);

  const [isMuted,       setIsMuted]       = useState(true);
  const [volume,        setVolume]        = useState(80);
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const [showControls,  setShowControls]  = useState(true);
  const [showUpNext,    setShowUpNext]    = useState(false);
  const [videoError,    setVideoError]    = useState('');
  const [isBuffering,   setIsBuffering]   = useState(false);
  const [loopCount,     setLoopCount]     = useState(0);
  const [blockElapsed,  setBlockElapsed]  = useState(0);
  const [blockDuration, setBlockDuration] = useState(0);
  const [eatClock,      setEatClock]      = useState('');

  /*
   * fsContainerRef — this is what gets requestFullscreen().
   * It wraps BOTH the video AND the floating schedule overlay,
   * so the schedule is always visible even in fullscreen.
   */
  const fsContainerRef = useRef<HTMLDivElement>(null);
  const videoRef       = useRef<HTMLVideoElement>(null);
  const carouselRef    = useRef<HTMLDivElement>(null);
  const hideTimer      = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const syncInterval   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const syncPlayback = useCallback(() => {
    if (!block || !videoRef.current || !isR2) return;
    const video   = videoRef.current;
    const elapsed = secondsIntoBlock(block.startTime, block.endTime);
    const bDur    = blockDurationSeconds(block.startTime, block.endTime);
    setBlockElapsed(elapsed);
    setBlockDuration(bDur);
    setEatClock(formatClock(getEATSeconds()));
    setShowUpNext(bDur - elapsed <= 60 && bDur - elapsed > 0);
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      const targetTime = elapsed % video.duration;
      if (Math.abs(video.currentTime - targetTime) > 3) video.currentTime = targetTime;
    }
  }, [block, isR2]);

  useEffect(() => {
    if (!block?.videoUrl) return;
    syncPlayback();
    clearInterval(syncInterval.current);
    syncInterval.current = setInterval(syncPlayback, 1000);
    return () => clearInterval(syncInterval.current);
  }, [block?.videoUrl, syncPlayback]);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
    syncPlayback();
    videoRef.current?.play().catch(() => {});
  }, [syncPlayback]);

  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (!video || !block) return;
    const elapsed = secondsIntoBlock(block.startTime, block.endTime);
    video.currentTime = elapsed % (video.duration || 1);
    video.play().catch(() => {});
    setLoopCount(c => c + 1);
  }, [block]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = isMuted ? 0 : volume / 100;
    videoRef.current.muted  = isMuted;
  }, [volume, isMuted]);

  const resetHideTimer = () => {
    clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  };

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
    clearInterval(syncInterval.current);
  }, []);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  /*
   * Fullscreen the fsContainerRef — which contains video + schedule overlay.
   * So in fullscreen the schedule is still floating at the bottom.
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fsContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -440 : 440, behavior: 'smooth' });
  };

  const palette      = GENRE_PALETTE[block?.metadata.genre ?? ''] ?? GENRE_PALETTE.default;
  const blockRemaining = Math.max(0, blockDuration - blockElapsed);

  const nowPlayingBlock = allBlocks?.find(b => b._id === block?._id) ?? null;
  const upcomingBlocks  = allBlocks?.filter(b => b._id !== block?._id) ?? [];

  return (
    <div className="moodtv-theatre-wrapper">

      {/*
        -------------------------------------------------
        FULLSCREEN CONTAINER
        This single div is fullscreened. It contains:
          • The video (fills 100% of the container)
          • All overlays (live badge, up-next, program info,
            controls bar, schedule) — always visible,
            both in normal mode AND in fullscreen.
        -------------------------------------------------
      */}
      <div
        ref={fsContainerRef}
        className="moodtv-video-box"
        onMouseMove={resetHideTimer}
      >

        {/* -- VIDEO -- */}
        {videoUrl && isR2 ? (
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            className="moodtv-video-el"
            playsInline muted={isMuted} autoPlay preload="auto"
            onCanPlay={handleCanPlay}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onEnded={handleEnded}
            onError={() => setVideoError('Could not load video — check R2 CORS policy')}
          />
        ) : (
          <div className="moodtv-video-placeholder" style={{ background: palette.bg }}>
            <div className="moodtv-play-icon" style={{ borderColor: `${palette.accent}40` }}>
              <div className="moodtv-play-triangle" style={{ borderLeft: `18px solid ${palette.accent}60` }} />
            </div>
            <p className="moodtv-placeholder-label">
              {videoUrl ? 'Loading...' : 'No video assigned to this block'}
            </p>
          </div>
        )}

        {/* Left & right vignette edges */}
        <div className="moodtv-vignette-left"  aria-hidden="true" />
        <div className="moodtv-vignette-right" aria-hidden="true" />

        {/* Buffering spinner */}
        {isBuffering && (
          <div className="moodtv-abs-center" style={{ pointerEvents: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff60" strokeWidth="2"
              style={{ animation: 'moodtv-spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Error */}
        {videoError && (
          <div className="moodtv-abs-center moodtv-error-bg">
            <div className="moodtv-error-title">? PLAYBACK ERROR</div>
            <div className="moodtv-error-msg">{videoError}</div>
            <button className="moodtv-retry-btn"
              onClick={() => { setVideoError(''); videoRef.current?.load(); }}>
              Retry
            </button>
          </div>
        )}

        {/* LIVE badge */}
        {isLive && (
          <div className="moodtv-live-badge">
            <div className="moodtv-live-dot" />
            <span>LIVE</span>
            {loopCount > 0 && <span className="moodtv-loop-count">?{loopCount}</span>}
          </div>
        )}

        {/* Up next — last 60 s */}
        {showUpNext && nextBlock && (
          <div className="moodtv-upnext">
            <div className="moodtv-upnext-label">Up next in {secondsToHHMM(blockRemaining)}</div>
            <div className="moodtv-upnext-title">{nextBlock.metadata.title}</div>
            <div className="moodtv-upnext-time">{nextBlock.startTime} – {nextBlock.endTime}</div>
          </div>
        )}

        {/* Program info — bottom-left, above schedule */}
        {block && (
          <div className="moodtv-program-info">
            {block.name && (
              <span className="moodtv-program-show">{block.name}</span>
            )}
            <h2 className="moodtv-program-title">
              {block.metadata.title || block.name}
            </h2>
            {block.metadata.description && (
              <p className="moodtv-program-desc">{block.metadata.description}</p>
            )}
          </div>
        )}

        {/* Controls bar — fades with showControls */}
        <div className={`moodtv-controls-bar${showControls ? ' moodtv-controls-bar--visible' : ''}`}>
          <div className="moodtv-progress-wrap">
            <ProgressBar
              currentTime={blockElapsed}
              duration={blockDuration > 0 ? blockDuration : 1}
              showHandle={false}
            />
          </div>
          <div className="moodtv-controls-row">
            <div className="moodtv-controls-left">
              <button className="moodtv-ctrl-btn" onClick={() => setIsMuted(m => !m)}>
                <VolumeIcon muted={isMuted} volume={volume} />
              </button>
              <input
                type="range" min="0" max="100" value={isMuted ? 0 : volume}
                onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                className="moodtv-volume-slider"
              />
              <span className="moodtv-clock">{eatClock} EAT</span>
            </div>
            <button className="moodtv-ctrl-btn" onClick={toggleFullscreen}>
              {isFullscreen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              }
            </button>
          </div>
        </div>

        {/*
          -------------------------------------------------
          FLOATING SCHEDULE OVERLAY
          Always present — in both normal and fullscreen mode.
          Transparent gradient so video shows through.
          -------------------------------------------------
        */}
        {allBlocks && allBlocks.length > 0 && (
          <div className="schedule-overlay">
            <div className="schedule-section">
              <div className="schedule-header">
                <h2 className="schedule-title">SCHEDULE</h2>
              </div>

              <div className="schedule-carousel">
                <button
                  className="schedule-carousel-btn schedule-carousel-btn--left"
                  onClick={() => scrollCarousel('left')}
                  aria-label="Scroll left"
                >‹</button>

                {/* NOW PLAYING — always pinned to far left */}
                {nowPlayingBlock && (
                  <div className="schedule-now-pin">
                    <div className="schedule-card schedule-card--playing">
                      <div className="schedule-card-playing-badge">
                        <div className="schedule-card-playing-dot" />
                        <span>PLAYING NOW</span>
                      </div>
                      <div className="schedule-card-time">
                        {nowPlayingBlock.startTime} – {nowPlayingBlock.endTime}
                      </div>
                      <h3 className="schedule-card-title">
                        {nowPlayingBlock.metadata.title || nowPlayingBlock.name}
                      </h3>
                      <p className="schedule-card-show">{nowPlayingBlock.name}</p>
                    </div>
                    <div className="schedule-pin-divider" />
                  </div>
                )}

                {/* Scrollable upcoming cards */}
                <div className="schedule-carousel-track" ref={carouselRef}>
                  {upcomingBlocks.map((b) => (
                    <div key={b._id} className="schedule-card">
                      <div className="schedule-card-time">{b.startTime} – {b.endTime}</div>
                      <h3 className="schedule-card-title">{b.metadata.title || b.name}</h3>
                      <p className="schedule-card-show">{b.name}</p>
                    </div>
                  ))}
                </div>

                <button
                  className="schedule-carousel-btn schedule-carousel-btn--right"
                  onClick={() => scrollCarousel('right')}
                  aria-label="Scroll right"
                >›</button>
              </div>
            </div>
          </div>
        )}

      </div>{/* end moodtv-video-box */}

      <style>{`
        @keyframes moodtv-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes moodtv-spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
