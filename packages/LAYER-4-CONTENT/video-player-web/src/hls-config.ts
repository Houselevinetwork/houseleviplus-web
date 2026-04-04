// HLS.js configuration for adaptive streaming
import Hls from 'hls.js';

export const hlsConfig: Partial<Hls['config']> = {
  debug: false,
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
};

export function createHlsInstance(config?: Partial<Hls['config']>) {
  return new Hls({
    ...hlsConfig,
    ...config,
  });
}
