export interface TravelHeroConfig {
  imageUrl: string;
  ctaLabel: string;
}

export type Continent = 'Africa' | 'Europe' | 'Asia' | 'Australia' | 'Americas';

export interface TravelPackage {
  id: string;
  destination: string;
  continent: Continent;
  description: string;
  imageUrl: string | null;
  departureDate: string;
  returnDate: string;
  totalSpots: number;
  spotsRemaining: number;
  priceUSD: number;
  slug: string;
  status: 'active' | 'draft' | 'full' | 'archived';
  createdAt?: string;
}

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

export interface NoteFromLevi {
  id?: string;
  body?: string;
  bodyText?: string;
  imageUrl?: string;
  signatureImageUrl?: string;
  updatedAt?: string;
}

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
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  destination?: string;
  desiredDestination?: string;
  desiredDates?: string;
  continent?: Continent;
  travelDate?: string;
  duration?: string;
  groupSize?: number;
  budget?: string;
  notes?: string;
  message?: string;
  [key: string]: any;
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