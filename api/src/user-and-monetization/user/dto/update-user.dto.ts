import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  walletBalance?: number;

  @IsOptional()
  isSubscribed?: boolean;
}
