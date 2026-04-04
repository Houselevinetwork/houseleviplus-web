import { IsString } from 'class-validator';

export class HandleIpnDto {
  @IsString()
  OrderTrackingId: string;

  @IsString()
  OrderMerchantReference: string;

  @IsString()
  OrderNotificationType: string;
}
