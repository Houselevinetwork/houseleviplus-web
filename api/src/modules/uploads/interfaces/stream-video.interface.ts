export interface CloudflareStreamVideo {
  uid: string;
  status?: {
    state: 'queued' | 'inprogress' | 'ready' | 'error';
    pct_complete?: number;
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  playbackUrl?: string;
  size?: number;
  duration?: number;
  input?: {
    width?: number;
    height?: number;
  };
  readyToStream?: boolean;
  thumbnail?: string;
  thumbnailTimestampPct?: number;
  created?: string;
  modified?: string;
}