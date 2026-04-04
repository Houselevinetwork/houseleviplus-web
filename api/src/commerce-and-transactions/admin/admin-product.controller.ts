import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Query, BadRequestException,
} from '@nestjs/common';
import { ProductService } from '../products/product.service';
import { CollectionService } from '../collections/collection.service';
import { CreateProductDto, PRODUCT_CATEGORIES } from '../dtos/create-product.dto';
import { RolesGuard } from '../../user-and-monetization/auth/guards/roles.guard';
import { Roles } from '../../user-and-monetization/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../user-and-monetization/auth/decorators/current-user.decorator';
import { computeRegionalPrices } from '../shared/currency.util';

/**
 * Location: api/src/commerce-and-transactions/admin/admin-product.controller.ts
 */

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-') + '-' + Date.now();
}

function mapPayload(body: Record<string, any>, userId?: string): Record<string, any> {
  const title      = String(body.title ?? body.name ?? '').trim();
  const basePrice  = Number(body.basePrice ?? body.price ?? 0);
  const stock      = Number(body.stock ?? 0);
  const salePrice  = body.salePrice != null ? Number(body.salePrice) : null;

  const category = PRODUCT_CATEGORIES.includes(body.category) ? body.category : null;

  const images = Array.isArray(body.images) && body.images.length
    ? body.images
    : body.imageUrl
      ? [{ url: body.imageUrl, alt: title, isPrimary: true, order: 0 }]
      : [];

  const variants = Array.isArray(body.variants) && body.variants.length
    ? body.variants
    : [{ sku: `${toSlug(title)}`, title: 'Default', price: salePrice ?? basePrice, stock }];

  const totalStock = variants.reduce((s: number, v: any) => s + Number(v.stock ?? 0), 0);

  // Auto-compute regional prices from KES base
  const regionalPricing = computeRegionalPrices(basePrice, salePrice);

  return {
    title,
    slug:            body.slug ?? toSlug(title),
    description:     body.description ?? '',
    basePrice,
    currency:        'KES',           // base currency always KES
    salePrice,
    discountPrice:   salePrice,
    onSale:          body.onSale ?? (salePrice !== null && salePrice < basePrice),
    category,
    collectionId:    body.collectionId ?? null,
    visible:         body.visible ?? true,
    isFeatured:      body.isFeatured ?? false,
    tags:            body.tags ?? [],
    status:          body.status ?? 'published',
    images,
    variants,
    totalStock,
    regionalPricing, // ← pre-computed for KE, UG, TZ, US, GB, EU, ZA
    createdBy:       userId ?? null,
  };
}

@Controller('api/commerce/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminProductController {
  constructor(
    private productService: ProductService,
    private collectionService: CollectionService,
  ) {}

  @Get('products')
  async getAdminProducts(@Query('limit') limit = '500', @Query('skip') skip = '0') {
    try {
      const l = Math.min(parseInt(limit) || 500, 1000);
      const s = parseInt(skip) || 0;
      const products = await this.productService.findAll(s, l);
      return { data: products ?? [], total: products?.length ?? 0, skip: s, limit: l };
    } catch { throw new BadRequestException('Failed to fetch products'); }
  }

  @Get('collections')
  async getCollections() {
    try {
      const collections = await this.collectionService.findAll();
      return { data: collections ?? [], total: collections?.length ?? 0 };
    } catch { throw new BadRequestException('Failed to fetch collections'); }
  }

  // bulk BEFORE :id
  @Post('products/bulk-upload')
  async bulkUploadProducts(@Body() bulkData: any, @CurrentUser() user: any) {
    if (!Array.isArray(bulkData?.products))
      throw new BadRequestException('Expected { products: [...] }');

    const results: any[] = [];
    for (const raw of bulkData.products) {
      try {
        const product = await this.productService.create(mapPayload(raw, user?._id) as CreateProductDto);
        results.push({ success: true, product });
      } catch (err) {
        results.push({ success: false, error: (err as Error).message });
      }
    }
    return {
      created: results.filter(r => r.success).length,
      failed:  results.filter(r => !r.success).length,
      errors:  results.filter(r => !r.success).map(r => r.error),
      results,
    };
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post('products')
  async createProduct(@Body() body: Record<string, any>, @CurrentUser() user: any) {
    return this.productService.create(mapPayload(body, user?._id) as CreateProductDto);
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: Record<string, any>) {
    const update: Record<string, any> = { ...body };
    if (body.name  && !body.title)     update.title     = body.name;
    if (body.price && !body.basePrice) update.basePrice = Number(body.price);
    if (body.imageUrl) update.images = [{ url: body.imageUrl, alt: body.title ?? '', isPrimary: true }];
    if (body.stock != null) {
      update.totalStock = Number(body.stock);
      update.variants = [{ sku: `sku-${Date.now()}`, title: 'Default', price: Number(body.price ?? body.basePrice ?? 0), stock: Number(body.stock) }];
    }
    // Recompute regional prices if price changed
    if (body.price != null || body.basePrice != null) {
      const base = Number(body.basePrice ?? body.price);
      const sale = body.salePrice != null ? Number(body.salePrice) : null;
      update.regionalPricing = computeRegionalPrices(base, sale);
    }
    return this.productService.update(id, update);
  }

  @Patch('products/:id/publish')
  async publishProduct(@Param('id') id: string) {
    return this.productService.update(id, { status: 'published', visible: true });
  }

  @Patch('products/:id/draft')
  async draftProduct(@Param('id') id: string) {
    return this.productService.update(id, { status: 'draft', visible: false });
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.update(id, { status: 'archived', visible: false });
  }
}