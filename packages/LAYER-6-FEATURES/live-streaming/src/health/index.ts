export interface StreamHealth {
  isLive: boolean;
  viewerCount: number;
  bitrate: number;
  lastChecked: Date;
}

export async function checkStreamHealth(streamUrl: string): Promise<StreamHealth> {
  try {
    const response = await fetch(streamUrl, { method: 'HEAD' });
    return {
      isLive: response.ok,
      viewerCount: 0,
      bitrate: 0,
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      isLive: false,
      viewerCount: 0,
      bitrate: 0,
      lastChecked: new Date(),
    };
  }
}

export function startHealthMonitoring(
  streamUrl: string,
  intervalMs: number = 60000,
  onStatusChange: (health: StreamHealth) => void
) {
  const interval = setInterval(async () => {
    const health = await checkStreamHealth(streamUrl);
    onStatusChange(health);
  }, intervalMs);

  return () => clearInterval(interval);
}
