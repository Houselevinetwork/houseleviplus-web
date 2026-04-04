// src/user-and-monetization/subscription/dto/subscription.dto.ts
import { IsEnum, IsOptional, IsString, IsBoolean, IsMongoId } from 'class-validator';
import { SubscriptionStatus } from '../schemas/subscription.schema';

export enum SubscriptionStatusDto {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export class CheckSubscriptionDto {
  @IsMongoId()
  userId: string;
}

export class CancelSubscriptionDto {
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class SubscriptionQueryDto {
  @IsOptional()
  @IsEnum(SubscriptionStatusDto)
  status?: SubscriptionStatusDto;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  planId?: string;

  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}
