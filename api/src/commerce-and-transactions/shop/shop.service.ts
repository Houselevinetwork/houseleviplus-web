import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * Location: api/src/commerce-and-transactions/shop/shop.service.ts
 * 
 * Handles:
 * - Hero banner (image/video) CRUD
 * - Announcements management
 * - Review fetching
 */

export interface HeroData {
  url: string;
  type: 'image' | 'video';
  headline: string;
}

export interface ShopConfigDocument {
  _id: string;
  heroUrl: string;
  heroType: 'image' | 'video';
  heroHeadline: string;
  announcements: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ShopService {
  constructor(
    @InjectModel('ShopConfig')
    private shopConfigModel: Model<ShopConfigDocument>,
  ) {}

  // ── HERO ──────────────────────────────────────────────────────

  /**
   * GET /api/shop/hero
   * Returns current hero (banner image/video for shop)
   */
  async getHero(): Promise<HeroData> {
    try {
      const config = await this.shopConfigModel.findOne().exec();
      return {
        url: config?.heroUrl || '',
        type: (config?.heroType as 'image' | 'video') || 'image',
        headline: config?.heroHeadline || 'HOUSELEVI+',
      };
    } catch (err) {
      console.error('Error fetching hero:', err);
      return {
        url: '',
        type: 'image',
        headline: 'HOUSELEVI+',
      };
    }
  }

  /**
   * PUT /api/shop/hero
   * Admin updates hero image/video and headline
   */
  async updateHero(data: HeroData): Promise<HeroData> {
    try {
      const config = await this.shopConfigModel.findOneAndUpdate(
        {},
        {
          heroUrl: data.url,
          heroType: data.type,
          heroHeadline: data.headline,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      ).exec();

      return {
        url: config?.heroUrl || data.url,
        type: (config?.heroType as 'image' | 'video') || data.type,
        headline: config?.heroHeadline || data.headline,
      };
    } catch (err) {
      console.error('Error updating hero:', err);
      throw err;
    }
  }

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────

  /**
   * GET /api/shop/announcements
   * Returns array of announcement strings
   */
  async getAnnouncements(): Promise<string[]> {
    try {
      const config = await this.shopConfigModel.findOne().exec();
      return config?.announcements || ['Free shipping on orders over $150'];
    } catch (err) {
      console.error('Error fetching announcements:', err);
      return ['Free shipping on orders over $150'];
    }
  }

  /**
   * PUT /api/shop/announcements
   * Admin updates announcements
   */
  async updateAnnouncements(announcements: string[]): Promise<string[]> {
    try {
      const config = await this.shopConfigModel.findOneAndUpdate(
        {},
        { announcements, updatedAt: new Date() },
        { upsert: true, new: true }
      ).exec();
      return config?.announcements || announcements;
    } catch (err) {
      console.error('Error updating announcements:', err);
      throw err;
    }
  }

  // ── REVIEWS ───────────────────────────────────────────────────

  /**
   * GET /api/shop/reviews
   * Returns customer reviews
   * TODO: Wire this to actual reviews collection
   */
  async getReviews(limit: number = 3): Promise<any> {
    try {
      // Placeholder - return empty for now
      // Wire to your actual reviews collection later
      return {
        data: [],
        total: 0,
        avgRating: 0,
      };
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return { data: [], total: 0, avgRating: 0 };
    }
  }
}