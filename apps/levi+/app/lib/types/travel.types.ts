export interface TravelPackage {
  id: string; slug: string; destination: string; description: string;
  imageUrl?: string | null; heroImageUrl?: string; heroImageAlt?: string;
  departureDate?: string; returnDate?: string; totalSpots?: number;
  spotsRemaining: number; priceUSD?: number; duration?: string;
  continent?: string; tagline?: string; taglineColor?: string;
  highlights?: string[]; status: string; createdAt?: string;
  [key: string]: any;
}
export interface TravelTestimonial {
  id: string; author?: string; clientName?: string; destination?: string;
  body?: string; quote?: string; imageUrl?: string; rating?: number;
  packageId?: string; status?: string; createdAt?: string; [key: string]: any;
}
export interface NoteFromLevi {
  id?: string; body?: string; bodyText?: string;
  imageUrl?: string; signatureImageUrl?: string; updatedAt?: string;
}
export interface CreateInquiryDto {
  name?: string; firstName?: string; lastName?: string; email: string;
  phone?: string; packageId: string; packageSlug: string;
  travelDate?: string; groupSize?: number; notes?: string; [key: string]: any;
}
export interface CreateCustomInquiryDto {
  name?: string; firstName?: string; lastName?: string; email: string;
  phone?: string; destination?: string; travelDate?: string;
  duration?: string; groupSize?: number; budget?: string;
  notes?: string; message?: string; [key: string]: any;
}
export interface SubmitTestimonialDto {
  author?: string; destination?: string; packageId?: string;
  body?: string; rating?: number; [key: string]: any;
}
export interface SubscribeDto { email: string; name?: string; firstName?: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';
export const travelApi = {
  subscribe: async (data: SubscribeDto) => {
    const res = await fetch(API_URL + '/travel/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Subscribe failed');
    return res.json();
  },
};