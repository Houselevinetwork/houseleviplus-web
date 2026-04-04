import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomeArtist, HomeArtistDocument } from '../schemas/home-artist.schema';

@Injectable()
export class HomeArtistsService {
  constructor(
    @InjectModel('HomeArtist') private readonly model: Model<HomeArtistDocument>,
  ) {}

  async findAll(activeOnly = true): Promise<HomeArtistDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.model.find(filter).sort({ displayOrder: 1 }).exec();
  }

  async create(data: Record<string, any>): Promise<HomeArtistDocument> {
    return this.model.create(data);
  }

  async update(id: string, data: Record<string, any>): Promise<HomeArtistDocument> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundException(`Artist not found: ${id}`);
    return doc;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.model.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
