// backend/src/modules/uploads/dtos/complete-upload.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Region } from '../../content/schemas/content.schema';

// ============================================================================
// ENUMS
// ============================================================================
export enum StorageMethod {
  R2 = 'r2',
  STREAM = 'stream',
}

export enum ContentRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG-13',
  R = 'R',
  NC17 = 'NC-17',
  TV_Y = 'TV-Y',
  TV_Y7 = 'TV-Y7',
  TV_G = 'TV-G',
  TV_PG = 'TV-PG',
  TV_14 = 'TV-14',
  TV_MA = 'TV-MA',
  NR = 'NR',
}

// ============================================================================
// IMAGE URLS DTO
// ============================================================================
export class ImageUrlsDto {
  @IsString()
  @IsOptional()
  poster?: string;      // Portrait (2:3) - PRIMARY

  @IsString()
  @IsOptional()
  backdrop?: string;    // Landscape (16:9) - Hero banners

  @IsString()
  @IsOptional()
  logo?: string;        // Transparent PNG - Title overlay
}

// ============================================================================
// TRAILER INFO DTO
// ============================================================================
export class TrailerDto {
  @IsString()
  @IsOptional()
  cloudflareStreamId?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;
}

// ============================================================================
// SUBTITLE DTO
// ============================================================================
export class SubtitleDto {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

// ============================================================================
// SERIES INFO DTO
// ============================================================================
export class SeriesInfoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => ImageUrlsDto)
  @IsOptional()
  images?: ImageUrlsDto;

  @IsNumber()
  @IsOptional()
  totalSeasons?: number;

  @IsNumber()
  @IsOptional()
  totalEpisodes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @IsEnum(ContentRating)
  @IsOptional()
  rating?: ContentRating;

  @IsNumber()
  @IsOptional()
  releaseYear?: number;

  @IsBoolean()
  @IsOptional()
  isOriginal?: boolean;

  @IsBoolean()
  @IsOptional()
  isExclusive?: boolean;
}

// ============================================================================
// MAIN COMPLETE UPLOAD DTO
// ============================================================================
export class CompleteUploadDto {
  // ============================================================================
  // BASIC INFO
  // ============================================================================
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(StorageMethod)
  @IsNotEmpty()
  storageMethod: StorageMethod;

  @IsString()
  @IsOptional()
  cloudflareKey?: string;

  @IsString()
  @IsOptional()
  cloudflareStreamId?: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  fileSize: number;

  @IsNumber()
  @IsOptional()
  duration?: number;

  // ============================================================================
  // IMAGES (Multiple Variants)
  // ============================================================================
  @ValidateNested()
  @Type(() => ImageUrlsDto)
  @IsOptional()
  images?: ImageUrlsDto;

  @IsString()
  @IsOptional()
  thumbnail?: string;  // Legacy fallback

  // ============================================================================
  // TRAILER
  // ============================================================================
  @ValidateNested()
  @Type(() => TrailerDto)
  @IsOptional()
  trailer?: TrailerDto;

  // ============================================================================
  // SERIES/EPISODE INFO
  // ============================================================================
  @ValidateNested()
  @Type(() => SeriesInfoDto)
  @IsOptional()
  series?: SeriesInfoDto;

  @IsNumber()
  @IsOptional()
  season?: number;

  @IsNumber()
  @IsOptional()
  episode?: number;

  @IsString()
  @IsOptional()
  seriesId?: string;

  // ============================================================================
  // RICH METADATA
  // ============================================================================
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cast?: string[];

  @IsString()
  @IsOptional()
  director?: string;

  @IsString()
  @IsOptional()
  writer?: string;

  @IsString()
  @IsOptional()
  producer?: string;

  // ========================================
  // GENRES (Content-Type Specific)
  // ========================================
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genre?: string[];  // General/Film genres

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  musicGenre?: string[];  // NEW: Afrobeats, Hip-Hop, etc.

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  podcastGenre?: string[];  // NEW: Interview, Documentary, etc.

  // ========================================
  // Release Info
  // ========================================
  @IsNumber()
  @IsOptional()
  releaseYear?: number;

  @IsEnum(ContentRating)
  @IsOptional()
  rating?: ContentRating;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ratingReasons?: string[];

  // ========================================
  // Language & Subtitles
  // ========================================
  @IsString()
  @IsOptional()
  language?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  audioTracks?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subtitles?: string[];

  @ValidateNested({ each: true })
  @Type(() => SubtitleDto)
  @IsOptional()
  subtitleUrls?: SubtitleDto[];

  // ========================================
  // Classification
  // ========================================
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  themes?: string[];  // NEW: urban, rural, heritage, youth, street

  // ============================================================================
  // REGIONAL METADATA (NEW)
  // ============================================================================
  @IsArray()
  @IsEnum(Region, { each: true })
  @IsOptional()
  region?: Region[];  // NEW: East Africa, West Africa, etc.

  @IsString()
  @IsOptional()
  country?: string;  // NEW: Kenya, Nigeria, etc.

  // ============================================================================
  // CATEGORY ENABLER FLAGS
  // ============================================================================
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  isOriginal?: boolean;

  @IsBoolean()
  @IsOptional()
  isExclusive?: boolean;

  @IsBoolean()
  @IsOptional()
  isTrending?: boolean;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  // ========================================
  // NEW: Award & Festival Flags
  // ========================================
  @IsBoolean()
  @IsOptional()
  hasWonAwards?: boolean;  // NEW

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  awardsList?: string[];  // NEW: ['AMVCA 2024', 'Cannes Selection']

  @IsBoolean()
  @IsOptional()
  isFestivalSelection?: boolean;  // NEW

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  festivalsList?: string[];  // NEW: ['TIFF', 'Zanzibar Film Festival']

  // ========================================
  // NEW: Thematic Flags
  // ========================================
  @IsBoolean()
  @IsOptional()
  voiceOfWomen?: boolean;  // NEW: Led by/about African women

  @IsBoolean()
  @IsOptional()
  isDiaspora?: boolean;  // NEW: Diaspora stories

  // ============================================================================
  // EPISODE-SPECIFIC
  // ============================================================================
  @IsString()
  @IsOptional()
  episodeTitle?: string;

  @IsString()
  @IsOptional()
  episodeDescription?: string;

  // ============================================================================
  // MUSIC-SPECIFIC
  // ============================================================================
  @IsString()
  @IsOptional()
  artist?: string;

  @IsString()
  @IsOptional()
  album?: string;

  // ============================================================================
  // PODCAST-SPECIFIC
  // ============================================================================
  @IsString()
  @IsOptional()
  host?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  guests?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topics?: string[];

  @IsArray()
  @IsOptional()
  timestamps?: { time: number; label: string }[];
}