
// ============================================
// FILE 1: create-subscription.dto.ts
// ============================================
import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsObject, 
  IsMongoId,
  IsBoolean 
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()  // Changed from IsMongoId since planId is a string
  planId: string;

  @IsOptional()
  @IsMongoId()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    promoCode?: string;
    discount?: number;
    orderTrackingId?: string;  // Added this field
    [key: string]: any;  // Allow additional metadata fields
  };
}