import { IsString, IsNumber, IsDate, IsEnum } from 'class-validator';

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class StartRecurringDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  subscriptionPlan: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @IsString()
  cardToken: string;
}
