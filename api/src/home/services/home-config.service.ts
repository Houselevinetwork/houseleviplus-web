import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomeConfig, HomeConfigDocument } from '../schemas/home-config.schema';

@Injectable()
export class HomeConfigService {
  private readonly logger = new Logger(HomeConfigService.name);

  constructor(
    @InjectModel('HomeConfig') private readonly model: Model<HomeConfigDocument>,
  ) {}

  async getConfig(): Promise<HomeConfigDocument> {
    let config = await this.model.findOne().exec();
    if (!config) {
      config = await this.model.create({});
      this.logger.log('HomeConfig bootstrapped with defaults');
    }
    return config;
  }

  async updateConfig(data: Partial<{
    quote: string; quoteAuthor: string;
    heroMode: 'all' | 'specific'; heroEventId: string | null;
    heroCaption: string; heroTitle: string;
    slideshowInterval: number; kenBurnsEffect: boolean;
  }>): Promise<HomeConfigDocument> {
    const config = await this.model.findOneAndUpdate(
      {}, { ...data, updatedAt: new Date() }, { upsert: true, new: true },
    ).exec();
    this.logger.log('HomeConfig updated');
    return config!;
  }
}
