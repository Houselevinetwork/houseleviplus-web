// backend/src/modules/content/content.service.ts - COMPLETE
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentStatus } from './schemas/content.schema';
import { CreateContentDto } from './dtos/create-content.dto';
import { UpdateContentDto } from './dtos/update-content.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(Content.name) private contentModel: Model<Content>,
  ) {}

  /**
   * Create new content
   */
  async create(createContentDto: CreateContentDto): Promise<Content> {
    try {
      const content = new this.contentModel({
        ...createContentDto,
        status: ContentStatus.DRAFT,
      });
      
      await content.save();
      this.logger.debug(`Content created: ${content._id}`);
      
      return content;
    } catch (error) {
      this.logger.error(`Failed to create content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find content by ID
   */
  async findById(id: string): Promise<Content> {
    try {
      const content = await this.contentModel.findById(id).exec();
      
      if (!content) {
        throw new NotFoundException(`Content not found: ${id}`);
      }
      
      return content;
    } catch (error) {
      this.logger.error(`Failed to find content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all content with filters and options
   */
  async findAll(
    filters: any = {},
    options: { limit?: number; sort?: any; skip?: number } = {},
  ): Promise<Content[]> {
    try {
      const query = this.contentModel.find(filters);
      
      if (options.skip) query.skip(options.skip);
      if (options.limit) query.limit(options.limit);
      if (options.sort) query.sort(options.sort);
      
      return await query.exec();
    } catch (error) {
      this.logger.error(`Failed to find content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Count documents matching filters
   * REQUIRED for Netflix-style pagination
   */
  async count(filters: any = {}): Promise<number> {
    try {
      return await this.contentModel.countDocuments(filters).exec();
    } catch (error) {
      this.logger.error(`Failed to count content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List content with pagination
   */
  async list(query: {
    page?: number;
    limit?: number;
    type?: string;
    filters?: any;
    sort?: any;
  }): Promise<{ data: Content[]; total: number; page: number; limit: number }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      const skip = (page - 1) * limit;

      const filters = query.filters || {};
      const sort = query.sort || { createdAt: -1 };

      const [data, total] = await Promise.all([
        this.contentModel
          .find(filters)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.contentModel.countDocuments(filters).exec(),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Failed to list content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update content
   */
  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    try {
      const content = await this.contentModel
        .findByIdAndUpdate(
          id,
          { $set: updateContentDto },
          { new: true, runValidators: true },
        )
        .exec();

      if (!content) {
        throw new NotFoundException(`Content not found: ${id}`);
      }

      this.logger.debug(`Content updated: ${id}`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to update content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark content as uploaded
   */
  async markAsUploaded(
    id: string,
    storageData: {
      originalUrl: string;
      cloudflareKey?: string;
      cloudflareStreamId?: string;
      size: number;
      mimeType: string;
      provider: string;
      duration?: number;
      thumbnail?: string;
    },
  ): Promise<Content> {
    try {
      const content = await this.contentModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              status: ContentStatus.UPLOADED,
              storage: storageData,
            },
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!content) {
        throw new NotFoundException(`Content not found: ${id}`);
      }

      this.logger.debug(`Content marked as uploaded: ${id}`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to mark as uploaded: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark content as ready (processing complete)
   */
  async markAsReady(
    id: string,
    storageData: {
      originalUrl: string;
      cloudflareKey?: string;
      cloudflareStreamId?: string;
      size: number;
      mimeType: string;
      provider: string;
      duration?: number;
      thumbnail?: string;
    },
  ): Promise<Content> {
    try {
      const content = await this.contentModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              status: ContentStatus.READY,
              storage: storageData,
            },
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!content) {
        throw new NotFoundException(`Content not found: ${id}`);
      }

      this.logger.debug(`Content marked as ready: ${id}`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to mark as ready: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete content
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await this.contentModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(`Content not found: ${id}`);
      }

      this.logger.debug(`Content deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get content by series title
   */
  async findBySeries(seriesTitle: string): Promise<Content[]> {
    return this.findAll(
      { 'series.title': seriesTitle, status: ContentStatus.READY },
      { sort: { season: 1, episode: 1 } },
    );
  }

  /**
   * Get featured content
   */
  async getFeatured(limit = 10): Promise<Content[]> {
    return this.findAll(
      { 'metadata.featured': true, status: ContentStatus.READY },
      { limit, sort: { createdAt: -1 } },
    );
  }

  /**
   * Get originals
   */
  async getOriginals(limit = 20): Promise<Content[]> {
    return this.findAll(
      { 'metadata.isOriginal': true, status: ContentStatus.READY },
      { limit, sort: { createdAt: -1 } },
    );
  }

  /**
   * Get content by genre
   */
  async getByGenre(genre: string, limit = 20): Promise<Content[]> {
    return this.findAll(
      { 'metadata.genre': genre, status: ContentStatus.READY },
      { limit, sort: { createdAt: -1 } },
    );
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await this.contentModel
        .findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
        .exec();
      
      this.logger.debug(`View count incremented for: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to increment view count: ${error.message}`, error.stack);
    }
  }
}