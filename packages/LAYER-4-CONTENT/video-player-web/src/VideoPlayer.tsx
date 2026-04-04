'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { createHlsInstance } from './hls-config';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({
  src,
  poster,
  autoplay = false,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = createHlsInstance();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          video.play();
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
    }
  }, [src, autoplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onProgress) {
        onProgress(video.currentTime);
      }
    };

    const handleEnded = () => {
      if (onComplete) {
        onComplete();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        poster={poster}
        controls
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
