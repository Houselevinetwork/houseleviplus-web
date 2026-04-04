'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

export default function SplashScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Give animation time to complete before redirect
      setTimeout(() => {
        router.push('/home');
      }, 800);
    }, 5500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`splash ${isExiting ? 'splash--exit' : ''}`}>
      {/* Blue glow background */}
      <div className="splash-glow"></div>

      <div className="content">
        {/* Logo Container */}
        <div className="logo-container">
          <div className="logo">
            <span className="logo-text">HOUSE LEVI</span>
            <span className="logo-plus">+</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="tagline">Watch.Shop.Travel</p>

        {/* Loading indicator */}
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
