/**
 * OTP Request DTO
 */

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OtpRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  purpose?: string; // 'login' | 'signup' | 'verify_email'
}
