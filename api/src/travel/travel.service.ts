import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPackagesService } from './packages/packages.service';
import { TravelInquiriesService } from './inquiries/inquiries.service';
import { TravelTestimonialsService } from './testimonials/testimonials.service';

/**
 * Location: api/src/travel/travel.service.ts
 *
 * Hero and Note persisted in a single TravelConfig MongoDB document.
 * Mirrors ShopService pattern exactly — findOneAndUpdate({}, {...}, { upsert: true }).
 */

export interface TravelConfigDocument {
  heroImageUrl: string;
  heroHeadline: string;
  heroCtaLabel: string;
  noteBody: string;
  noteImageUrl: string;
}

@Injectable()
export class TravelService {
  private readonly logger = new Logger(TravelService.name);

  constructor(
    @InjectModel('TravelConfig')
    private readonly configModel: Model<TravelConfigDocument>,
    private readonly packagesService: TravelPackagesService,
    private readonly inquiriesService: TravelInquiriesService,
    private readonly testimonialsService: TravelTestimonialsService,
  ) {}

  // ── HERO ────────────────────────────────────────────────────

  async getHero(): Promise<{ imageUrl: string; headline: string; ctaLabel: string }> {
    try {
      const config = await this.configModel.findOne().exec();
      this.logger.log(`getHero → imageUrl: ${config?.heroImageUrl || '(empty)'}`);
      return {
        imageUrl: config?.heroImageUrl || '',
        headline: config?.heroHeadline || '',
        ctaLabel: config?.heroCtaLabel || 'View Upcoming Journeys',
      };
    } catch (err) {
      this.logger.error(`getHero failed: ${err.message}`);
      return { imageUrl: '', headline: '', ctaLabel: 'View Upcoming Journeys' };
    }
  }

  async updateHero(data: { imageUrl: string; headline?: string; ctaLabel?: string }) {
    this.logger.log(`updateHero → imageUrl: ${data.imageUrl}, headline: ${data.headline ?? ''}`);
    try {
      const config = await this.configModel.findOneAndUpdate(
        {},
        {
          heroImageUrl: data.imageUrl,
          heroHeadline: data.headline ?? '',
          heroCtaLabel: data.ctaLabel ?? 'View Upcoming Journeys',
          updatedAt: new Date(),
        },
        { upsert: true, new: true },
      ).exec();
      this.logger.log(`✅ Hero saved → imageUrl: ${config?.heroImageUrl}`);
      return {
        success: true,
        imageUrl: config?.heroImageUrl || data.imageUrl,
        headline: config?.heroHeadline || '',
        ctaLabel: config?.heroCtaLabel || 'View Upcoming Journeys',
      };
    } catch (err) {
      this.logger.error(`updateHero failed: ${err.message}`);
      throw err;
    }
  }

  // ── NOTE FROM LEVI ──────────────────────────────────────────

  async getNote(): Promise<{ body: string; imageUrl?: string }> {
    try {
      const config = await this.configModel.findOne().exec();
      return {
        body: config?.noteBody || '',
        imageUrl: config?.noteImageUrl || undefined,
      };
    } catch (err) {
      this.logger.error(`getNote failed: ${err.message}`);
      return { body: '' };
    }
  }

  async updateNote(data: { body: string; imageUrl?: string }) {
    this.logger.log(`updateNote → body length: ${data.body?.length ?? 0}`);
    try {
      const config = await this.configModel.findOneAndUpdate(
        {},
        {
          noteBody: data.body,
          noteImageUrl: data.imageUrl ?? '',
          updatedAt: new Date(),
        },
        { upsert: true, new: true },
      ).exec();
      this.logger.log(`✅ Note saved`);
      return { success: true, body: config?.noteBody, imageUrl: config?.noteImageUrl };
    } catch (err) {
      this.logger.error(`updateNote failed: ${err.message}`);
      throw err;
    }
  }

  // ── PACKAGES ────────────────────────────────────────────────

  getPackages(arg0: { status: string; continent: string | undefined }) {
    return this.packagesService.findAll(arg0.status);
  }

  getPackageById(id: string) {
    return this.packagesService.findBySlug(id);
  }

  createPackage(body: Record<string, any>) {
    return this.packagesService.create(body);
  }

  updatePackage(id: string, body: Record<string, any>) {
    return this.packagesService.update(id, body);
  }

  deletePackage(id: string) {
    return this.packagesService.remove(id);
  }

  // ── INQUIRIES ───────────────────────────────────────────────

  createInquiry(body: Record<string, any>) {
    return this.inquiriesService.create(body);
  }

  createCustomInquiry(body: Record<string, any>) {
    return this.inquiriesService.createCustom(body);
  }

  getInquiries(type: string | undefined) {
    if (type === 'custom') return this.inquiriesService.findAllCustom();
    return this.inquiriesService.findAll({ type });
  }

  // ── TESTIMONIALS ────────────────────────────────────────────

  getTestimonials(arg0: { status: string; featured: boolean }) {
    return this.testimonialsService.findAll(arg0);
  }

  createTestimonial(body: Record<string, any>) {
    return this.testimonialsService.submit({ ...body, status: 'pending' });
  }

  updateTestimonial(id: string, arg1: { status: string; featured?: boolean }) {
    return this.testimonialsService.updateStatus(id, arg1.status, arg1.featured);
  }

  // ── SUBSCRIBE ───────────────────────────────────────────────

  async subscribe(dto: { firstName: string; email: string }) {
    return { success: true };
  }
}