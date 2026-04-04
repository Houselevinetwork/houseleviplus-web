// frontend/admin/src/lib/types.ts
// Type definitions for content (NO MOCK DATA)

export type MediaType = 
  | "miniseries"
  | "reelfilm"
  | "stageplay"
  | "tvshow"
  | "movie"
  | "podcast"
  | "music";

export type ContentStatus = "draft" | "uploaded" | "processing" | "error";

export interface Content {
  season: any;
  episode: any;
  _id: string;
  id?: string;
  title: string;
  description: string;
  type: MediaType;
  status: ContentStatus;
  uploaderId: string;
  storage: {
    originalUrl?: string;
    cloudflareKey?: string;
    cloudflareStreamId?: string;
    size?: number;
    mimeType?: string;
    provider?: string;
  };
  metadata?: {
    artist: any;
    album: any;
    mediaType?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    season?: number;
    episode?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper to format file size
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
};

// Helper to format duration
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Map backend types to frontend types
export const mapBackendType = (backendType: string): MediaType => {
  if (!backendType) return 'reelfilm';
  
  const typeMap: Record<string, MediaType> = {
    'minisode': 'miniseries',
    'miniseries': 'miniseries',
    'reelfilm': 'reelfilm',
    'tv_episode': 'tvshow',
    'tvshow': 'tvshow',
    'tv-show': 'tvshow',
    'stageplay': 'stageplay',
    'stage_play': 'stageplay',
    'movie': 'movie',
    'podcast': 'podcast',
    'music': 'music',
  };
  
  const normalized = backendType.toLowerCase().replace(/[_\s-]/g, '');
  
  // Try exact match first
  if (typeMap[backendType.toLowerCase()]) {
    return typeMap[backendType.toLowerCase()];
  }
  
  // Try normalized match
  for (const [key, value] of Object.entries(typeMap)) {
    if (key.replace(/[_\s-]/g, '') === normalized) {
      return value;
    }
  }
  
  // Default fallback
  return 'reelfilm';
};