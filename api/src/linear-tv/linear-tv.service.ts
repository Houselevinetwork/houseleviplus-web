// api/src/linear-tv/linear-tv.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MoodTVBlock } from './schemas/mood-tv-block.schema';
import { CloudflareService } from '../modules/cloudflare/cloudflare.service';

// East Africa Time is UTC+3
const EAT_OFFSET_HOURS = 3;

function getEATTime(): { currentTime: string; dayOfWeek: number; totalMinutes: number } {
  const now         = new Date();
  // Shift to EAT
  const eatMs       = now.getTime() + EAT_OFFSET_HOURS * 60 * 60 * 1000;
  const eat         = new Date(eatMs);
  const hours       = eat.getUTCHours();
  const mins        = eat.getUTCMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  const dayOfWeek   = eat.getUTCDay();
  const totalMinutes = hours * 60 + mins;
  return { currentTime, dayOfWeek, totalMinutes };
}

/** Convert HH:MM to total minutes since midnight */
function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

@Injectable()
export class LinearTvService {
  private readonly logger = new Logger(LinearTvService.name);

  constructor(
    @InjectModel(MoodTVBlock.name)
    private readonly blockModel: Model<MoodTVBlock>,
    private readonly r2Service: CloudflareService,
  ) {}

  // ── SCHEDULE (PUBLIC) ────────────────────────────────────────

  async getCurrentBlock() {
    const { currentTime, dayOfWeek, totalMinutes } = getEATTime();

    // Fetch all active blocks for today
    const allBlocks = await this.blockModel
      .find({ isActive: true, daysOfWeek: dayOfWeek })
      .sort({ priority: -1 });

    // Handle midnight-crossing blocks (e.g. Rainfall 22:00–03:00)
    const block = allBlocks.find(b => {
      const start = toMinutes(b.startTime);
      const end   = toMinutes(b.endTime);
      if (end > start) {
        // Normal block: e.g. 06:00–10:00
        return totalMinutes >= start && totalMinutes < end;
      } else {
        // Midnight-crossing: e.g. 22:00–03:00
        return totalMinutes >= start || totalMinutes < end;
      }
    }) ?? null;

    this.logger.log(`getCurrentBlock → EAT ${currentTime}, block: ${block?.name ?? 'none'}`);

    return {
      block,
      serverTime: new Date().toISOString(),
      localTime:  currentTime,
      timezone:   'EAT (UTC+3)',
    };
  }

  async getTodaySchedule() {
    const { dayOfWeek } = getEATTime();

    const blocks = await this.blockModel
      .find({ isActive: true, daysOfWeek: dayOfWeek })
      .sort({ startTime: 1 });

    return {
      date:   new Date().toISOString().split('T')[0],
      blocks,
    };
  }

  // ── VIDEO UPLOAD (ADMIN) ─────────────────────────────────────

  async getVideoUploadUrl(fileName: string) {
    this.logger.log(`Generating presigned upload URL for: ${fileName}`);
    const result        = await this.r2Service.createUploadSession('ltv', 'r2', fileName);
    const cloudflareKey = result.cloudflareKey ?? `ltv/${Date.now()}-${fileName}`;
    const publicUrl     = this.r2Service.getR2PublicUrl('ltv', cloudflareKey);
    return {
      uploadUrl:     result.uploadUrl,
      cloudflareKey,
      publicUrl,
      expiresIn:     result.expiresIn,
    };
  }

  // ── BLOCKS CRUD (ADMIN) ──────────────────────────────────────

  async getAllBlocks() {
    return this.blockModel.find().sort({ startTime: 1 });
  }

  async createBlock(dto: {
    name:        string;
    startTime:   string;
    endTime:     string;
    videoUrl?:   string;
    videoKey?:   string;
    daysOfWeek?: number[];
    isActive?:   boolean;
    priority?:   number;
    metadata?:   { title?: string; description?: string; genre?: string; thumbnail?: string };
  }) {
    const block = new this.blockModel({
      name:       dto.name,
      startTime:  dto.startTime,
      endTime:    dto.endTime,
      videoUrl:   dto.videoUrl   ?? '',
      videoKey:   dto.videoKey   ?? '',
      videoId:    dto.videoKey   ?? '',
      daysOfWeek: dto.daysOfWeek ?? [0,1,2,3,4,5,6],
      isActive:   dto.isActive   ?? true,
      priority:   dto.priority   ?? 1,
      metadata:   dto.metadata   ?? {},
    });
    await block.save();
    this.logger.log(`✅ Block created: ${block.name} (${block.startTime}–${block.endTime})`);
    return block;
  }

  async updateBlock(id: string, dto: Partial<{
    name:        string;
    startTime:   string;
    endTime:     string;
    videoUrl:    string;
    videoKey:    string;
    daysOfWeek:  number[];
    isActive:    boolean;
    priority:    number;
    metadata:    { title?: string; description?: string; genre?: string; thumbnail?: string };
  }>) {
    const update: any = { $set: { ...dto } };
    if (dto.videoKey) update.$set.videoId = dto.videoKey;

    const block = await this.blockModel.findByIdAndUpdate(id, update, { new: true });
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    this.logger.log(`✅ Block updated: ${block.name} — videoUrl: ${block.videoUrl || 'unchanged'}`);
    return block;
  }

  async deleteBlock(id: string) {
    const block = await this.blockModel.findById(id);
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    if (block.videoKey) {
      try {
        await this.r2Service.deleteFromR2('ltv', block.videoKey);
        this.logger.log(`✅ Deleted R2 video: ${block.videoKey}`);
      } catch (e) {
        this.logger.warn(`Could not delete R2 video: ${e.message}`);
      }
    }
    await this.blockModel.findByIdAndDelete(id);
    this.logger.log(`✅ Block deleted: ${block.name}`);
    return { success: true, deleted: block.name };
  }

  async toggleBlock(id: string, isActive: boolean) {
    const block = await this.blockModel.findByIdAndUpdate(
      id, { $set: { isActive } }, { new: true },
    );
    if (!block) throw new NotFoundException(`Block ${id} not found`);
    return block;
  }

  // ── SEED ─────────────────────────────────────────────────────

  async seedDefaultSchedule() {
    const count = await this.blockModel.countDocuments();
    if (count > 0) return { message: 'Schedule already exists', count };

    const rows = [
      { name: 'Coffee Jazz',       startTime: '06:00', endTime: '10:00', metadata: { title: 'Coffee Jazz Morning',  description: 'Start your day with smooth jazz and cozy vibes',  genre: 'Jazz'    } },
      { name: 'DJ RNB Mix',        startTime: '10:00', endTime: '12:00', metadata: { title: 'DJ RNB Mix',           description: 'Upbeat RNB and Hip-Hop to energize your day',     genre: 'Music'   } },
      { name: 'Sisibo Podcast',    startTime: '12:00', endTime: '14:00', metadata: { title: 'Sisibo Podcast',       description: 'Engaging conversations and stories',               genre: 'Podcast' } },
      { name: 'East Africa Music', startTime: '14:00', endTime: '16:00', metadata: { title: 'East Africa Music',   description: 'Bongo Flava, Afrobeat and regional hits',          genre: 'Music'   } },
      { name: 'Rhumba & Country',  startTime: '16:00', endTime: '19:00', metadata: { title: 'Rhumba & Country',    description: 'Classic Rhumba and Country favorites',             genre: 'Music'   } },
      { name: 'Fireplace 4K',      startTime: '19:00', endTime: '22:00', metadata: { title: 'Fireplace 4K',        description: 'Relax with a crackling fireplace',                 genre: 'Ambient' } },
      { name: 'Rainfall',          startTime: '22:00', endTime: '03:00', metadata: { title: 'Rainfall',            description: 'Soothing rain sounds for sleep',                   genre: 'Ambient' } },
      { name: 'Morning Glory DJ',  startTime: '03:00', endTime: '06:00', metadata: { title: 'Morning Glory DJ Mix',description: 'Uplifting mixes for early risers',                 genre: 'Music'   } },
    ].map(b => ({ ...b, videoUrl: '', videoKey: '', videoId: '', daysOfWeek: [0,1,2,3,4,5,6], isActive: true, priority: 1 }));

    await this.blockModel.insertMany(rows);
    return { message: 'Default schedule created', count: rows.length };
  }
}