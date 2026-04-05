// apps/web/app/travel/types.ts
// Single source of truth Ã¢â‚¬â€ all travel components import from here

export type Continent = "Africa" | "Europe" | "Asia" | "Australia" | "Americas";

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
  status: string;
}

export interface TravelTestimonial {
  id: string;
  clientName: string;
  destination?: string;
  quote: string;
  imageUrl?: string;
  side?: "left" | "right";
}

export interface InquiryFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export interface TravelHeroData {
  imageUrl: string;
  headline: string;
}

export interface NoteData {
  body: string;
  imageUrl?: string;
}
