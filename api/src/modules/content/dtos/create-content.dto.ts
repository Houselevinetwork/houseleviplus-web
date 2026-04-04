// api/src/modules/content/dtos/create-content.dto.ts
import {
  IsString, IsEnum, IsNotEmpty, IsOptional,
  IsNumber, IsArray, IsBoolean, ValidateNested, IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType, ContentRating } from '../schemas/content.schema';

// ============================================================================
// NESTED DTOs (unchanged)
// ============================================================================
export class SeriesInfoDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsObject()
  images?: { poster?: string; backdrop?: string; logo?: string };

  @IsOptional() @IsNumber() totalSeasons?:  number;
  @IsOptional() @IsNumber() totalEpisodes?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) genres?: string[];

  @IsOptional() @IsEnum(ContentRating) rating?: ContentRating;

  @IsOptional() @IsNumber() releaseYear?: number;

  @IsOptional() @IsBoolean() isOriginal?:  boolean;
  @IsOptional() @IsBoolean() isExclusive?: boolean;
}

// ============================================================================
// CREATE CONTENT DTO — all fields that uploads.service passes
// ============================================================================
export class CreateContentDto {

  // ── Core ──────────────────────────────────────────────────────────────────
  @IsEnum(ContentType) @IsNotEmpty()
  type: ContentType;

  @IsString() @IsNotEmpty()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsString() @IsNotEmpty()
  uploaderId: string;

  // ── Status ────────────────────────────────────────────────────────────────
  /** Defaults to 'draft' in ContentService.create() if omitted. */
  @IsOptional() @IsString()
  status?: string;

  // ── Host assignment ───────────────────────────────────────────────────────
  @IsOptional() @IsString() hostSlug?: string | null;
  @IsOptional() @IsString() hostId?:   string | null;
  @IsOptional() @IsString() hostName?: string | null;

  // ── Display flags ─────────────────────────────────────────────────────────
  @IsOptional() @IsBoolean() isPremium?:      boolean;
  @IsOptional() @IsBoolean() isFeatured?:     boolean;
  @IsOptional() @IsBoolean() isNewContent?:   boolean;
  @IsOptional() @IsString()  displayDuration?: string;
  @IsOptional() @IsString()  slug?:            string;

  // ── Images ────────────────────────────────────────────────────────────────
  @IsOptional() @IsObject()
  images?: { poster?: string; backdrop?: string; logo?: string };

  // ── Storage (pre-populated when mediaUrl was uploaded before draft) ───────
  @IsOptional() @IsObject()
  storage?: {
    originalUrl?:        string;
    cloudflareStreamId?: string;
    cloudflareKey?:      string;
    size?:               number;
    mimeType?:           string;
    provider?:           string;
    duration?:           number;
    thumbnail?:          string;
  };

  // ── Series / episode ──────────────────────────────────────────────────────
  @IsOptional() @ValidateNested() @Type(() => SeriesInfoDto)
  series?: SeriesInfoDto;

  @IsOptional() @IsNumber() season?:   number;
  @IsOptional() @IsNumber() episode?:  number;
  @IsOptional() @IsString() seriesId?: string;

  // ── Trailer ───────────────────────────────────────────────────────────────
  @IsOptional() @IsObject()
  trailer?: { cloudflareStreamId?: string; url?: string; duration?: number };

  // ── Rich metadata ─────────────────────────────────────────────────────────
  @IsOptional() @IsObject()
  metadata?: any;
}

// ============================================================================
// UPDATE CONTENT DTO (unchanged — already has images + storage)
// ============================================================================
export class UpdateContentDto {
  @IsOptional() @IsString()  title?:       string;
  @IsOptional() @IsString()  description?: string;
  @IsOptional() @IsString()  status?:      string;
  @IsOptional() @IsString()  hostSlug?:    string | null;
  @IsOptional() @IsString()  hostId?:      string | null;
  @IsOptional() @IsString()  hostName?:    string | null;
  @IsOptional() @IsBoolean() isPremium?:   boolean;
  @IsOptional() @IsBoolean() isFeatured?:  boolean;
  @IsOptional() @IsBoolean() isNewContent?: boolean;
  @IsOptional() @IsString()  displayDuration?: string;
  @IsOptional() @IsString()  slug?:        string;

  @IsOptional() @ValidateNested() @Type(() => SeriesInfoDto)
  series?: SeriesInfoDto;

  @IsOptional() @IsNumber() season?:   number;
  @IsOptional() @IsNumber() episode?:  number;
  @IsOptional() @IsString() seriesId?: string;

  @IsOptional() @IsObject()
  images?: { poster?: string; backdrop?: string; logo?: string };

  @IsOptional() @IsObject()
  trailer?: { cloudflareStreamId?: string; url?: string; duration?: number };

  @IsOptional() @IsObject()
  storage?: {
    originalUrl?:        string;
    cloudflareStreamId?: string;
    cloudflareKey?:      string;
    size?:               number;
    mimeType?:           string;
    provider?:           string;
    duration?:           number;
    thumbnail?:          string;
  };

  @IsOptional() @IsObject()
  metadata?: any;
}

// ============================================================================
// LIST CONTENT DTO (unchanged)
// ============================================================================
export class ListContentDto {
  @IsOptional() @IsNumber() page?:  number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() type?:  string;
  @IsOptional() @IsObject() filters?: any;
  @IsOptional() @IsObject() sort?:    any;
}

// ============================================================================
// MARK READY DTO (unchanged)
// ============================================================================
export class MarkReadyDto {
  @IsString() @IsNotEmpty() originalUrl: string;
  @IsOptional() @IsString() cloudflareKey?:      string;
  @IsOptional() @IsString() cloudflareStreamId?: string;
  @IsNotEmpty() @IsNumber() size:     number;
  @IsString() @IsNotEmpty() mimeType: string;
  @IsString() @IsNotEmpty() provider: string;
  @IsOptional() @IsNumber() duration?: number;
  @IsOptional() @IsString() thumbnail?: string;
}