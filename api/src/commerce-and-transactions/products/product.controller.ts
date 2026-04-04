import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';

/**
 * Location: api/src/commerce-and-transactions/products/product.controller.ts
 *
 * PUBLIC routes — no auth required.
 *
 * CRITICAL: specific routes (category/:slug, collection/:collectionId)
 * MUST be declared BEFORE the dynamic :id route, otherwise NestJS
 * will match the literal string "category" as an :id param.
 *
 * Route registration order:
 *   1. GET /                           → findPublished
 *   2. GET /category/:slug             → findByCategory  (specific — must be before :id)
 *   3. GET /collection/:collectionId   → findByCollection (specific — must be before :id)
 *   4. GET /:id                        → findById        (dynamic — always last)
 */

function normalize(p: any) {
  return {
    id:              String(p._id ?? p.id ?? ''),
    name:            String(p.title ?? p.name ?? ''),
    description:     String(p.description ?? ''),
    price:           Number(p.basePrice ?? p.price ?? 0),
    salePrice:       p.salePrice != null ? Number(p.salePrice) : null,
    onSale:          Boolean(p.onSale),
    imageUrl:        p.images?.[0]?.url ?? p.imageUrl ?? null,
    images:          Array.isArray(p.images) ? p.images : [],
    category:        p.category ?? null,
    stock:           Number(p.totalStock ?? 0),
    visible:         Boolean(p.visible ?? true),
    slug:            p.slug ?? '',
    isFeatured:      Boolean(p.isFeatured),
    tags:            p.tags ?? [],
    variants:        p.variants ?? [],
    regionalPricing: p.regionalPricing ?? [],
  };
}

@Controller('api/commerce/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  // ── 1. List ────────────────────────────────────────────────────
  /**
   * GET /api/commerce/products
   * GET /api/commerce/products?sort=featured&limit=12
   * GET /api/commerce/products?category=old-money-closet
   */
  @Get()
  async findPublished(
    @Query('limit')    limit    = '50',
    @Query('skip')     skip     = '0',
    @Query('sort')     sort     = 'newest',
    @Query('category') category = '',
  ) {
    const l = Math.min(parseInt(limit) || 50, 200);
    const s = parseInt(skip) || 0;

    let products: any[];

    if (sort === 'featured' || sort === 'bestseller') {
      products = await this.productService.findFeatured(l) as any[];
    } else if (category) {
      products = await this.productService.findByCategory(category) as any[];
    } else {
      products = await this.productService.findPublished() as any[];
    }

    if (sort === 'price_asc')  products.sort((a, b) => (a.basePrice ?? 0) - (b.basePrice ?? 0));
    if (sort === 'price_desc') products.sort((a, b) => (b.basePrice ?? 0) - (a.basePrice ?? 0));

    const paginated = products.slice(s, s + l);
    return { data: paginated.map(normalize), total: products.length, skip: s, limit: l };
  }

  // ── 2. Category — MUST be before :id ───────────────────────────
  /**
   * GET /api/commerce/products/category/old-money-closet
   */
  @Get('category/:slug')
  async findByCategory(@Param('slug') slug: string) {
    const products = await this.productService.findByCategory(slug) as any[];
    return { data: products.map(normalize), total: products.length, category: slug };
  }

  // ── 3. Collection — MUST be before :id ────────────────────────
  /**
   * GET /api/commerce/products/collection/:collectionId
   */
  @Get('collection/:collectionId')
  async findByCollection(@Param('collectionId') collectionId: string) {
    const products = await this.productService.findByCollection(collectionId) as any[];
    return { data: products.map(normalize), total: products.length };
  }

  // ── 4. Single — always last ────────────────────────────────────
  /**
   * GET /api/commerce/products/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const p = await this.productService.findById(id);
    if (!p) return { error: 'Product not found', id };
    return normalize(p);
  }
}