'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

export default function SplashScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        router.push('/login');
      }, 800);
    }, 5500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`splash ${isExiting ? 'splash--exit' : ''}`}>
      <div className="splash-glow"></div>
      <div className="content">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-text">HOUSE LEVI</span>
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