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
      {/* 1. Hero ÃƒÂ¯Ã‚Â¿Ã‚Â½ cinematic gallery slideshow */}
      <HomeHero />

      {/* 2. Upcoming Events ÃƒÂ¯Ã‚Â¿Ã‚Â½ API-driven, Book a Seat + Pay for Ticket */}
      <UpcomingEvents />

      {/* 3. Featured Artists ÃƒÂ¯Ã‚Â¿Ã‚Â½ API-driven carousel */}
      <FeaturedArtists />

      {/* 4. Partners ÃƒÂ¯Ã‚Â¿Ã‚Â½ API-driven logo strip */}
      <PartnersSection />

      {/* 5. Cross-promo ÃƒÂ¯Ã‚Â¿Ã‚Â½ Watch / Shop / Travel slideshows */}
      <CrossPromo />

      {/* 6. Quote ÃƒÂ¯Ã‚Â¿Ã‚Â½ API-driven */}
      <QuoteSection />

      {/* 7. HL Live TV */}
      <HLLiveTV />
    </main>
  );
}
