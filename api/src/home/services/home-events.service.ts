import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomeEvent, HomeEventDocument } from '../schemas/home-event.schema';

@Injectable()
export class HomeEventsService {
  private readonly logger = new Logger(HomeEventsService.name);

  constructor(
    @InjectModel('HomeEvent') private readonly model: Model<HomeEventDocument>,
  ) {}

  async findAll(activeOnly = true): Promise<HomeEventDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.model.find(filter).sort({ displayOrder: 1, eventDate: 1 }).exec();
  }

  async findById(id: string): Promise<HomeEventDocument> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Home event not found: ${id}`);
    return doc;
  }

  async create(data: Record<string, any>): Promise<HomeEventDocument> {
    return this.model.create(data);
  }

  async update(id: string, data: Record<string, any>): Promise<HomeEventDocument> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundException(`Home event not found: ${id}`);
    return doc;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.model.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
