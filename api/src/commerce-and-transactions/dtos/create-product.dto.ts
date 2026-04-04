import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Category slugs — must match CATEGORIES in the admin/web frontend ──────────
export const PRODUCT_CATEGORIES = [
  'old-money-closet',
  'aviation-gear',
  'scale-collectibles',
  'host-merch',
  'book-club',
  'hl-merch',
  'partner-brands',
  'car-collectibles',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// ── Sub-DTOs ───────────────────────────────────────────────────────────────────

export class VariantDto {
  @IsOptional()
  @IsString()
  sku?: string;           // auto-generated from title+timestamp if omitted

  @IsOptional()
  @IsString()
  title?: string;         // defaults to 'Default'

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsNumber()
  price?: number;         // falls back to basePrice

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;         // defaults to 0
}

export class ProductImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  alt?: string;           // defaults to product title

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;    // defaults to true for first image
}

// ── Main DTO ───────────────────────────────────────────────────────────────────

export class CreateProductDto {
  // ── Required ──────────────────────────────────────────────────

  /** Product display name  e.g. "Levi's Old Money Navy Blazer" */
  @IsString()
  title: string;            // frontend sends as `name`, mapped in controller

  /** Original / base price in USD */
  @IsNumber()
  @Min(0)
  basePrice: number;        // frontend sends as `price`, mapped in controller

  // ── Category — the slug that maps to frontend CATEGORIES list ──

  /**
   * Category slug — must be one of PRODUCT_CATEGORIES.
   * Used by the frontend to place the product in the correct row.
   * e.g. 'old-money-closet' | 'aviation-gear' | 'hl-merch' ...
   */
  @IsOptional()
  @IsEnum(PRODUCT_CATEGORIES, {
    message: `category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`,
  })
  category?: ProductCategory;

  // ── Optional — auto-generated / defaulted if omitted ──────────

  /** URL-safe slug — auto-generated from title if not provided */
  @IsOptional()
  @IsString()
  slug?: string;

  /** Short description — defaults to empty string */
  @IsOptional()
  @IsString()
  description?: string;

  /** MongoDB ObjectId of the Collection document (optional) */
  @IsOptional()
  @IsString()
  collectionId?: string;

  /** Sale / discounted price */
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  /** True when salePrice is set */
  @IsOptional()
  @IsBoolean()
  onSale?: boolean;

  /** Whether product is visible on web & mobile */
  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  /** Product variants (size, colour, etc.) — defaults to one Default variant */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  /** Product images — auto-wrapped from imageUrl if not provided */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  /** Tags for search / filtering */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  /** Pin to Best Sellers row */
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  /** Internal field set by the controller */
  @IsOptional()
  createdBy?: string;
}