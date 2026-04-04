export interface FallbackConfig {
  enabled: boolean;
  fallbackVideoId?: string;
  fallbackMessage?: string;
}

export function shouldUseFallback(isLive: boolean, config: FallbackConfig): boolean {
  return config.enabled && !isLive;
}

export function getFallbackUrl(config: FallbackConfig): string | null {
  if (!config.fallbackVideoId) {
    return null;
  }
  return `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${config.fallbackVideoId}/manifest/video.m3u8`;
}
