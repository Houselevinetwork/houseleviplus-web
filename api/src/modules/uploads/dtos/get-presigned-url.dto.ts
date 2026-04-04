import { IsString, IsNotEmpty } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;
}