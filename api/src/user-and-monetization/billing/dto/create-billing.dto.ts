import { 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  IsEnum, 
  IsOptional,
  IsMongoId 
} from 'class-validator';

export enum BillingCycleDto {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEAR = 'half_year',
  YEARLY = 'yearly',
}

export class CreateBillingDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsMongoId()
  planId: string;

  @IsOptional()
  @IsMongoId()
  subscriptionId?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsEnum(BillingCycleDto)
  billingCycle: BillingCycleDto;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}