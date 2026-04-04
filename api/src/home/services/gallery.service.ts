import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import AdmZip = require('adm-zip');
import * as path from 'path';
import { CloudflareR2Service } from '../../modules/cloudflare/cloudflare-r2.service';
import { GalleryEvent, GalleryEventDocument } from '../schemas/gallery-event.schema';
import { GalleryImage, GalleryImageDocument } from '../schemas/gallery-image.schema';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.tif']);

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectModel('GalleryEvent') private readonly eventModel: Model<GalleryEventDocument>,
    @InjectModel('GalleryImage') private readonly imageModel: Model<GalleryImageDocument>,
    private readonly r2: CloudflareR2Service,
  ) {}

  // ── ZIP UPLOAD PIPELINE ────────────────────────────────────────────────────

  async processZipUpload(
    eventId: string,
    zipBuffer: Buffer,
  ): Promise<{ processed: number; skipped: number; failed: number; totalBytes: number }> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) throw new NotFoundException(`Gallery event not found: ${eventId}`);

    await this.eventModel.findByIdAndUpdate(eventId, { uploadStatus: 'processing' }).exec();
    this.logger.log(`📦 Starting ZIP extraction for event: ${event.name}`);

    let processed = 0, skipped = 0, failed = 0, totalBytes = 0;
    let orderIndex = await this.imageModel.countDocuments({ eventId: new Types.ObjectId(eventId) });
    const batchDocs: any[] = [];

    try {
      const zip     = new AdmZip(zipBuffer);
      const entries = zip.getEntries();
      this.logger.log(`Found ${entries.length} entries in ZIP`);

      for (const entry of entries) {
        if (entry.isDirectory) continue;
        if (entry.entryName.startsWith('__MACOSX')) continue;
        if (path.basename(entry.entryName).startsWith('.')) continue;

        const ext = path.extname(entry.entryName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) { skipped++; continue; }

        try {
          const imageBuffer = entry.getData();
          const mimeType    = this.extToMime(ext);
          const safeName    = path.basename(entry.entryName).replace(/\s+/g, '-');
          const r2Key = `${event.slug}/${Date.now()}-${orderIndex}-${safeName}`;

          await this.r2.uploadObject('home', r2Key, imageBuffer, mimeType);
          const publicUrl = this.r2.getPublicUrl('home', r2Key);

          batchDocs.push({
            eventId: new Types.ObjectId(eventId),
            r2Key, publicUrl,
            originalName: safeName,
            mimeType,
            sizeBytes: imageBuffer.length,
            order: orderIndex,
            isVisible: true,
          });

          totalBytes += imageBuffer.length;
          orderIndex++;
          processed++;

          if (batchDocs.length >= 50) {
            await this.imageModel.insertMany(batchDocs, { ordered: false });
            this.logger.debug(`Flushed batch of 50 images`);
            batchDocs.length = 0;
          }
        } catch (imgErr) {
          this.logger.warn(`Failed to process ${entry.entryName}: ${imgErr.message}`);
          failed++;
        }
      }

      if (batchDocs.length > 0) {
        await this.imageModel.insertMany(batchDocs, { ordered: false });
      }

      const totalImages = await this.imageModel.countDocuments({ eventId: new Types.ObjectId(eventId) });
      await this.eventModel.findByIdAndUpdate(eventId, {
        imageCount: totalImages,
        uploadStatus: failed > 0 && processed === 0 ? 'failed' : 'complete',
      }).exec();

      this.logger.log(`✅ ZIP processed: ${processed} uploaded, ${skipped} skipped, ${failed} failed`);
      return { processed, skipped, failed, totalBytes };
    } catch (err) {
      await this.eventModel.findByIdAndUpdate(eventId, { uploadStatus: 'failed' }).exec();
      throw new BadRequestException(`ZIP processing failed: ${err.message}`);
    }
  }

  // ── QUERIES ────────────────────────────────────────────────────────────────

  async getActiveEvents(): Promise<GalleryEventDocument[]> {
    return this.eventModel.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 }).exec();
  }

  async getAllEvents(): Promise<GalleryEventDocument[]> {
    return this.eventModel.find().sort({ displayOrder: 1, createdAt: -1 }).exec();
  }

  async getImages(eventSlug: string, page = 1, limit = 60) {
    const skip = (page - 1) * limit;
    let eventFilter: any = {};

    if (eventSlug !== 'all') {
      const event = await this.eventModel.findOne({ slug: eventSlug, isActive: true });
      if (!event) return { images: [], total: 0, pages: 0 };
      eventFilter = { eventId: event._id };
    } else {
      const activeEvents = await this.eventModel.find({ isActive: true }).select('_id');
      eventFilter = { eventId: { $in: activeEvents.map(e => e._id) } };
    }

    const query = { ...eventFilter, isVisible: true };
    const [images, total] = await Promise.all([
      this.imageModel.find(query).sort({ order: 1 }).skip(skip).limit(limit).exec(),
      this.imageModel.countDocuments(query),
    ]);
    return { images, total, pages: Math.ceil(total / limit) };
  }

  async getHeroImages(eventSlug: string, count = 20): Promise<string[]> {
    let eventFilter: any = {};
    if (eventSlug !== 'all') {
      const event = await this.eventModel.findOne({ slug: eventSlug, isActive: true });
      if (!event) return [];
      eventFilter = { eventId: event._id };
    } else {
      const activeEvents = await this.eventModel.find({ isActive: true }).select('_id');
      eventFilter = { eventId: { $in: activeEvents.map(e => e._id) } };
    }
    const images = await this.imageModel.aggregate([
      { $match: { ...eventFilter, isVisible: true } },
      { $sample: { size: count } },
      { $project: { publicUrl: 1, _id: 0 } },
    ]);
    return images.map(i => i.publicUrl);
  }

  // ── EVENT MANAGEMENT ───────────────────────────────────────────────────────

  async createEvent(data: { name: string; slug: string; description?: string; displayOrder?: number }) {
    const existing = await this.eventModel.findOne({ slug: data.slug });
    if (existing) throw new BadRequestException(`Event slug already exists: ${data.slug}`);
    return this.eventModel.create({ ...data, uploadStatus: 'pending', imageCount: 0 });
  }

  async updateEvent(id: string, data: Partial<any>) {
    const updated = await this.eventModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException(`Event not found: ${id}`);
    return updated;
  }

  async deleteEvent(id: string) {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException(`Event not found: ${id}`);

    const images = await this.imageModel.find({ eventId: new Types.ObjectId(id) }).exec();
    let deleted = 0;
    for (const img of images) {
      try { await this.r2.deleteObject('home', img.r2Key); deleted++; } catch {}
    }
    await this.imageModel.deleteMany({ eventId: new Types.ObjectId(id) }).exec();
    await this.eventModel.findByIdAndDelete(id).exec();
    return { deleted };
  }

  private extToMime(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.webp': 'image/webp', '.gif': 'image/gif', '.tiff': 'image/tiff', '.tif': 'image/tiff',
    };
    return map[ext] ?? 'image/jpeg';
  }
}


