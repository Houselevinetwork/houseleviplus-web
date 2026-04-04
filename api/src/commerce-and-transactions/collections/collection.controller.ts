import { Controller, Get, Param } from '@nestjs/common';
import { CollectionService } from './collection.service';

/**
 * Location: api/src/commerce-and-transactions/collections/collection.controller.ts
 *
 * PUBLIC routes — no auth required. Used by web frontend and mobile app.
 *
 * The AdminCollectionController at 'admin/commerce/collections' handles
 * protected CRUD. This controller exposes read-only public endpoints.
 *
 * Routes:
 *   GET /api/commerce/collections         → all collections (for grid on shop page)
 *   GET /api/commerce/collections/:slug   → single collection by slug
 */

function normalize(c: any) {
  return {
    id:       String(c._id ?? c.id ?? ''),
    name:     String(c.name ?? ''),
    slug:     String(c.slug ?? ''),
    imageUrl: c.imageUrl ?? c.coverImage ?? null,
    description: c.description ?? '',
    productCount: c.productCount ?? 0,
  };
}

@Controller('api/commerce/collections')
export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  /**
   * GET /api/commerce/collections
   * All collections — used by shop page grid and mobile category nav
   */
  @Get()
  async findAll() {
    const collections = await this.collectionService.findAll() as any[];
    return {
      data:  collections.map(normalize),
      total: collections.length,
    };
  }

  /**
   * GET /api/commerce/collections/:slug
   * Single collection by slug — used by /shop/collections/[slug] page
   */
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    // Try findBySlug if it exists, fall back to findAll + filter
    try {
      const collections = await this.collectionService.findAll() as any[];
      const found = collections.find((c: any) => c.slug === slug);
      if (!found) return { error: 'Collection not found', slug };
      return normalize(found);
    } catch {
      return { error: 'Collection not found', slug };
    }
  }
}