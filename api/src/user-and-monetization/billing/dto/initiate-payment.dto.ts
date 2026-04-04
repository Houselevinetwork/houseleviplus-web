import { IsString, IsNumber, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  planName: string;

  @IsString()
  @IsNotEmpty()
  planType: 'monthly' | 'quarterly' | 'half_year' | 'yearly';

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  billingCycle: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  callbackUrl: string;
}