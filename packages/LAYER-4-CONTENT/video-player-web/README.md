# @reelafrika/video-player-web

HLS video player component for web platforms using HLS.js.

## Features
- Adaptive bitrate streaming
- HLS support
- Safari native HLS fallback
- Progress tracking
- Completion callbacks

## Usage
```tsx
import { VideoPlayer } from '@reelafrika/video-player-web';

<VideoPlayer
  src="https://cdn.example.com/video.m3u8"
  poster="https://cdn.example.com/thumbnail.jpg"
  autoplay={false}
  onProgress={(time) => console.log('Progress:', time)}
  onComplete={() => console.log('Video completed')}
/>
```
