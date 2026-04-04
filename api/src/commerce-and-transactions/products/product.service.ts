import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';

/**
 * Location: api/src/commerce-and-transactions/products/product.service.ts
 *
 * FIXES:
 *   1. create() — variants.reduce crashes when variants is []. Safe fallback added.
 *   2. findPublished() — now also filters visible: true so hidden products
 *      don't appear on the public web/mobile frontend.
 *   3. findPublished() — sorts newest first (createdAt desc) by default.
 *   4. findByCategory() — new method for category slug filtering.
 *   5. findFeatured() — new method for Best Sellers row.
 */
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(data: any) {
    // Safe reduce — variants may be [] when product is added without stock detail
    const variants    = Array.isArray(data.variants) ? data.variants : [];
    const totalStock  = data.totalStock ?? variants.reduce((sum: number, v: any) => sum + Number(v.stock ?? 0), 0);
    return this.productModel.create({ ...data, variants, totalStock });
  }

  /** Public — only published + visible products */
  async findPublished() {
    return this.productModel
      .find({ status: 'published', visible: true })
      .sort({ createdAt: -1 })
      .populate('collectionId');
  }

  /** Public — published + visible, filtered by category slug */
  async findByCategory(category: string) {
    return this.productModel
      .find({ status: 'published', visible: true, category })
      .sort({ createdAt: -1 })
      .populate('collectionId');
  }

  /** Public — featured products for Best Sellers row */
  async findFeatured(limit = 12) {
    return this.productModel
      .find({ status: 'published', visible: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('collectionId');
  }

  /** Admin — all products regardless of status/visibility */
  async findAll(skip = 0, limit = 50) {
    return this.productModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('collectionId');
  }

  async findById(id: string) {
    return this.productModel.findById(id).populate('collectionId');
  }

  async findByCollection(collectionId: string) {
    return this.productModel
      .find({ collectionId, status: 'published', visible: true })
      .sort({ createdAt: -1 });
  }

  async update(id: string, data: any) {
    if (data.variants) {
      data.totalStock = data.variants.reduce((sum: number, v: any) => sum + Number(v.stock ?? 0), 0);
    }
    return this.productModel.findByIdAndUpdate(id, data, { new: true });
  }

  async decreaseStock(productId: string, variantId: string, qty: number) {
    const product = await this.findById(productId);
    if (!product) throw new BadRequestException('Product not found');
    const variant = product.variants.find(v => (v as any)._id?.toString() === variantId);
    if (!variant) throw new BadRequestException('Variant not found');
    if (variant.stock < qty) throw new BadRequestException('Insufficient stock');
    variant.stock      -= qty;
    product.totalStock -= qty;
    return product.save();
  }

  async increaseStock(productId: string, variantId: string, qty: number) {
    const product = await this.findById(productId);
    if (!product) throw new BadRequestException('Product not found');
    const variant = product.variants.find(v => (v as any)._id?.toString() === variantId);
    if (!variant) throw new BadRequestException('Variant not found');
    variant.stock      += qty;
    product.totalStock += qty;
    return product.save();
  }
}