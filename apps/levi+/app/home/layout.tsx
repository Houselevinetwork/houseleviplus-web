import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'House Levi+ | Premium Content, Merchandise & Entertainment',
  description: 'Discover exclusive African content, premium merchandise, travel packages, and entertainment. Stream live shows, trending videos, and shop from your favorite creators on House Levi+.',
  keywords: [
    'streaming',
    'merchandise',
    'african content',
    'entertainment',
    'travel packages',
    'premium content',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://houselevi.com',
    title: 'House Levi+ | Premium Content & Merchandise',
    description: 'Discover exclusive African content and premium merchandise',
    siteName: 'House Levi+',
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
