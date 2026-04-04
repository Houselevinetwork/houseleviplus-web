// packages/travel-api/src/client/travel.client.ts
// Type-safe API client — used in apps/web, apps/web-plus, apps/mobile
// Each app passes its own baseUrl (env-specific)

import type {
  TravelPackage,
  TravelTestimonial,
  TravelInquiry,
  CustomTravelInquiry,
  NoteFromLevi,
  CreatePackageDto,
  UpdatePackageDto,
  CreateInquiryDto,
  CreateCustomInquiryDto,
  SubmitTestimonialDto,
  SubscribeDto,
  ApiResponse,
  PackageStatus,
  TestimonialStatus,
} from '../types/travel.types';

export class TravelApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;

  constructor(baseUrl: string, getToken?: () => string | null) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.getToken = getToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken?.();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json.message ?? 'Request failed' };
    }

    return { success: true, data: json };
  }

  // ── PUBLIC: PACKAGES ────────────────────────────────────────────

  getPackages(status: PackageStatus = 'active'): Promise<ApiResponse<TravelPackage[]>> {
    return this.request<TravelPackage[]>(`/travel/packages?status=${status}`);
  }

  getPackage(slug: string): Promise<ApiResponse<TravelPackage>> {
    return this.request<TravelPackage>(`/travel/packages/${slug}`);
  }

  // ── PUBLIC: NOTE FROM LEVI ──────────────────────────────────────

  getNoteFromLevi(): Promise<ApiResponse<NoteFromLevi>> {
    return this.request<NoteFromLevi>('/travel/note');
  }

  // ── PUBLIC: TESTIMONIALS ────────────────────────────────────────

  getTestimonials(params?: {
    featured?: boolean;
    packageSlug?: string;
    status?: TestimonialStatus;
  }): Promise<ApiResponse<TravelTestimonial[]>> {
    const q = new URLSearchParams();
    if (params?.featured !== undefined) q.set('featured', String(params.featured));
    if (params?.packageSlug) q.set('packageSlug', params.packageSlug);
    if (params?.status) q.set('status', params.status);
    return this.request<TravelTestimonial[]>(`/travel/testimonials?${q}`);
  }

  submitTestimonial(dto: SubmitTestimonialDto): Promise<ApiResponse<TravelTestimonial>> {
    return this.request('/travel/testimonials', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // ── PUBLIC: INQUIRIES ───────────────────────────────────────────

  submitInquiry(dto: CreateInquiryDto): Promise<ApiResponse<TravelInquiry>> {
    return this.request('/travel/inquiries', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  submitCustomInquiry(dto: CreateCustomInquiryDto): Promise<ApiResponse<CustomTravelInquiry>> {
    return this.request('/travel/inquiries/custom', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // ── PUBLIC: NEWSLETTER ──────────────────────────────────────────

  subscribe(dto: SubscribeDto): Promise<ApiResponse<void>> {
    return this.request('/travel/subscribe', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // ── ADMIN: PACKAGES ─────────────────────────────────────────────

  adminCreatePackage(dto: CreatePackageDto): Promise<ApiResponse<TravelPackage>> {
    return this.request('/travel/packages', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  adminUpdatePackage(id: string, dto: UpdatePackageDto): Promise<ApiResponse<TravelPackage>> {
    return this.request(`/travel/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  adminUploadPackageImage(id: string, file: File): Promise<ApiResponse<{ url: string }>> {
    const form = new FormData();
    form.append('image', file);
    return this.request(`/travel/packages/${id}/image`, {
      method: 'POST',
      headers: {},      // let browser set multipart boundary
      body: form,
    });
  }

  adminDeletePackage(id: string): Promise<ApiResponse<void>> {
    return this.request(`/travel/packages/${id}`, { method: 'DELETE' });
  }

  adminReorderPackages(order: { id: string; order: number }[]): Promise<ApiResponse<void>> {
    return this.request('/travel/packages/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ order }),
    });
  }

  // ── ADMIN: NOTE FROM LEVI ───────────────────────────────────────

  adminUpdateNoteFromLevi(dto: { bodyText: string; signatureImageUrl?: string }): Promise<ApiResponse<NoteFromLevi>> {
    return this.request('/travel/note', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  // ── ADMIN: TESTIMONIALS ─────────────────────────────────────────

  adminGetAllTestimonials(status?: TestimonialStatus): Promise<ApiResponse<TravelTestimonial[]>> {
    const q = status ? `?status=${status}` : '';
    return this.request(`/travel/testimonials/admin${q}`);
  }

  adminUpdateTestimonialStatus(
    id: string,
    status: TestimonialStatus,
    featured?: boolean
  ): Promise<ApiResponse<TravelTestimonial>> {
    return this.request(`/travel/testimonials/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, featured }),
    });
  }

  // ── ADMIN: INQUIRIES ────────────────────────────────────────────

  adminGetInquiries(params?: {
    packageId?: string;
    status?: string;
  }): Promise<ApiResponse<TravelInquiry[]>> {
    const q = new URLSearchParams(params as Record<string, string>);
    return this.request(`/travel/inquiries?${q}`);
  }

  adminUpdateInquiryStatus(
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<ApiResponse<TravelInquiry>> {
    return this.request(`/travel/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  }
}