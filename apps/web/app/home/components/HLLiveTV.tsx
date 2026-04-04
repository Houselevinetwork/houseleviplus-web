'use client';

import { useRouter } from 'next/navigation';

export default function HLLiveTV() {
  const router = useRouter();

  return (
    <section className="mood-tv-section">
      <div className="mood-tv-content">
        <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: '0 0 16px' }}>
          Streaming Now
        </p>
        <h3>HL Live TV</h3>
        <p>Real-time broadcasts, live performances and exclusive content</p>

        {/* Live pulse indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 0 32px' }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: '#ff3b30',
            boxShadow: '0 0 0 0 rgba(255,59,48,0.4)',
            animation: 'livePulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
            Live
          </span>
        </div>

        <button className="cta-button" onClick={() => router.push('/live-tv')}>
          Watch Live
        </button>
      </div>

      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,59,48,0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(255,59,48,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,59,48,0); }
        }
      `}</style>
    </section>
  );
}
