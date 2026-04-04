/**
 * Linear TV / Mood TV Types
 * These are like recipe cards - they tell TypeScript what data looks like
 */

export interface MoodTVBlock {
  _id: string;                    // MongoDB ID
  name: string;                   // "Coffee Jazz"
  startTime: string;              // "06:00"
  endTime: string;                // "10:00"
  videoId: string;                // Cloudflare Stream video ID
  daysOfWeek: number[];           // [0,1,2,3,4,5,6] = Every day
  isActive: boolean;              // true = this block is enabled
  priority: number;               // Higher number = higher priority
  metadata: {
    title: string;                // "Coffee Jazz Morning Vibes"
    description: string;          // "Start your day with smooth jazz..."
    genre: 'Jazz' | 'Ambient' | 'Podcast' | 'Music' | 'Other';
    thumbnail?: string;           // Optional image URL
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySchedule {
  _id: string;
  date: string;                   // "2026-02-16"
  blocks: MoodTVBlock[];          // Array of all blocks for this day
  version: number;                // For cache busting
  lastUpdated: Date;
}

export interface StreamHealth {
  isLive: boolean;                // Is stream currently broadcasting?
  viewerCount: number;            // How many people watching
  bitrate: number;                // Video quality (Kbps)
  lastChecked: Date;              // When we last checked
}

export interface LiveStreamConfig {
  inputId: string;                // Cloudflare Live Input ID
  rtmpUrl: string;                // Where OBS sends video
  streamKey: string;              // Secret key for OBS
  playbackUrl: string;            // What users click to watch
}
