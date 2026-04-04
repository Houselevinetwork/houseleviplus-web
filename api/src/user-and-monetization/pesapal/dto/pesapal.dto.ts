// src/user-and-monetization/pesapal/dto/pesapal.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class CreateOrderDto {
  [x: string]: any;
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  planType: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}
