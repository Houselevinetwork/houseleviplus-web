import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from './ClientLayout'

// ─────────────────────────────────────────────────────────────────────────────
// FONT
// ─────────────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',          // prevents invisible text during font load
  variable: '--font-inter', // exposes as CSS var for Tailwind if needed
})

// ─────────────────────────────────────────────────────────────────────────────
// VIEWPORT  (separate export required by Next.js 13.4+)
// ─────────────────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,           // allow user zoom — accessibility requirement
  themeColor: '#2E2E2E',    // matches charcoal navbar; colours Android Chrome bar
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA  — Netflix-grade SEO
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {

  // ── 1. metadataBase — REQUIRED for og/twitter images to resolve ────────────
  //       Without this Next.js silently drops relative image URLs in production
  metadataBase: new URL('https://houselevi.com'),

  // ── 2. Title ───────────────────────────────────────────────────────────────
  //       template applies to every child page: "Watch | House Levi+"
  title: {
    default:  'Watch Theatre, TV Shows, Movies, Podcasts, Documentaries & Live TV | House Levi+',
    template: '%s | House Levi+',
  },

  // ── 3. Description — 150–160 chars, action-oriented, keyword-rich ──────────
  description:
    'Stream exclusive theatre shows, TV series, movies, podcasts, documentaries and 24-hour live TV on House Levi+. Watch now at houselevi.com.',

  // ── 4. keywords — intentionally OMITTED (Google has ignored since 2009) ────

  // ── 5. Authorship ──────────────────────────────────────────────────────────
  authors:   [{ name: 'House Levi+', url: 'https://houselevi.com' }],
  creator:   'House Levi+',
  publisher: 'House Levi+',

  // ── 6. Canonical + language alternates ────────────────────────────────────
  alternates: {
    canonical: 'https://houselevi.com',
    languages: {
      'en-US': 'https://houselevi.com',
      'en-GB': 'https://houselevi.com/en-gb',
      // Add more as you expand: 'fr-FR', 'sw-KE', etc.
    },
  },

  // ── 7. Robots — full Google video/image/snippet permissions ───────────────
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,      // allows full video previews in search results
      'max-image-preview': 'large', // allows large image previews
      'max-snippet':       -1,      // allows full text snippets
    },
  },

  // ── 8. OpenGraph — controls every link unfurl (WhatsApp, Facebook, Slack) ──
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         'https://houselevi.com',
    siteName:    'House Levi+',
    title:       'House Levi+ | Watch Theatre, TV Shows, Movies, Podcasts, Documentaries & Live TV',
    description:
      'Stream exclusive theatre shows, TV series, movies, podcasts, documentaries and 24-hour live TV on House Levi+. Watch now at houselevi.com.',
    images: [
      {
        url:    '/og-image.jpg',   // place a 1200×630 image in /public/og-image.jpg
        width:  1200,
        height: 630,
        alt:    'House Levi+ — Watch Theatre, TV Shows, Movies & Live TV',
        type:   'image/jpeg',
      },
    ],
  },

  // ── 9. Twitter / X card ────────────────────────────────────────────────────
  //       summary_large_image = full-width cinematic preview on every share
  twitter: {
    card:        'summary_large_image',
    site:        '@houseleviplus',
    creator:     '@houseleviplus',
    title:       'House Levi+ | Watch Theatre, TV Shows, Movies, Podcasts & Live TV',
    description:
      'Stream exclusive theatre shows, TV series, movies, podcasts, documentaries and 24-hour live TV on House Levi+.',
    images: ['/twitter-image.jpg'], // ideally 1200×628, same as og-image is fine
  },

  // ── 10. Favicon / icons ────────────────────────────────────────────────────
  //        Replaces the broken 469×469 favicon.ico currently in production
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico',       sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#2E2E2E' }],
  },

  // ── 11. Web App Manifest (PWA / home screen) ───────────────────────────────
  manifest: '/manifest.json',

  // ── 12. Apple Web App (iOS home screen behaviour) ─────────────────────────
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'House Levi+',
  },

  // ── 13. Google Search Console + Yandex verification ───────────────────────
  //        Values come from environment variables — never hardcode these
  //        Add to Cloudflare Pages → Settings → Environment Variables
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },

  // ── 14. Category — signals content type to search engines ─────────────────
  category: 'entertainment',

}

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD STRUCTURED DATA
// Tells Google: "We are a real platform with a search box"
// Powers the SearchAction rich result directly in Google search
// ─────────────────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Website entity + Sitelinks Searchbox
    {
      '@type':  'WebSite',
      '@id':    'https://houselevi.com/#website',
      url:      'https://houselevi.com',
      name:     'House Levi+',
      description:
        'Stream exclusive theatre shows, TV series, movies, podcasts, documentaries and 24-hour live TV on House Levi+.',
      publisher: { '@id': 'https://houselevi.com/#organization' },
      potentialAction: {
        '@type':  'SearchAction',
        target: {
          '@type':      'EntryPoint',
          urlTemplate: 'https://houselevi.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },

    // Organisation entity — establishes brand identity in Knowledge Graph
    {
      '@type':       'Organization',
      '@id':         'https://houselevi.com/#organization',
      name:          'House Levi+',
      alternateName: 'House Levitika Plus',
      url:           'https://houselevi.com',
      logo: {
        '@type':  'ImageObject',
        url:      'https://houselevi.com/og-image.jpg',
        width:    1200,
        height:   630,
      },
      sameAs: [
        'https://web.facebook.com/houseleviplus',
        'https://www.instagram.com/houseleviplus/',
        'https://www.tiktok.com/@houseleviplus',
        'https://x.com/houseleviplus',
      ],
    },

    // Streaming service entity
    {
      '@type':       'StreamingService',
      '@id':         'https://houselevi.com/#streamingservice',
      name:          'House Levi+',
      url:           'https://houselevi.com',
      description:
        'Stream exclusive theatre productions, TV shows, movies, podcasts, documentaries and 24-hour live TV.',
      provider: { '@id': 'https://houselevi.com/#organization' },
      offers: {
        '@type':   'Offer',
        category: 'Subscription',
        url:      'https://houselevi.com/subscribe',
      },
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── JSON-LD Structured Data ────────────────────────────────────── */}
        {/* Injected directly in <head> for fastest Google discovery          */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ── DNS Prefetch for common third-party origins ────────────────── */}
        {/* Shaves ~100–300ms off first external resource load                */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//static.cloudflareinsights.com" />
        <link rel="preconnect"   href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}