import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TravelPackage } from '../travel.schema';

@Injectable()
export class TravelPackagesService {
  private readonly logger = new Logger(TravelPackagesService.name);

  constructor(
    @InjectModel('TravelPackage') private packageModel: Model<TravelPackage>,
  ) {}

  /**
   * Find all packages, optionally filtered by status
   */
  async findAll(status?: string) {
    try {
      const query: any = {};
      
      // Only filter by status if explicitly provided
      if (status && status !== 'all') {
        query.status = status;
      }

      this.logger.debug(`Fetching packages with query: ${JSON.stringify(query)}`);

      const packages = await this.packageModel
        .find(query)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      this.logger.log(`✅ Found ${packages.length} packages`);
      return packages;
    } catch (error) {
      this.logger.error(`Failed to fetch packages: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a single package by slug
   */
  async findBySlug(slug: string) {
    try {
      if (!slug) throw new BadRequestException('Slug is required');

      const pkg = await this.packageModel
        .findOne({ slug, status: 'active' })
        .lean()
        .exec();

      if (!pkg) {
        this.logger.warn(`Package not found with slug: ${slug}`);
        return null;
      }

      this.logger.debug(`Found package: ${pkg._id}`);
      return pkg;
    } catch (error) {
      this.logger.error(`Failed to find package by slug: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a single package by ID
   */
  async findById(id: string) {
    try {
      if (!id) throw new BadRequestException('ID is required');

      const pkg = await this.packageModel.findById(id).lean().exec();

      if (!pkg) {
        this.logger.warn(`Package not found with ID: ${id}`);
        return null;
      }

      return pkg;
    } catch (error) {
      this.logger.error(`Failed to find package by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new package
   */
  async create(dto: any) {
    try {
      if (!dto.destination) throw new BadRequestException('Destination is required');
      if (!dto.description) throw new BadRequestException('Description is required');

      // Generate slug from destination
      const slug = dto.destination
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      const pkg = new this.packageModel({
        destination: dto.destination,
        continent: dto.continent || 'Africa',
        description: dto.description,
        imageUrl: dto.imageUrl || null,
        departureDate: dto.departureDate || null,
        returnDate: dto.returnDate || null,
        totalSpots: Number(dto.totalSpots) || 0,
        spotsRemaining: Number(dto.spotsRemaining) || 0,
        priceUSD: Number(dto.priceUSD) || 0,
        status: dto.status || 'active',
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const saved = await pkg.save();
      this.logger.log(`✅ Package created: ${saved._id} (${saved.destination})`);
      return saved.toObject();
    } catch (error) {
      this.logger.error(`Failed to create package: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing package
   */
  async update(id: string, dto: any) {
    try {
      if (!id) throw new BadRequestException('ID is required');

      // Regenerate slug if destination changed
      const updateData: any = { ...dto, updatedAt: new Date() };
      if (dto.destination) {
        updateData.slug = dto.destination
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
      }

      const pkg = await this.packageModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .lean()
        .exec();

      if (!pkg) throw new BadRequestException(`Package not found: ${id}`);

      this.logger.log(`✅ Package updated: ${id}`);
      return pkg;
    } catch (error) {
      this.logger.error(`Failed to update package: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update only the image URL (for after upload)
   */
  async updateImageUrl(id: string, imageUrl: string) {
    try {
      if (!id) throw new BadRequestException('ID is required');

      const pkg = await this.packageModel
        .findByIdAndUpdate(id, { imageUrl, updatedAt: new Date() }, { new: true })
        .lean()
        .exec();

      if (!pkg) throw new BadRequestException(`Package not found: ${id}`);

      this.logger.log(`✅ Package image updated: ${id}`);
      return pkg;
    } catch (error) {
      this.logger.error(`Failed to update image: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update package status (active, draft, full, archived)
   */
  async updateStatus(id: string, status: string) {
    try {
      if (!id) throw new BadRequestException('ID is required');

      const validStatuses = ['active', 'draft', 'full', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestException(`Invalid status: ${status}`);
      }

      const pkg = await this.packageModel
        .findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true })
        .lean()
        .exec();

      if (!pkg) throw new BadRequestException(`Package not found: ${id}`);

      this.logger.log(`✅ Package status updated: ${id} → ${status}`);
      return pkg;
    } catch (error) {
      this.logger.error(`Failed to update status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Reorder packages (for admin display order)
   */
  async reorder(order: { id: string; displayOrder: number }[]) {
    try {
      const updates = await Promise.all(
        order.map(item =>
          this.packageModel
            .findByIdAndUpdate(item.id, { displayOrder: item.displayOrder, updatedAt: new Date() }, { new: true })
            .lean()
            .exec(),
        ),
      );

      this.logger.log(`✅ Reordered ${updates.length} packages`);
      return { success: true, updated: updates.length };
    } catch (error) {
      this.logger.error(`Failed to reorder packages: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete (soft delete via status) a package
   */
  async remove(id: string) {
    try {
      if (!id) throw new BadRequestException('ID is required');

      const pkg = await this.packageModel
        .findByIdAndUpdate(id, { status: 'archived', updatedAt: new Date() }, { new: true })
        .lean()
        .exec();

      if (!pkg) throw new BadRequestException(`Package not found: ${id}`);

      this.logger.log(`✅ Package archived: ${id}`);
      return { success: true, deleted: true };
    } catch (error) {
      this.logger.error(`Failed to delete package: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Decrease spots remaining (when inquiry submitted)
   */
  async decreaseSpots(id: string, qty: number = 1) {
    try {
      if (!id) throw new BadRequestException('ID is required');

      const pkg = await this.packageModel.findById(id).exec();
      if (!pkg) throw new BadRequestException(`Package not found: ${id}`);

      if (pkg.spotsRemaining < qty) {
        throw new BadRequestException('Insufficient spots remaining');
      }

      pkg.spotsRemaining -= qty;
      await pkg.save();

      this.logger.log(`✅ Spots decreased for package ${id}: ${pkg.spotsRemaining}/${pkg.totalSpots}`);
      return pkg.toObject();
    } catch (error) {
      this.logger.error(`Failed to decrease spots: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Increase spots remaining (admin override)
   */
  async increaseSpots(id: string, qty: number = 1) {
    try {
      if (!id) throw new BadRequestException('ID is required');

      const pkg = await this.packageModel.findById(id).exec();
      if (!pkg) throw new BadRequestException(`Package not found: ${id}`);

      pkg.spotsRemaining = Math.min(pkg.totalSpots, pkg.spotsRemaining + qty);
      await pkg.save();

      this.logger.log(`✅ Spots increased for package ${id}: ${pkg.spotsRemaining}/${pkg.totalSpots}`);
      return pkg.toObject();
    } catch (error) {
      this.logger.error(`Failed to increase spots: ${error.message}`, error.stack);
      throw error;
    }
  }
}