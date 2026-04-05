export interface TravelHeroConfig {
  imageUrl: string;
  ctaLabel: string;
}

export type Continent = 'Africa' | 'Europe' | 'Asia' | 'Australia' | 'Americas';

export interface TravelPackage {
  id: string;
  destination: string;
  continent?: Continent;
  description: string;
  imageUrl?: string | null;
  heroImageUrl?: string;
  heroImageAlt?: string;
  tagline?: string;
  taglineColor?: string;
  highlights?: string[];
  duration?: string;
  departureDate?: string;
  returnDate?: string;
  totalSpots?: number;
  spotsRemaining: number;
  priceUSD?: number;
  slug: string;
  status: 'active' | 'draft' | 'full' | 'archived' | 'sold_out';
  createdAt?: string;
  [key: string]: any;
}

export interface TravelTestimonial {
  id: string;
  author?: string;
  clientName?: string;
  destination?: string;
  body?: string;
  quote?: string;
  imageUrl?: string;
  rating?: number;
  packageId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  [key: string]: any;
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
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  country?: string;
  numberOfTravelers?: number;
  isPhotographer?: boolean;
  message?: string;
  hearAboutUs?: string;
  packageId: string;
  packageSlug: string;
  travelDate?: string;
  groupSize?: number;
  notes?: string;
  [key: string]: any;
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
  author?: string;
  clientName?: string;
  clientEmail?: string;
  destination?: string;
  packageId?: string;
  packageSlug?: string;
  body?: string;
  quote?: string;
  rating?: number;
  [key: string]: any;
}

export interface SubscribeDto {
  email: string;
  name?: string;
  firstName?: string;
}