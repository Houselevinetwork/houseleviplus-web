'use client';
/**
 * Location: apps/web/app/components/mood-tv/VideoPlayer.tsx
 *          AND apps/levi+/app/components/mood-tv/VideoPlayer.tsx
 *
 * KEY ARCHITECTURE DECISIONS:
 *
 * 1. SYNCHRONIZED PLAYBACK
 *    Real TV: if Rainfall started at 22:00 EAT and it's now 22:47,
 *    every single viewer is at minute 47 of the video — not minute 0.
 *    We calculate: seekOffset = secondsIntoBlock % videoDurationSeconds
 *    This means a 1hr video on a 5hr block loops perfectly and
 *    all viewers are always in sync regardless of when they opened the page.
 *
 * 2. AUTOPLAY MUTED
 *    Browsers block autoplay with sound. TV never waits for you to press play.
 *    We autoplay muted, then show a prominent UNMUTE button.
 *
 * 3. BLOCK PROGRESS (not video progress)
 *    We show how far into the block schedule we are — "47min in, 4h13m left"
 *    This is what gives the feeling of a real broadcast.
 *
 * 4. AUTO BLOCK TRANSITION
 *    A 60-second ticker checks if the current block has changed.
 *    When it does, the video src swaps and seeks to the correct offset.
 *
 * 5. UP NEXT BANNER
 *    60 seconds before a block ends, we show what's coming next.
 *
 * 6. LAYOUT: Info panel on the RIGHT, video on the LEFT.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { ProgressBar } from './ProgressBar';

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC+3

function getEATSeconds(): number {
  const now   = new Date();
  const eat   = new Date(now.getTime() + EAT_OFFSET_MS);
  return eat.getUTCHours() * 3600 + eat.getUTCMinutes() * 60 + eat.getUTCSeconds();
}

function timeToSeconds(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 3600 + m * 60;
}

function secondsToHHMM(s: number): string {
  const abs = Math.abs(s);
  const h   = Math.floor(abs / 3600);
  const m   = Math.floor((abs % 3600) / 60);
  const sec = Math.floor(abs % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2,'0')}m`;
  if (m > 0) return `${m}m ${sec.toString().padStart(2,'0')}s`;
  return `${sec}s`;
}

function formatClock(s: number): string {
  const h   = Math.floor(s / 3600) % 24;
  const m   = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

/** How many seconds into the current block are we right now (EAT) */
function secondsIntoBlock(startTime: string, endTime: string): number {
  const now   = getEATSeconds();
  const start = timeToSeconds(startTime);
  const end   = timeToSeconds(endTime);

  if (end > start) {
    // Normal block e.g. 06:00–10:00
    return Math.max(0, now - start);
  } else {
    // Midnight-crossing block e.g. 22:00–03:00
    const DAY = 86400;
    if (now >= start) return now - start;
    return (DAY - start) + now;
  }
}

/** Total duration of a block in seconds */
function blockDurationSeconds(startTime: string, endTime: string): number {
  const start = timeToSeconds(startTime);
  const end   = timeToSeconds(endTime);
  if (end > start) return end - start;
  return 86400 - start + end; // midnight-crossing
}

interface MoodTVBlock {
  _id:       string;
  name:      string;
  startTime: string;
  endTime:   string;
  videoUrl:  string;
  metadata: { title: string; description: string; genre: string };
}

interface VideoPlayerProps {
  currentBlock?:  MoodTVBlock | null;
  nextBlock?:     MoodTVBlock | null;
  allBlocks?:     MoodTVBlock[];
  // Legacy props kept for admin preview tab compatibility
  streamUrl?:     string;
  currentShow?:   { title: string; showName: string; startTime: string; endTime: string };
  isLive?:        boolean;
}

const GENRE_PALETTE: Record<string, { bg: string; accent: string }> = {
  Jazz:    { bg: '#1a0f2e', accent: '#7c5cbf' },
  Music:   { bg: '#0a1628', accent: '#2d6fa8' },
  Podcast: { bg: '#1c0f05', accent: '#c26b28' },
  Ambient: { bg: '#071510', accent: '#1a6b47' },
  default: { bg: '#0f1923', accent: '#3a5a7c' },
};

export function VideoPlayer({
  currentBlock, nextBlock, allBlocks,
  streamUrl, currentShow, isLive = true,
}: VideoPlayerProps) {

  // Resolve block — support both new API (currentBlock) and legacy (streamUrl + currentShow)
  const block = currentBlock ?? (currentShow ? {
    _id: '', name: currentShow.showName, startTime: currentShow.startTime,
    endTime: currentShow.endTime, videoUrl: streamUrl ?? '',
    metadata: { title: currentShow.title, description: '', genre: '' },
  } : null);

  const videoUrl = block?.videoUrl ?? streamUrl ?? '';
  const isR2     = videoUrl.includes('r2.dev') || /\.(mp4|webm|mov)(\?|$)/i.test(videoUrl);

  // ── State ─────────────────────────────────────────────────
  const [isMuted,      setIsMuted]      = useState(true);   // start muted for autoplay
  const [volume,       setVolume]       = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showUpNext,   setShowUpNext]   = useState(false);
  const [videoError,   setVideoError]   = useState('');
  const [isBuffering,  setIsBuffering]  = useState(false);
  const [loopCount,    setLoopCount]    = useState(0);

  // Block-level progress (real broadcast position)
  const [blockElapsed,  setBlockElapsed]  = useState(0); // seconds into block
  const [blockDuration, setBlockDuration] = useState(0); // total block seconds
  const [eatClock,      setEatClock]      = useState('');

  const containerRef  = useRef<HTMLDivElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const hideTimer     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const syncInterval  = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // ── Sync: seek video to correct position every second ─────
  const syncPlayback = useCallback(() => {
    if (!block || !videoRef.current || !isR2) return;
    const video   = videoRef.current;
    const elapsed = secondsIntoBlock(block.startTime, block.endTime);
    const bDur    = blockDurationSeconds(block.startTime, block.endTime);

    setBlockElapsed(elapsed);
    setBlockDuration(bDur);
    setEatClock(formatClock(getEATSeconds()));

    // Up next: show banner in last 60s of block
    setShowUpNext(bDur - elapsed <= 60 && bDur - elapsed > 0);

    // Seek video to correct loop position (only if loaded)
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      const targetTime = elapsed % video.duration;
      // Only seek if we're more than 3s off (avoid constant micro-seeks)
      if (Math.abs(video.currentTime - targetTime) > 3) {
        video.currentTime = targetTime;
      }
    }
  }, [block, isR2]);

  // ── Start syncing when component mounts / block changes ───
  useEffect(() => {
    if (!block?.videoUrl) return;
    syncPlayback(); // immediate
    clearInterval(syncInterval.current);
    syncInterval.current = setInterval(syncPlayback, 1000);
    return () => clearInterval(syncInterval.current);
  }, [block?.videoUrl, syncPlayback]);

  // ── Autoplay when video loads ──────────────────────────────
  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setIsBuffering(false);
    syncPlayback(); // seek to correct position before playing
    video.play().catch(() => {
      // Autoplay blocked — show unmute/play button prominently
    });
  }, [syncPlayback]);

  // ── Loop: when video ends, seek back to correct position ──
  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (!video || !block) return;
    const elapsed    = secondsIntoBlock(block.startTime, block.endTime);
    video.currentTime = elapsed % (video.duration || 1);
    video.play().catch(() => {});
    setLoopCount(c => c + 1);
  }, [block]);

  // ── Volume ─────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = isMuted ? 0 : volume / 100;
    videoRef.current.muted  = isMuted;
  }, [volume, isMuted]);

  // ── Controls auto-hide ─────────────────────────────────────
  const resetHideTimer = () => {
    clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  };

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
    clearInterval(syncInterval.current);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const palette = GENRE_PALETTE[block?.metadata.genre ?? ''] ?? GENRE_PALETTE.default;
  const blockRemaining = Math.max(0, blockDuration - blockElapsed);
  const blockProgress  = blockDuration > 0 ? blockElapsed / blockDuration : 0;

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', background: '#000', width: '100%', position: 'relative', minHeight: 460 }}
      onMouseMove={resetHideTimer}
    >
      {/* ═══════════════════════════════════════════
          LEFT: VIDEO (70%)
      ═══════════════════════════════════════════ */}
      <div style={{ flex: '0 0 70%', position: 'relative', background: '#000', overflow: 'hidden' }}>

        {/* Video element */}
        {videoUrl && isR2 ? (
          <video
            ref={videoRef}
            key={videoUrl}           /* re-mount on src change */
            src={videoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 400 }}
            playsInline
            muted={isMuted}
            autoPlay
            preload="auto"
            onCanPlay={handleCanPlay}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onEnded={handleEnded}
            onError={() => setVideoError('Could not load video — check R2 CORS policy')}
          />
        ) : (
          <div style={{ width: '100%', minHeight: 400, background: palette.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${palette.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: `18px solid ${palette.accent}60`, marginLeft: 4 }} />
            </div>
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {videoUrl ? 'Loading...' : 'No video assigned to this block'}
            </p>
          </div>
        )}

        {/* Buffering spinner */}
        {isBuffering && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff60" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Video error */}
        {videoError && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
            <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 12, color: '#ff6b6b', letterSpacing: '0.1em' }}>⚠ PLAYBACK ERROR</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#888', textAlign: 'center', maxWidth: 300 }}>{videoError}</div>
            <button onClick={() => { setVideoError(''); videoRef.current?.load(); }} style={{ padding: '8px 20px', background: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: 11, borderRadius: 2 }}>Retry</button>
          </div>
        )}

        {/* UNMUTE button — prominent, TV-style */}
        {isMuted && !videoError && (
          <button
            onClick={() => setIsMuted(false)}
            style={{
              position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 24px', background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer', borderRadius: 40,
              fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#fff',
              letterSpacing: '0.08em',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
            </svg>
            Click to unmute
          </button>
        )}

        {/* Controls bar — bottom of video */}
        {showControls && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
            padding: '32px 20px 14px',
          }}>
            {/* Block progress bar — shows position within the broadcast schedule */}
            <div style={{ marginBottom: 10 }}>
              <ProgressBar
                currentTime={blockElapsed}
                duration={blockDuration > 0 ? blockDuration : 1}
                showHandle={false}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Volume */}
                <button onClick={() => setIsMuted(m => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {isMuted
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  }
                </button>
                <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                  onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                  style={{ width: 70, accentColor: '#fff', cursor: 'pointer' }}
                />
                {/* EAT clock */}
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
                  {eatClock} EAT
                </span>
              </div>
              <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}>
                {isFullscreen
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                }
              </button>
            </div>
          </div>
        )}

        {/* LIVE badge */}
        {isLive && (
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b3b', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 10, color: '#fff', letterSpacing: '0.15em' }}>LIVE</span>
            {loopCount > 0 && <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>↺{loopCount}</span>}
          </div>
        )}

        {/* UP NEXT banner */}
        {showUpNext && nextBlock && (
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: 3, maxWidth: 220 }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Up next in {secondsToHHMM(blockRemaining)}</div>
            <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 12, color: '#fff' }}>{nextBlock.metadata.title}</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{nextBlock.startTime} – {nextBlock.endTime}</div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT: NOW PLAYING INFO PANEL (30%)
      ═══════════════════════════════════════════ */}
      <div style={{
        flex: '0 0 30%', background: palette.bg,
        borderLeft: `1px solid ${palette.accent}20`,
        display: 'flex', flexDirection: 'column',
        padding: 0, overflow: 'hidden',
      }}>
        {/* Channel header */}
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${palette.accent}20` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b3b', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 9, color: palette.accent, letterSpacing: '0.25em', textTransform: 'uppercase' }}>HL MOOD TV</span>
          </div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
            {eatClock} East Africa Time
          </div>
        </div>

        {/* NOW PLAYING */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${palette.accent}15`, flex: '0 0 auto' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: palette.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Now Playing</div>

          {block ? (
            <>
              <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 17, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
                {block.metadata.title || block.name}
              </div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 14 }}>
                {block.metadata.description}
              </div>

              {/* Genre pill */}
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 2, background: `${palette.accent}25`, border: `1px solid ${palette.accent}40`, fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700, color: palette.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
                {block.metadata.genre}
              </div>

              {/* Block time */}
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
                {block.startTime} – {block.endTime} EAT
              </div>

              {/* Block progress */}
              <div style={{ marginBottom: 8 }}>
                <ProgressBar
                  currentTime={blockElapsed}
                  duration={blockDuration > 0 ? blockDuration : 1}
                  showHandle={false}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                  {secondsToHHMM(blockElapsed)} in
                </span>
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: palette.accent }}>
                  {secondsToHHMM(blockRemaining)} left
                </span>
              </div>
            </>
          ) : (
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No block active</div>
          )}
        </div>

        {/* UP NEXT (inline panel) */}
        {nextBlock && (
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${palette.accent}15`, flex: '0 0 auto' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Up Next</div>
            <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 3 }}>
              {nextBlock.metadata.title || nextBlock.name}
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
              {nextBlock.startTime} – {nextBlock.endTime}
            </div>
            {blockRemaining > 0 && (
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: palette.accent, marginTop: 4 }}>
                Starts in {secondsToHHMM(blockRemaining)}
              </div>
            )}
          </div>
        )}

        {/* Spacer + branding */}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${palette.accent}15` }}>
          <div style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            House Levi+
          </div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>
            24 / 7 Live Channel
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}