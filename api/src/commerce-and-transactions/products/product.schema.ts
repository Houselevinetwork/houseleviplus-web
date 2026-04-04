import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Location: api/src/commerce-and-transactions/products/product.schema.ts
 *
 * Fix: currency field had { type: Number } — should be { type: String }
 *
 * Added: regionalPricing map for auto-detect pricing by country/currency.
 * Stores prices in local currencies alongside the base KES price.
 * The frontend/API layer converts using stored rates rather than live lookup,
 * so prices are stable and don't flicker.
 *
 * Supported currencies:
 *   KES — Kenya Shilling      (base / default)
 *   UGX — Uganda Shilling
 *   TZS — Tanzania Shilling
 *   USD — US Dollar
 *   GBP — British Pound
 *   EUR — Euro
 *   ZAR — South African Rand
 */

export const SUPPORTED_CURRENCIES = ['KES', 'UGX', 'TZS', 'USD', 'GBP', 'EUR', 'ZAR'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Maps ISO-3166-1 alpha-2 country code → currency
export const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  KE: 'KES',  // Kenya
  UG: 'UGX',  // Uganda
  TZ: 'TZS',  // Tanzania
  RW: 'USD',  // Rwanda (USD widely used)
  ET: 'USD',  // Ethiopia
  NG: 'USD',  // Nigeria (USD for e-commerce)
  ZA: 'ZAR',  // South Africa
  GB: 'GBP',  // UK
  US: 'USD',  // USA
  // Everything else defaults to USD
};

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

// ── Regional price entry ───────────────────────────────────────────────────────
// Stored per-currency so display is instant with no live API call
@Schema({ _id: false })
class RegionalPrice {
  @Prop({ type: String, required: true })
  currency: string;           // e.g. 'UGX'

  @Prop({ type: Number, required: true })
  price: number;              // base price in this currency

  @Prop({ type: Number, default: null })
  salePrice: number;          // sale price in this currency

  @Prop({ type: Number, required: true })
  exchangeRate: number;       // rate used when this entry was set

  @Prop({ type: Date, default: Date.now })
  rateSetAt: Date;            // when the rate was last updated
}

// ── Variant ────────────────────────────────────────────────────────────────────
@Schema({ _id: true })
class Variant {
  _id?: Types.ObjectId;

  @Prop({ type: String, default: () => `sku-${Date.now()}` })
  sku: string;

  @Prop({ type: String, default: 'Default' })
  title: string;

  @Prop({ type: String })
  color?: string;

  @Prop({ type: String })
  size?: string;

  @Prop({ type: String })
  edition?: string;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: Number, default: 0 })
  stock: number;

  @Prop({ type: String })
  barcode?: string;
}

// ── Product image ──────────────────────────────────────────────────────────────
@Schema({ _id: true })
class ProductImage {
  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, default: '' })
  alt: string;

  @Prop({ type: Boolean, default: false })
  isPrimary: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;
}

// ── Main schema ────────────────────────────────────────────────────────────────
@Schema({ timestamps: true })
export class Product extends Document {

  // ── Core ────────────────────────────────────────────────────────
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, enum: [...PRODUCT_CATEGORIES], default: null })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'Collection', default: null })
  collectionId: Types.ObjectId;

  // ── Pricing (base currency = KES) ────────────────────────────────
  @Prop({ type: Number, required: true })
  basePrice: number;                    // always stored in KES

  @Prop({ type: String, default: 'KES' })   // ← was type: Number — that was the bug
  currency: string;

  @Prop({ type: Number, default: null })
  salePrice: number;

  @Prop({ type: Number, default: null })
  discountPrice: number;                // legacy alias for salePrice

  @Prop({ type: Boolean, default: false })
  onSale: boolean;

  /**
   * Regional prices — one entry per currency.
   * Populated by the admin when setting prices, or auto-computed
   * by the backend using stored exchange rates.
   *
   * Example:
   * [
   *   { currency: 'UGX', price: 450000, salePrice: 350000, exchangeRate: 2850, rateSetAt: ... },
   *   { currency: 'USD', price: 95,     salePrice: 72,     exchangeRate: 0.0068, rateSetAt: ... },
   * ]
   */
  @Prop({ type: [RegionalPrice], default: [] })
  regionalPricing: RegionalPrice[];

  // ── Stock ────────────────────────────────────────────────────────
  @Prop({ type: Number, default: 0 })
  totalStock: number;

  @Prop({ type: Number, default: 5 })
  lowStockThreshold: number;

  // ── Visibility ───────────────────────────────────────────────────
  @Prop({ type: Boolean, default: true })
  visible: boolean;

  // ── Media ────────────────────────────────────────────────────────
  @Prop({ type: [ProductImage], default: [] })
  images: ProductImage[];

  // ── Variants ─────────────────────────────────────────────────────
  @Prop({ type: [Variant], default: [] })
  variants: Variant[];

  // ── Meta ─────────────────────────────────────────────────────────
  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: String, enum: ['draft', 'published', 'archived'], default: 'published' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ── Indexes ────────────────────────────────────────────────────────────────────
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1, visible: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'regionalPricing.currency': 1 });