import { IsString, IsOptional } from 'class-validator';

export class CancelRecurringDto {
  @IsString()
  subscriptionId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
