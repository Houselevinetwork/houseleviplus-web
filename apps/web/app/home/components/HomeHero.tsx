'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface GalleryEvent {
  _id: string;
  name: string;
  slug: string;
  imageCount: number;
  isActive: boolean;
}

interface HomeConfig {
  heroCaption: string;
  heroTitle: string;
  heroMode: string;
  slideshowInterval: number;
  kenBurnsEffect: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// 4 Ken Burns variants — random per image for variety
const KB_ANIMATIONS = [
  'kenBurns0', // zoom in, pan top-left
  'kenBurns1', // zoom in, pan top-right
  'kenBurns2', // zoom in, pan bottom-left
  'kenBurns3', // subtle zoom, no pan
];

export default function HomeHero() {
  const [images, setImages]           = useState<string[]>([]);
  const [events, setEvents]           = useState<GalleryEvent[]>([]);
  const [config, setConfig]           = useState<HomeConfig>({
    heroCaption: 'HL+ FACES',
    heroTitle: 'THE PEOPLES GALLERY',
    heroMode: 'all',
    slideshowInterval: 5000,
    kenBurnsEffect: true,
  });
  const [activeEvent, setActiveEvent] = useState<string>('all');

  // 3-layer state — the key to zero black screen
  const [layers, setLayers] = useState({ prev: '', current: '', next: '' });
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [kbVariant, setKbVariant]     = useState(0);
  const [isPaused, setIsPaused]       = useState(false);
  const [eventLabel, setEventLabel]   = useState('');
  const [showEventLabel, setShowEventLabel] = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const imagesRef   = useRef<string[]>([]);
  const idxRef      = useRef(0);
  const pausedRef   = useRef(false);

  // Keep refs in sync
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);

  // Fetch config + events
  useEffect(() => {
    fetch(`${API}/home/config`)
      .then(r => r.json())
      .then(d => setConfig(c => ({ ...c, ...d })))
      .catch(() => {});

    fetch(`${API}/home/gallery/events`)
      .then(r => r.json())
      .then(d => setEvents(d?.data ?? []))
      .catch(() => {});
  }, []);

  // Preload an image silently
  const preload = (url: string) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  };

  // Fetch images for the active event
  useEffect(() => {
    const eventParam = activeEvent;
    fetch(`${API}/home/gallery/hero?event=${eventParam}&count=30`)
      .then(r => r.json())
      .then(d => {
        const urls: string[] = d?.data ?? [];
        if (urls.length === 0) return;

        setImages(urls);
        imagesRef.current = urls;
        idxRef.current = 0;
        setCurrentIdx(0);
        setKbVariant(Math.floor(Math.random() * KB_ANIMATIONS.length));

        // Prime the 3 layers immediately
        setLayers({
          prev:    '',
          current: urls[0],
          next:    urls[1] ?? urls[0],
        });

        // Preload first 5 images eagerly
        urls.slice(0, 5).forEach(preload);
      })
      .catch(() => {});
  }, [activeEvent]);

  // Advance to next slide
  const advance = useCallback(() => {
    if (pausedRef.current) return;
    const imgs = imagesRef.current;
    if (imgs.length < 2) return;

    const prevIdx    = idxRef.current;
    const nextIdx    = (prevIdx + 1) % imgs.length;
    const afterIdx   = (prevIdx + 2) % imgs.length;

    idxRef.current = nextIdx;
    setCurrentIdx(nextIdx);
    setKbVariant(Math.floor(Math.random() * KB_ANIMATIONS.length));
    setIsTransitioning(true);

    // Update layers — prev fades out, current becomes new image, next preloads
    setLayers({
      prev:    imgs[prevIdx],
      current: imgs[nextIdx],
      next:    imgs[afterIdx],
    });

    // Preload the one after next
    preload(imgs[(prevIdx + 3) % imgs.length]);

    // Clear prev after transition completes
    setTimeout(() => {
      setIsTransitioning(false);
      setLayers(l => ({ ...l, prev: '' }));
    }, 1600);
  }, []);

  // Start/restart timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (images.length > 1) {
      timerRef.current = setInterval(advance, config.slideshowInterval);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images, advance, config.slideshowInterval, isPaused]);

  const handleTabClick = (slug: string, name: string) => {
    if (slug === activeEvent) return;
    setActiveEvent(slug);

    // Show event name overlay briefly
    setEventLabel(name);
    setShowEventLabel(true);
    setTimeout(() => setShowEventLabel(false), 2200);
  };

  const kbAnim = config.kenBurnsEffect ? KB_ANIMATIONS[kbVariant] : 'none';

  return (
    <section
      style={{ position: 'relative', width: '100%', height: '100vh', minHeight: 600, background: '#000', overflow: 'hidden' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* -- LAYER 1: PREV — fades out -------------------------------- */}
      {layers.prev && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: `url(${layers.prev})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 1.6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'opacity',
        }} />
      )}

      {/* -- LAYER 2: CURRENT — Ken Burns ----------------------------- */}
      <div
        key={`${layers.current}-${kbVariant}`}
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          backgroundImage: layers.current
            ? `url(${layers.current})`
            : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          animation: config.kenBurnsEffect
            ? `${KB_ANIMATIONS[kbVariant]} ${config.slideshowInterval + 1000}ms ease-out forwards`
            : 'none',
          willChange: 'transform',
        }}
      />

      {/* -- LAYER 3: NEXT — preloaded, invisible ---------------------- */}
      {layers.next && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${layers.next})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0,
        }} />
      )}

      {/* -- Gradient overlay — cinematic dark-to-dark ----------------- */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.85) 100%)',
      }} />

      {/* -- Event tabs ------------------------------------------------ */}
      {events.length > 0 && (
        <div style={{
          position: 'absolute', top: 32, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex', gap: 6,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '7px 10px',
          borderRadius: 40,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <button
            onClick={() => handleTabClick('all', 'All Events')}
            style={{
              padding: '5px 16px', borderRadius: 20,
              background: activeEvent === 'all' ? '#fff' : 'transparent',
              color: activeEvent === 'all' ? '#000' : 'rgba(255,255,255,0.7)',
              border: '1px solid ' + (activeEvent === 'all' ? '#fff' : 'rgba(255,255,255,0.2)'),
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.3s ease', whiteSpace: 'nowrap',
            }}
          >
            All
          </button>
          {events.map(ev => (
            <button
              key={ev._id}
              onClick={() => handleTabClick(ev.slug, ev.name)}
              style={{
                padding: '5px 16px', borderRadius: 20,
                background: activeEvent === ev.slug ? '#fff' : 'transparent',
                color: activeEvent === ev.slug ? '#000' : 'rgba(255,255,255,0.7)',
                border: '1px solid ' + (activeEvent === ev.slug ? '#fff' : 'rgba(255,255,255,0.2)'),
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.3s ease', whiteSpace: 'nowrap',
              }}
            >
              {ev.name}
            </button>
          ))}
        </div>
      )}

      {/* -- Event name label — fades in on tab switch ----------------- */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 8, pointerEvents: 'none',
        opacity: showEventLabel ? 1 : 0,
        transition: 'opacity 0.5s ease',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(11px, 1.2vw, 14px)',
          fontWeight: 400, letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
        }}>
          {eventLabel}
        </p>
      </div>

      {/* -- Center content -------------------------------------------- */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        textAlign: 'center', padding: '0 40px 80px',
        gap: 16,
      }}>
        {/* Caption */}
        <p style={{
          fontSize: 11, fontWeight: 600,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)', margin: 0,
        }}>
          {config.heroCaption}
        </p>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 72px)',
          fontWeight: 300, color: '#ffffff',
          letterSpacing: '0.08em', lineHeight: 1.0,
          margin: 0, textTransform: 'uppercase',
        }}>
          {config.heroTitle}
        </h1>

        {/* View Gallery CTA */}
        <a
          href="/gallery"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 8, padding: '0 40px', height: 48,
            color: '#fff', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.4)',
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            cursor: 'pointer', transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.15)';
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,0,0,0.2)';
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.4)';
          }}
        >
          View Gallery
        </a>
      </div>

      {/* -- Bottom left counter --------------------------------------- */}
      {images.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 32, left: 48, zIndex: 6,
          display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.08em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {String(currentIdx + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/</span>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {String(images.length).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* -- Progress bar ---------------------------------------------- */}
      {images.length > 1 && !isPaused && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6,
          height: 1, background: 'rgba(255,255,255,0.1)',
        }}>
          <div
            key={`${currentIdx}-${isPaused}`}
            style={{
              height: '100%', background: 'rgba(255,255,255,0.6)',
              animation: `slideProgress ${config.slideshowInterval}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* -- Keyframes ------------------------------------------------- */}
      <style>{`
        @keyframes kenBurns0 {
          0%   { transform: scale(1.0) translate(0%, 0%); }
          100% { transform: scale(1.08) translate(-1.5%, -1.5%); }
        }
        @keyframes kenBurns1 {
          0%   { transform: scale(1.0) translate(0%, 0%); }
          100% { transform: scale(1.08) translate(1.5%, -1.5%); }
        }
        @keyframes kenBurns2 {
          0%   { transform: scale(1.0) translate(0%, 0%); }
          100% { transform: scale(1.06) translate(-1%, 1%); }
        }
        @keyframes kenBurns3 {
          0%   { transform: scale(1.0); }
          100% { transform: scale(1.05); }
        }
        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}

