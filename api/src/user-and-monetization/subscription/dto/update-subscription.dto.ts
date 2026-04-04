// src/user-and-monetization/subscription/dto/update-subscription.dto.ts
import { 
  IsEnum, 
  IsOptional, 
  IsString, 
  IsBoolean, 
  IsDate, 
  IsMongoId 
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus } from '../schemas/subscription.schema';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextBillingDate?: Date;

  @IsOptional()
  @IsMongoId()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class ActivateSubscriptionDto {
  @IsMongoId()
  subscriptionId: string;

  @IsOptional()
  @IsMongoId()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
