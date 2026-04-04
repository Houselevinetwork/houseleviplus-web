import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export enum ContentType {
  MINISODE = 'minisode',
  REELFILM = 'reelfilm',
  TV_EPISODE = 'tv_episode',
  MOVIE = 'movie',
  PODCAST = 'podcast',
  MUSIC = 'music',
}

export class CreateUploadSessionDto {
  @IsEnum(ContentType)
  @IsNotEmpty()
  type: ContentType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  uploaderId: string; // Injected from request context (auth handled elsewhere)
}