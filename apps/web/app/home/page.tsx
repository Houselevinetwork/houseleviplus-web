'use client';

import HomeHero         from './components/HomeHero';
import UpcomingEvents   from './components/UpcomingEvents';
import FeaturedArtists  from './components/FeaturedArtists';
import PartnersSection  from './components/PartnersSection';
import QuoteSection     from './components/QuoteSection';
import HLLiveTV         from './components/HLLiveTV';
import CrossPromo       from './components/CrossPromo';
import './home.css';

export default function HomePage() {
  return (
    <main className="home-page">
      {/* 1. Hero  cinematic gallery slideshow */}
      <HomeHero />

      {/* 2. Upcoming Events API-driven, Book a Seat + Pay for Ticket */}
      <UpcomingEvents />

      {/* 3. Featured Artists  API-driven carousel */}
      <FeaturedArtists />

      {/* 4. Partners API-driven logo strip */}
      <PartnersSection />

      {/* 5. Cross-promo Watch / Shop / Travel slideshows */}
      <CrossPromo />

      {/* 6. Quote API-driven */}
      <QuoteSection />

      {/* 7. HL Live TV */}
      <HLLiveTV />
    </main>
  );
}
