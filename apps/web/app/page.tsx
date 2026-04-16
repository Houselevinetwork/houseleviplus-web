'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

export default function SplashScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show splash only once per session.
    // If the user navigated back to '/' from inside the app, skip it.
    const hasSeenSplash = sessionStorage.getItem('splashShown');

    if (hasSeenSplash) {
      router.replace('/home');
      return;
    }

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        sessionStorage.setItem('splashShown', 'true');
        router.push('/home');
      }, 800);
    }, 5500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`splash ${isExiting ? 'splash--exit' : ''}`}>
      {/* Warm cream glow — matches charcoal+cream palette */}
      <div className="splash-glow"></div>

      <div className="content">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-text">HOUSE LEVI</span>
            {/* + in cream #F6F4F0 — matches nav-logo-plus */}
            <span className="logo-plus">+</span>
          </div>
        </div>

        <p className="tagline">Watch.Shop.Travel</p>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}