import type { Metadata } from 'next';
import TravelPageClient from './TravelPageClient';
import './page.css';

export const metadata: Metadata = {
  title: 'Travel',
  description:
    'Discover curated premium travel experiences handpicked by House Levi+. Exclusive destinations, luxury packages and travel editorial from across Africa and beyond.',
  openGraph: {
    title: 'Travel | House Levi+',
    description:
      'Discover curated premium travel experiences handpicked by House Levi+. Exclusive destinations and luxury packages.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'House Levi+ Travel — Curated Luxury Experiences',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel | House Levi+',
    description:
      'Discover curated premium travel experiences handpicked by House Levi+.',
    images: ['/og-image.jpg'],
  },
};

export default function TravelPage() {
  return <TravelPageClient />;
}