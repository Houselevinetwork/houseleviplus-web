// src/user-and-monetization/pesapal/dto/payment-callback.dto.ts
export interface PesapalWebhookDto {
  orderTrackingId?: string;
  order_tracking_id?: string;
  trackingId?: string;
  payment_status_description?: string;
}
