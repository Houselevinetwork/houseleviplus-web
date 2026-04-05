'use client';
/**
 * Location: apps/web/app/watch/[slug]/page.tsx
 * FIXES:
 *   1. Auth token sent with content fetch so premium users get storage.originalUrl
 *   2. Premium gate: if no videoSrc and isPremium, show upgrade prompt not "media unavailable"
 *   3. play() AbortError + NotSupportedError suppressed
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './watch-player.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token')       ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Types Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface ContentDetail {
  _id:              string;
  title:            string;
  description?:     string;
  type:             string;
  status:           string;
  slug?:            string;
  isPremium?:       boolean;
  isFeatured?:      boolean;
  isNewContent?:    boolean;
  displayDuration?: string;
  hostName?:        string;
  hostSlug?:        string;
  images?:          { poster?: string; backdrop?: string };
  storage?:         { originalUrl?: string; thumbnail?: string; duration?: number; mimeType?: string };
  metadata?:        {
    releaseYear?: number;
    genre?:       string | string[];
    cast?:        string[];
    director?:    string;
    mediaType?:   string;
  };
  series?:          { title?: string; description?: string };
  season?:          number;
  episode?:         number;
  viewCount?:       number;
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ SVG Icons Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const Icons = {
  Play:       () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause:      () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Replay:     () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>,
  VolHigh:    () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>,
  VolLow:     () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>,
  VolMute:    () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>,
  Back10:     () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="8.5" y="15.5" fontSize="5" fontWeight="bold" fill="currentColor">10</text></svg>,
  Fwd10:      () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="8.5" y="15.5" fontSize="5" fontWeight="bold" fill="currentColor">10</text></svg>,
  Fullscreen: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>,
  ExitFs:     () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>,
  Settings:   () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  Share:      () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>,
  Arrow:      () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  Theater:    () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/></svg>,
  Headphones: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C7.03 1 3 5.03 3 10v7c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-1c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"/></svg>,
  Video:      () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>,
  Lock:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/></svg>,
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Spinner Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function Spinner() {
  return (
    <div className="wp-spinner">
      <div className="wp-spinner__ring" />
    </div>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// VIDEO PLAYER
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
interface PlayerProps {
  src:       string;
  mimeType?: string;
  poster?:   string;
  title?:    string;
  subtitle?: string;
  onBack?:   () => void;
}

function VideoPlayer({ src, mimeType, poster, title, subtitle, onBack }: PlayerProps) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const volumeRef    = useRef<HTMLDivElement>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [playing,      setPlaying]      = useState(false);
  const [ended,        setEnded]        = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [buffered,     setBuffered]     = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [muted,        setMuted]        = useState(false);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [theater,      setTheater]      = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [seeking,      setSeeking]      = useState(false);
  const [hoverTime,    setHoverTime]    = useState<number | null>(null);
  const [hoverX,       setHoverX]       = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [speed,        setSpeed]        = useState(1);
  const [nudge,        setNudge]        = useState<string | null>(null);
  const [videoError,   setVideoError]   = useState('');
  const [audioOnly,    setAudioOnly]    = useState(false);

  const resetHide = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!seeking && !showSettings) setShowControls(false);
    }, 3000);
  }, [seeking, showSettings]);

  useEffect(() => {
    resetHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const v = videoRef.current;
      if (!v) return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': e.preventDefault(); seek(10);  break;
        case 'ArrowLeft':  e.preventDefault(); seek(-10); break;
        case 'ArrowUp':    e.preventDefault(); changeVolume(0.1);  break;
        case 'ArrowDown':  e.preventDefault(); changeVolume(-0.1); break;
        case 'm': toggleMute(); break;
        case 'f': toggleFullscreen(); break;
        case 't': setTheater(t => !t); break;
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [playing, muted]);

  useEffect(() => {
    function onFsChange() { setFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (ended) { v.currentTime = 0; setEnded(false); }
    if (v.paused) {
      playPromiseRef.current = v.play();
      playPromiseRef.current
        ?.then(() => { playPromiseRef.current = null; setPlaying(true); })
        .catch(err => {
          if (err.name !== 'AbortError' && err.name !== 'NotSupportedError') {
            console.warn('play() error:', err.name, err.message);
          }
        });
    } else {
      const safe = () => { v.pause(); setPlaying(false); };
      if (playPromiseRef.current) playPromiseRef.current.then(safe, safe);
      else safe();
    }
    resetHide();
  }

  function seek(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = clamp(v.currentTime + delta, 0, v.duration || 0);
    setNudge(delta > 0 ? `+${delta}s` : `${delta}s`);
    setTimeout(() => setNudge(null), 900);
    resetHide();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function changeVolume(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    const nv = clamp(v.volume + delta, 0, 1);
    v.volume = nv;
    setVolume(nv);
    setMuted(nv === 0);
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  }

  function onProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = progressRef.current; const v = videoRef.current;
    if (!el || !v) return;
    const rect = el.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * (v.duration || 0);
  }

  function onProgressHover(e: React.MouseEvent<HTMLDivElement>) {
    const el = progressRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHoverTime(((e.clientX - rect.left) / rect.width) * (duration || 0));
    setHoverX(e.clientX - rect.left);
  }

  function onVolumeClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = volumeRef.current; const v = videoRef.current;
    if (!el || !v) return;
    const rect = el.getBoundingClientRect();
    const nv = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    v.volume = nv; setVolume(nv); setMuted(nv === 0);
    if (v.muted && nv > 0) { v.muted = false; setMuted(false); }
  }

  function setPlaybackSpeed(s: number) {
    const v = videoRef.current;
    if (v) v.playbackRate = s;
    setSpeed(s);
    setShowSettings(false);
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const VolumeIcon  = muted || volume === 0 ? Icons.VolMute : volume < 0.5 ? Icons.VolLow : Icons.VolHigh;

  if (videoError) {
    return (
      <div className="wp wp--error" ref={containerRef}>
        {poster && <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />}
        <div className="wp__gradient-bottom" style={{ opacity: 1 }} />
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 24 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="rgba(255,255,255,0.4)"/>
          </svg>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', maxWidth: 320 }}>{videoError}</p>
          <button onClick={() => { setVideoError(''); setLoading(true); const v = videoRef.current; if (v) { v.load(); } }}
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '9px 20px', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Audio-only mode Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  if (audioOnly) {
    return (
      <div className="wp" ref={containerRef} style={{ minHeight: 280, background: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
        {poster && <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(48px)', opacity: 0.18 }} />}
        <div className="wp__gradient-bottom" style={{ opacity: 1 }} />
        <div className="wp__topbar" style={{ opacity: 1, transform: 'none', pointerEvents: 'all', position: 'relative', zIndex: 5 }}>
          {onBack && <button className="wp__btn wp__btn--back" onClick={onBack}><Icons.Arrow /></button>}
          <div className="wp__meta">
            {title && <span className="wp__title">{title}</span>}
            {subtitle && <span className="wp__subtitle">{subtitle}</span>}
          </div>
          <button className="wp__btn" title="Switch to video" onClick={() => setAudioOnly(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '6px 10px', color: 'rgba(255,255,255,0.6)' }}>
            <Icons.Video />
            <span style={{ fontSize: 11 }}>Video</span>
          </button>
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '12px 40px 32px', flex: 1, justifyContent: 'center' }}>
          <div style={{ width: 140, height: 140, borderRadius: 8, overflow: 'hidden', background: '#1a1a1a', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', flexShrink: 0 }}>
            {poster
              ? <img src={poster} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
            }
          </div>
          <audio src={src} controls autoPlay={false} style={{ width: '100%', maxWidth: 480, borderRadius: 4 }}>
            <source src={src} type={mimeType || 'audio/mpeg'} />
          </audio>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`wp ${theater ? 'wp--theater' : ''} ${fullscreen ? 'wp--fullscreen' : ''} ${showControls ? 'wp--controls-visible' : ''}`}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={() => { if (!seeking) togglePlay(); }}
    >
      <video
        ref={videoRef}
        src={src}
        className="wp__video"
        poster={poster}
        playsInline
        preload="metadata"
        onLoadedMetadata={() => { setDuration(videoRef.current?.duration ?? 0); setLoading(false); }}
        onTimeUpdate={() => {
          const v = videoRef.current; if (!v) return;
          setCurrentTime(v.currentTime);
          if (v.buffered.length > 0) setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlay={() => { setPlaying(true); setEnded(false); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setEnded(true); setShowControls(true); }}
        onVolumeChange={() => { const v = videoRef.current; if (v) { setVolume(v.volume); setMuted(v.muted); } }}
        onError={(e) => {
          const v = e.currentTarget;
          const code = v.error?.code ?? 0;
          const msgs: Record<number, string> = {
            1: 'Playback was aborted.',
            2: 'A network error occurred Ã¢â‚¬â€ check your connection.',
            3: 'The video could not be decoded.',
            4: 'This video format is not supported by your browser.',
          };
          setVideoError(msgs[code] || 'Playback failed Ã¢â‚¬â€ please try again.');
          setLoading(false);
        }}
      />

      {loading && <Spinner />}
      {nudge && <div className="wp__nudge">{nudge}</div>}
      <div className="wp__gradient-top" />
      <div className="wp__gradient-bottom" />

      <div className="wp__topbar">
        {onBack && (
          <button className="wp__btn wp__btn--back" onClick={e => { e.stopPropagation(); onBack(); }}>
            <Icons.Arrow />
          </button>
        )}
        <div className="wp__meta">
          {title && <span className="wp__title">{title}</span>}
          {subtitle && <span className="wp__subtitle">{subtitle}</span>}
        </div>
        <div className="wp__topbar-actions">
          <button className="wp__btn" title="Share"
            onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(window.location.href); }}>
            <Icons.Share />
          </button>
        </div>
      </div>

      {!loading && (
        <div className={`wp__center-indicator ${!playing || ended ? 'wp__center-indicator--visible' : ''}`}>
          {ended ? <Icons.Replay /> : playing ? <Icons.Pause /> : <Icons.Play />}
        </div>
      )}

      <div className="wp__controls" onClick={e => e.stopPropagation()}>
        <div className="wp__progress-wrap">
          <div ref={progressRef} className="wp__progress"
            onClick={onProgressClick} onMouseMove={onProgressHover}
            onMouseLeave={() => setHoverTime(null)}>
            <div className="wp__progress__buffered" style={{ width: `${buffered}%` }} />
            <div className="wp__progress__played"   style={{ width: `${progressPct}%` }} />
            <div className="wp__progress__thumb"    style={{ left: `${progressPct}%` }} />
            {hoverTime !== null && (
              <div className="wp__progress__hover-time" style={{ left: hoverX }}>{fmtTime(hoverTime)}</div>
            )}
          </div>
        </div>

        <div className="wp__ctrl-row">
          <div className="wp__ctrl-left">
            <button className="wp__btn" onClick={e => { e.stopPropagation(); seek(-10); }}><Icons.Back10 /></button>
            <button className="wp__btn wp__btn--play" onClick={e => { e.stopPropagation(); togglePlay(); }}>
              {ended ? <Icons.Replay /> : playing ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <button className="wp__btn" onClick={e => { e.stopPropagation(); seek(10); }}><Icons.Fwd10 /></button>

            <div className="wp__volume-wrap">
              <button className="wp__btn" onClick={e => { e.stopPropagation(); toggleMute(); }}><VolumeIcon /></button>
              <div ref={volumeRef} className="wp__volume-slider" onClick={e => { e.stopPropagation(); onVolumeClick(e); }}>
                <div className="wp__volume-slider__fill"  style={{ width: `${muted ? 0 : volume * 100}%` }} />
                <div className="wp__volume-slider__thumb" style={{ left: `${muted ? 0 : volume * 100}%` }} />
              </div>
            </div>

            <span className="wp__time">
              {fmtTime(currentTime)} <span className="wp__time-sep">/</span> {fmtTime(duration)}
            </span>
          </div>

          <div className="wp__ctrl-right">
            <div className="wp__settings-wrap">
              <button className="wp__btn wp__btn--settings" onClick={e => { e.stopPropagation(); setShowSettings(s => !s); }}>
                <Icons.Settings />
                {speed !== 1 && <span className="wp__speed-badge">{speed}Ãƒâ€”</span>}
              </button>
              {showSettings && (
                <div className="wp__settings-panel" onClick={e => e.stopPropagation()}>
                  <div className="wp__settings-label">Playback speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                    <button key={s}
                      className={`wp__settings-item ${speed === s ? 'wp__settings-item--active' : ''}`}
                      onClick={() => setPlaybackSpeed(s)}>
                      {s === 1 ? 'Normal' : `${s}Ãƒâ€”`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className={`wp__btn ${theater ? 'wp__btn--active' : ''}`} title="Theater mode (t)"
              onClick={e => { e.stopPropagation(); setTheater(t => !t); }}>
              <Icons.Theater />
            </button>

            {/* Audio-only mode */}
            <button className="wp__btn" title="Switch to audio-only mode"
              onClick={e => { e.stopPropagation(); setAudioOnly(true); }}>
              <Icons.Headphones />
            </button>

            <button className="wp__btn" title="Fullscreen (f)"
              onClick={e => { e.stopPropagation(); toggleFullscreen(); }}>
              {fullscreen ? <Icons.ExitFs /> : <Icons.Fullscreen />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// WATCH PAGE
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
export default function WatchPage() {
  const { slug } = useParams() as { slug: string };
  const router   = useRouter();

  const [content,      setContent]      = useState<ContentDetail | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [resolvedUrl,  setResolvedUrl]  = useState('');
  const [resolvedMime, setResolvedMime] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API}/api/content/watch/${slug}`, { headers, credentials: 'include' })
      .then(r => r.json())
      .then(async d => {
        if (!d?.success || !d?.data) {
          setError(d?.error || 'Content not found');
          return;
        }
        const data = d.data;
        setContent(data);

        // For premium content, fetch a signed URL via ContentPremiumController
        // For free content, use storage.originalUrl directly
        if (data.isPremium && token) {
          try {
            const playRes = await fetch(
              `${API}/api/content/${data.slug || data._id}/play`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (playRes.ok) {
              const pd = await playRes.json();
              const url = pd.playUrl || pd.url || '';
              if (url) {
                setResolvedUrl(url);
                setResolvedMime(pd.mimeType || data.storage?.mimeType || '');
                return;
              }
            }
          } catch { /* fall through to storage.originalUrl */ }
        }
        // Free content or failed premium fetch Ã¢â‚¬â€ use raw URL
        setResolvedUrl(data.storage?.originalUrl ?? '');
        setResolvedMime(data.storage?.mimeType ?? '');
      })
      .catch(() => setError('Failed to load content'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="wp-page wp-page--loading">
      <Spinner />
      <p>LoadingÃ¢â‚¬Â¦</p>
    </div>
  );

  if (error || !content) return (
    <div className="wp-page wp-page--error">
      <h2>Content not found</h2>
      <p>{error}</p>
      <Link href="/watch" className="wp-back-link">Ã¢â€ Â Back to Watch</Link>
    </div>
  );

  // Use signed URL for premium content, raw URL for free content
  const videoSrc  = resolvedUrl || content.storage?.originalUrl || '';
  const mimeType  = resolvedMime || content.storage?.mimeType || '';
  const poster    = content.images?.backdrop || content.images?.poster || content.storage?.thumbnail;

  // Audio-only mode is opt-in via toggle Ã¢â‚¬â€ not auto-detected by type.
  // Podcasts and music may be video files and should play in the video player by default.
  const genre     = Array.isArray(content.metadata?.genre)
    ? content.metadata!.genre.join(', ')
    : content.metadata?.genre ?? '';
  const cast      = content.metadata?.cast ?? [];
  const typeLabel = ({
    minisode: 'Minisode', movie: 'Movie', tv_episode: 'Episode',
    stage_play: 'Stage Play', reelfilm: 'Short Film', podcast: 'Podcast', music: 'Music',
  } as Record<string, string>)[content.type] ?? content.type;

  const subtitle = content.series?.title
    ? `${content.series.title}${content.season ? ` Ã‚Â· S${content.season}` : ''}${content.episode ? ` E${content.episode}` : ''}`
    : content.hostName ?? '';

  // Ã¢â€â‚¬Ã¢â€â‚¬ Premium gate Ã¢â‚¬â€ no URL means user isn't subscribed Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const showPremiumGate = !videoSrc && content.isPremium;

  return (
    <div className="wp-page">

      <div className="wp-page__player-wrap">
        {videoSrc ? (
          <VideoPlayer
            src={videoSrc}
            mimeType={mimeType}
            poster={poster}
            title={content.title}
            subtitle={subtitle}
            onBack={() => router.back()}
          />
        ) : showPremiumGate ? (
          <div className="wp-no-media">
            {poster && <img src={poster} alt={content.title} className="wp-no-media__poster" />}
            <div className="wp-no-media__overlay">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Lock />
                </div>
                <p style={{ color: '#D4AF37', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', margin: 0 }}>
                  HL+ Premium Required
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0, textAlign: 'center', maxWidth: 280 }}>
                  Subscribe to House Levi+ to watch this content.
                </p>
                <Link href="/premium-access"
                  style={{ background: '#D4AF37', color: '#000', padding: '10px 28px', borderRadius: 3,
                    fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: '0.04em' }}>
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="wp-no-media">
            {poster && <img src={poster} alt={content.title} className="wp-no-media__poster" />}
            <div className="wp-no-media__overlay">
              <p>Media not yet available</p>
            </div>
          </div>
        )}
      </div>

      <div className="wp-info">
        <div className="wp-info__inner">
          <Link href="/watch" className="wp-info__back">
            <Icons.Arrow /> Back to Watch
          </Link>

          <div className="wp-info__header">
            <div className="wp-info__badges">
              <span className="wp-badge wp-badge--type">{typeLabel}</span>
              {content.isNewContent && <span className="wp-badge wp-badge--new">NEW</span>}
              {content.isPremium    && <span className="wp-badge wp-badge--premium">HL+</span>}
              {content.metadata?.releaseYear && <span className="wp-badge wp-badge--year">{content.metadata.releaseYear}</span>}
              {genre && <span className="wp-badge wp-badge--genre">{genre}</span>}
            </div>
            <h1 className="wp-info__title">{content.title}</h1>
            {subtitle && <p className="wp-info__subtitle">{subtitle}</p>}
          </div>

          {content.description && <p className="wp-info__desc">{content.description}</p>}

          <div className="wp-info__meta">
            {content.displayDuration && (
              <span className="wp-meta-item">
                <span className="wp-meta-label">Duration</span>
                {content.displayDuration}
              </span>
            )}
            {content.metadata?.director && (
              <span className="wp-meta-item">
                <span className="wp-meta-label">Director</span>
                {content.metadata.director}
              </span>
            )}
            {content.hostName && (
              <span className="wp-meta-item">
                <span className="wp-meta-label">Host</span>
                {content.hostSlug
                  ? <Link href={`/hosts/${content.hostSlug}`} className="wp-meta-link">{content.hostName}</Link>
                  : content.hostName
                }
              </span>
            )}
          </div>

          {cast.length > 0 && (
            <div className="wp-info__cast">
              <span className="wp-meta-label">Starring</span>
              <span>{cast.join(' Ã‚Â· ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}