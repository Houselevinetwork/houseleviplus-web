import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsDate 
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BillingStatusUpdate {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export class UpdateBillingDto {
  @IsOptional()
  @IsEnum(BillingStatusUpdate)
  status?: BillingStatusUpdate;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAt?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}