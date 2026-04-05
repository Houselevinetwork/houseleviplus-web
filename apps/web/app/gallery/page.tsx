'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from '@houselevi/auth';
import BuyCoffeeModal from '../home/components/BuyCoffeeModal';
import DownloadModal from '../home/components/DownloadModal';

interface GalleryEvent {
  _id: string;
  name: string;
  slug: string;
  imageCount: number;
  coverImageUrl: string;
}

interface GalleryImage {
  _id: string;
  publicUrl: string;
  originalName: string;
}

const API        = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const COFFEE_URL = 'https://buymeacoffee.com/houselevi';

export default function GalleryPage() {
  const { isAuthenticated } = useAuthContext();

  const [events, setEvents]               = useState<GalleryEvent[]>([]);
  const [activeEvent, setActiveEvent]     = useState<string>('all');
  const [images, setImages]               = useState<GalleryImage[]>([]);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(false);
  const [downloadImage, setDownloadImage] = useState<string | null>(null);
  const [showCoffee, setShowCoffee]       = useState(false);

  // Check if we came back from login with a pending download
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const action = sessionStorage.getItem('hl_post_login_action');
      if (action === 'download') {
        sessionStorage.removeItem('hl_post_login_action');
        sessionStorage.removeItem('hl_post_login_redirect');
        // Small delay so the page is fully ready
        setTimeout(() => {
          const msg = document.createElement('div');
          msg.textContent = 'You are signed in Ã¯Â¿Â½ click any photo to download.';
          msg.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#000;color:#fff;padding:12px 24px;font-size:13px;letter-spacing:0.06em;z-index:9999;animation:fadeOut 3s forwards';
          document.body.appendChild(msg);
          setTimeout(() => msg.remove(), 3200);
        }, 600);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetch(`${API}/home/gallery/events`)
      .then(r => r.json())
      .then(d => setEvents(d?.data ?? []))
      .catch(() => {});
  }, []);

  const loadImages = useCallback(async (eventSlug: string, pg: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/home/gallery?event=${eventSlug}&page=${pg}&limit=60`);
      const d   = await res.json();
      if (pg === 1) {
        setImages(d?.images ?? []);
      } else {
        setImages(prev => [...prev, ...(d?.images ?? [])]);
      }
      setTotalPages(d?.pages ?? 1);
      setTotal(d?.total ?? 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
    setImages([]);
    loadImages(activeEvent, 1);
  }, [activeEvent, loadImages]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadImages(activeEvent, next);
  };

  const handleImageClick = (imageUrl: string) => {
    if (isAuthenticated) {
      // Already logged in Ã¯Â¿Â½ download directly, no modal
      triggerDownload(imageUrl);
      // Show coffee modal after download
      setTimeout(() => setShowCoffee(true), 400);
    } else {
      // Not logged in Ã¯Â¿Â½ show sign-in prompt
      setDownloadImage(imageUrl);
    }
  };

  const triggerDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() ?? 'hl-photo.jpg';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSuccess = () => {
    setDownloadImage(null);
    setTimeout(() => setShowCoffee(true), 400);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    }}>

      {/* -- Header -------------------------------------------------- */}
      <div style={{ padding: '80px 60px 40px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 12px' }}>
          HL+ Faces
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 300, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          The Peoples Gallery
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {total > 0 && (
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', margin: 0 }}>
              {total.toLocaleString()} photos
            </p>
          )}
          {!isAuthenticated && (
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', margin: 0 }}>
              Ã¯Â¿Â½ Sign in to download
            </p>
          )}
        </div>
      </div>

      {/* -- Event selector ------------------------------------------ */}
      {events.length > 0 && (
        <div style={{ padding: '32px 60px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', margin: '0 0 20px' }}>
            Choose an event
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveEvent('all')}
              style={{
                padding: '10px 20px',
                background: activeEvent === 'all' ? '#000' : 'transparent',
                color: activeEvent === 'all' ? '#fff' : '#000',
                border: '1px solid rgba(0,0,0,0.2)',
                fontSize: 12, fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              All Events
            </button>
            {events.map(ev => (
              <button
                key={ev._id}
                onClick={() => setActiveEvent(ev.slug)}
                style={{
                  padding: '10px 20px',
                  background: activeEvent === ev.slug ? '#000' : 'transparent',
                  color: activeEvent === ev.slug ? '#fff' : '#000',
                  border: '1px solid rgba(0,0,0,0.2)',
                  fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {ev.name}
                {ev.imageCount > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.6 }}>
                    ({ev.imageCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -- Photo grid ---------------------------------------------- */}
      <div style={{ padding: '40px 60px 80px' }}>
        {loading && images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(0,0,0,0.3)', fontSize: 14 }}>
            Loading photos...
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(0,0,0,0.3)', fontSize: 14 }}>
            No photos yet for this event.
          </div>
        ) : (
          <>
            <div style={{ columns: '4 220px', columnGap: 8 }}>
              {images.map((img, index) => (
                <div
                  key={img._id}
                  style={{
                    breakInside: 'avoid', marginBottom: 8,
                    position: 'relative', overflow: 'hidden',
                    cursor: 'pointer', background: '#f0f0f0', display: 'block',
                  }}
                  onClick={() => handleImageClick(img.publicUrl)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.publicUrl}
                    alt={img.originalName ?? 'Gallery photo'}
                    loading={index < 20 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                      display: 'block', width: '100%',
                      height: 'auto', minHeight: '120px',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onLoad={e => { (e.currentTarget as HTMLImageElement).style.minHeight = '0'; }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Hover overlay */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.3s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.35)';
                      const span = e.currentTarget.querySelector('span') as HTMLSpanElement;
                      if (span) span.style.opacity = '1';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0)';
                      const span = e.currentTarget.querySelector('span') as HTMLSpanElement;
                      if (span) span.style.opacity = '0';
                    }}
                  >
                    <span style={{
                      color: '#fff', fontSize: 12,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      fontWeight: 500, opacity: 0,
                      transition: 'opacity 0.3s', pointerEvents: 'none',
                    }}>
                      {isAuthenticated ? '? Download' : '? Sign in to download'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div style={{ textAlign: 'center', marginTop: 60 }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{
                    padding: '14px 48px',
                    background: '#000', color: '#fff',
                    border: 'none', fontSize: 13,
                    fontWeight: 500, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Loading...' : `Load More (${total - images.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sign-in modal Ã¯Â¿Â½ only shown when not authenticated */}
      {downloadImage && !isAuthenticated && (
        <DownloadModal
          imageUrl={downloadImage}
          onClose={() => setDownloadImage(null)}
          onSuccess={handleDownloadSuccess}
        />
      )}

      {/* Coffee modal */}
      {showCoffee && (
        <BuyCoffeeModal
          onBuyNow={() => { window.open(COFFEE_URL, '_blank'); setShowCoffee(false); }}
          onNextTime={() => setShowCoffee(false)}
        />
      )}

      <style>{`
        @keyframes fadeOut {
          0%,70% { opacity: 1; }
          100%    { opacity: 0; }
        }
      `}</style>
    </main>
  );
}


