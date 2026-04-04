/**
 * Location: packages/LAYER-5-COMMERCE/travel-api/types/travel.types.ts
 */

// ── Hero ───────────────────────────────────────────────────────
export interface TravelHeroConfig {
  imageUrl: string;
  ctaLabel: string; // default: 'View Upcoming Journeys'
}

// ── Package ────────────────────────────────────────────────────
export type Continent = 'Africa' | 'Europe' | 'Asia' | 'Australia' | 'Americas';

export interface TravelPackage {
  id: string;
  destination: string;         // e.g. "Kenya, East Africa"
  continent: Continent;
  description: string;
  imageUrl: string | null;
  departureDate: string;       // ISO date string
  returnDate: string;
  totalSpots: number;
  spotsRemaining: number;
  priceUSD: number;
  slug: string;
  status: 'active' | 'draft' | 'full' | 'archived';
  createdAt?: string;
}

// ── Testimonial ───────────────────────────────────────────────
export interface TravelTestimonial {
  id: string;
  author: string;
  destination: string;
  body: string;
  rating: number;
  packageId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

// ── Note from Levi ────────────────────────────────────────────
export interface NoteFromLevi {
  id?: string;
  body: string;
  imageUrl?: string;
  updatedAt?: string;
}

// ── DTOs ──────────────────────────────────────────────────────
export interface CreateInquiryDto {
  name: string;
  email: string;
  phone?: string;
  packageId: string;
  packageSlug: string;
  travelDate?: string;
  groupSize?: number;
  notes?: string;
}

export interface CreateCustomInquiryDto {
  name: string;
  email: string;
  phone?: string;
  destination: string;
  continent: Continent;
  travelDate?: string;
  duration?: string;
  groupSize?: number;
  budget?: string;
  notes?: string;
}

export interface SubmitTestimonialDto {
  author: string;
  destination: string;
  packageId?: string;
  body: string;
  rating: number;
}

export interface SubscribeDto {
  email: string;
  name?: string;
}