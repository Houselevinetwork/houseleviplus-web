import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ContentType } from '../schemas/content.schema';

export class ListContentDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @IsOptional()
  uploaderId?: string;
}