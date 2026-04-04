import { Module } from '@nestjs/common';
import { PaymentEventListener } from './payment-event.listener';
import { BillingEventListener } from '../billing/billing-event.listener';
import { SubscriptionModule } from '../subscription/subscription.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [SubscriptionModule, BillingModule],
  providers: [PaymentEventListener, BillingEventListener],
})
export class ListenersModule {}