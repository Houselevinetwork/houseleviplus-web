// backend/src/modules/content/dtos/update-content.dto.ts
import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentRating } from '../schemas/content.schema';

export class SeriesInfoDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  images?: {
    poster?: string;
    backdrop?: string;
    logo?: string;
  };

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

export class UpdateContentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

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

  @IsObject()
  @IsOptional()
  images?: {
    poster?: string;
    backdrop?: string;
    logo?: string;
  };

  @IsObject()
  @IsOptional()
  trailer?: {
    cloudflareStreamId?: string;
    url?: string;
    duration?: number;
  };

  @IsObject()
  @IsOptional()
  storage?: {
    originalUrl?: string;
    cloudflareStreamId?: string;
    cloudflareKey?: string;
    size?: number;
    mimeType?: string;
    provider?: string;
    duration?: number;
    thumbnail?: string;
  };

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}