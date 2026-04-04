// api/src/modules/uploads/dtos/create-draft.dto.ts
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsObject,
  IsIn,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Region } from '../../content/schemas/content.schema';

// ============================================================================
// ENUMS
// ============================================================================
export enum MediaType {
  MINISERIES = 'miniseries',
  REELFILM   = 'reelfilm',
  STAGEPLAY  = 'stageplay',
  TVSHOW     = 'tvshow',
  MOVIE      = 'movie',
  PODCAST    = 'podcast',
  MUSIC      = 'music',
}

export enum ContentTypeEnum {
  VIDEO = 'video',
  AUDIO = 'audio',
}

export enum StorageMethod {
  R2     = 'r2',
  STREAM = 'stream',
}

export enum ContentRating {
  G     = 'G',
  PG    = 'PG',
  PG13  = 'PG-13',
  R     = 'R',
  NC17  = 'NC-17',
  TV_Y  = 'TV-Y',
  TV_Y7 = 'TV-Y7',
  TV_G  = 'TV-G',
  TV_PG = 'TV-PG',
  TV_14 = 'TV-14',
  TV_MA = 'TV-MA',
  NR    = 'NR',
}

// ============================================================================
// NESTED DTOs
// ============================================================================
export class SeriesInfoDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  genres?: string[];

  @IsOptional() @IsEnum(ContentRating)
  rating?: ContentRating;

  @IsOptional() @IsNumber()
  releaseYear?: number;

  @IsOptional() @IsBoolean()
  isOriginal?: boolean;

  @IsOptional() @IsBoolean()
  isExclusive?: boolean;
}

export class ImagesDto {
  @IsOptional() @IsString() poster?:   string;
  @IsOptional() @IsString() backdrop?: string;
}

// ============================================================================
// MAIN CREATE DRAFT DTO
// ============================================================================
export class CreateDraftDto {

  // ── Basic info ─────────────────────────────────────────────────────────────

  @IsEnum(MediaType) @IsNotEmpty()
  mediaType: MediaType;

  @IsString() @IsNotEmpty()
  title: string;

  @IsOptional() @IsString()
  description?: string;

  /**
   * Whether the media is video or audio.
   * Optional — omitted when wizard publishes a draft without media yet.
   */
  @IsOptional() @IsEnum(ContentTypeEnum)
  type?: ContentTypeEnum;

  /** Original filename — optional when file was uploaded in a prior wizard step. */
  @IsOptional() @IsString()
  fileName?: string;

  /** File size in bytes — optional when file was uploaded in a prior wizard step. */
  @IsOptional() @IsNumber() @Min(0)
  fileSize?: number;

  /** Storage destination — optional, defaults to 'r2' in the service. */
  @IsOptional() @IsEnum(StorageMethod)
  storageMethod?: StorageMethod;

  /** Public URL of an already-uploaded media file (wizard uploads media before draft). */
  @IsOptional() @IsString()
  mediaUrl?: string;

  // ── Status ─────────────────────────────────────────────────────────────────

  @IsOptional() @IsIn(['draft', 'processing', 'ready', 'error'])
  status?: string;

  // ── Host assignment ────────────────────────────────────────────────────────

  @IsOptional() @IsString() hostId?:   string;
  @IsOptional() @IsString() hostSlug?: string;
  @IsOptional() @IsString() hostName?: string;

  // ── Display flags ──────────────────────────────────────────────────────────

  @IsOptional() @IsBoolean() isPremium?:      boolean;
  @IsOptional() @IsBoolean() isFeatured?:     boolean;
  @IsOptional() @IsBoolean() isNewContent?:   boolean;

  @IsOptional() @IsString()
  displayDuration?: string;  // e.g. "1h 42m"

  // ── Images (poster + backdrop) ────────────────────────────────────────────

  @IsOptional() @IsObject() @ValidateNested() @Type(() => ImagesDto)
  images?: ImagesDto;

  // ── Series / episode ───────────────────────────────────────────────────────

  @IsOptional() @ValidateNested() @Type(() => SeriesInfoDto)
  series?: SeriesInfoDto;

  @IsOptional() @IsNumber()  season?:   number;
  @IsOptional() @IsNumber()  episode?:  number;
  @IsOptional() @IsString()  seriesId?: string;

  // ── Genres ─────────────────────────────────────────────────────────────────

  @IsOptional() @IsArray() @IsString({ each: true })
  genre?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  musicGenre?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  podcastGenre?: string[];

  // ── Release info ───────────────────────────────────────────────────────────

  @IsOptional() @IsNumber()            releaseYear?:   number;
  @IsOptional() @IsEnum(ContentRating) rating?:        ContentRating;
  @IsOptional() @IsArray() @IsString({ each: true }) ratingReasons?: string[];

  // ── Language & subtitles ───────────────────────────────────────────────────

  @IsOptional() @IsString()                          language?:    string;
  @IsOptional() @IsArray() @IsString({ each: true }) audioTracks?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) subtitles?:   string[];

  // ── Classification ─────────────────────────────────────────────────────────

  @IsOptional() @IsArray() @IsString({ each: true }) tags?:   string[];
  @IsOptional() @IsArray() @IsString({ each: true }) themes?: string[];

  // ── Regional metadata ──────────────────────────────────────────────────────

  @IsOptional() @IsArray() @IsEnum(Region, { each: true })
  region?: Region[];

  @IsOptional() @IsString() country?: string;

  // ── Category enabler flags ─────────────────────────────────────────────────

  @IsOptional() @IsBoolean() featured?:    boolean;
  @IsOptional() @IsBoolean() isOriginal?:  boolean;
  @IsOptional() @IsBoolean() isExclusive?: boolean;
  @IsOptional() @IsBoolean() isTrending?:  boolean;

  // ── Award & festival flags ─────────────────────────────────────────────────

  @IsOptional() @IsBoolean()                         hasWonAwards?:        boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) awardsList?:          string[];
  @IsOptional() @IsBoolean()                         isFestivalSelection?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) festivalsList?:       string[];

  // ── Thematic flags ─────────────────────────────────────────────────────────

  @IsOptional() @IsBoolean() voiceOfWomen?: boolean;
  @IsOptional() @IsBoolean() isDiaspora?:   boolean;

  // ── Cast & crew ────────────────────────────────────────────────────────────

  @IsOptional() @IsArray() @IsString({ each: true }) cast?: string[];
  @IsOptional() @IsString() director?: string;
  @IsOptional() @IsString() writer?:   string;
  @IsOptional() @IsString() producer?: string;

  // ── Episode-specific ───────────────────────────────────────────────────────

  @IsOptional() @IsString() episodeTitle?:       string;
  @IsOptional() @IsString() episodeDescription?: string;

  // ── Music-specific ─────────────────────────────────────────────────────────

  @IsOptional() @IsString() artist?: string;
  @IsOptional() @IsString() album?:  string;

  // ── Podcast-specific ───────────────────────────────────────────────────────

  @IsOptional() @IsString()                          host?:   string;
  @IsOptional() @IsArray() @IsString({ each: true }) guests?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) topics?: string[];
}