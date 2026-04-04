import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection } from './collection.schema';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
  ) {}

  async create(data: { name: string; slug: string; description?: string }) {
    return this.collectionModel.create(data);
  }

  async findAll() {
    return this.collectionModel.find({ isActive: true }).sort({ displayOrder: 1 });
  }

  async findById(id: string) {
    return this.collectionModel.findById(id);
  }

  async findBySlug(slug: string) {
    return this.collectionModel.findOne({ slug, isActive: true });
  }

  async update(id: string, data: any) {
    return this.collectionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return this.collectionModel.findByIdAndUpdate(id, { isActive: false });
  }
}
