'use client';

import { LoginSection } from '../components/login/LoginSection';
import { HostsSection } from '../components/home/HostsSection';
import { NewsSection } from '../components/home/NewsSection';
import { TrendingSection } from '../components/home/TrendingSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { ShortsSection } from '../components/home/ShortsSection';
import { SportsSection } from '../components/home/SportsSection';
import { ShopSection } from '../components/home/ShopSection';
import { TravelSection } from '../components/home/TravelSection';
import { QuoteSection } from '../components/home/QuoteSection';
import { useAuthContext } from '@houselevi/auth';

import './page.css';

export default function HomePage() {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <main className="home">
      <section className="home-section" id="login">
        <LoginSection />
      </section>
      
      <section className="home-section" id="hosts">
        <HostsSection />
      </section>
      <section className="home-section" id="news">
        <NewsSection />
      </section>
      <section className="home-section" id="trending">
        <TrendingSection />
      </section>
      <section className="home-section" id="featured">
        <FeaturedSection />
      </section>
      <section className="home-section" id="shorts">
        <ShortsSection />
      </section>
      <section className="home-section" id="sports">
        <SportsSection />
      </section>
      <section className="home-section" id="shop">
        <ShopSection />
      </section>
      <section className="home-section" id="travel">
        <TravelSection />
      </section>
      <section className="home-section" id="quote">
        <QuoteSection />
      </section>
    </main>
  );
}
