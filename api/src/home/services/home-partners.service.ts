import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HomePartner, HomePartnerDocument } from '../schemas/home-partner.schema';

@Injectable()
export class HomePartnersService {
  constructor(
    @InjectModel('HomePartner') private readonly model: Model<HomePartnerDocument>,
  ) {}

  async findAll(activeOnly = true): Promise<HomePartnerDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.model.find(filter).sort({ displayOrder: 1 }).exec();
  }

  async create(data: Record<string, any>): Promise<HomePartnerDocument> {
    return this.model.create(data);
  }

  async update(id: string, data: Record<string, any>): Promise<HomePartnerDocument> {
    const doc = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundException(`Partner not found: ${id}`);
    return doc;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.model.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
