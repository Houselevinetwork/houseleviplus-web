import { Module, forwardRef, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PesapalService } from './pesapal.service';
import { PesapalController } from './pesapal.controller';
import { PesapalOrder, PesapalOrderSchema } from './pesapal.schema';
import { SubscriptionModule } from '../subscription/subscription.module';
import { BillingModule } from '../billing/billing.module';
import { SubscriptionService } from '../subscription/subscription.service';
import { BillingService } from '../billing/billing.service';
import { CreateBillingDto, BillingCycleDto } from '../billing/dto/create-billing.dto';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PesapalOrder.name, schema: PesapalOrderSchema }]),
    EventEmitterModule.forRoot(),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => BillingModule),
  ],
  controllers: [PesapalController],
  providers: [
    PesapalService,
    {
      provide: 'PAYMENT_EVENT_LISTENER',
      useFactory: (
        pesapalService: PesapalService,
        subscriptionService: SubscriptionService,
        billingService: BillingService,
      ) => {
        const logger = new Logger('PAYMENT_EVENT_LISTENER');

        logger.log('🔔 Payment event listener initialized');

        pesapalService['eventEmitter'].on('payment.completed', async (payload) => {
          logger.log(`🔔 Received payment.completed event: ${JSON.stringify(payload)}`);

          const { userId, planType, amount, orderId } = payload;
          let subscriptionId: string | null = null;

          // 1️⃣ Create and activate subscription
          try {
            // Map planType to plan name
            const getPlanName = (type: string): string => {
              const names: Record<string, string> = {
                monthly: 'Monthly',
                quarterly: 'Quarterly',
                half_year: 'Half Year',
                yearly: 'Annual',
              };
              return names[type] || 'Monthly';
            };

            // Create subscription
            const subscription = await subscriptionService.create(
              {
                userId,
                planId: `${planType}_plan`,
                metadata: { orderTrackingId: orderId },
              },
              {
                planName: getPlanName(planType),
                planType,
                amount,
                currency: 'KES',
              },
            );

            subscriptionId = (subscription as any)._id?.toString();

            // Activate subscription
            if (subscriptionId) {
              await subscriptionService.activateSubscription(subscriptionId);
              logger.log(`✅ Subscription created and activated for user ${userId} (subscriptionId: ${subscriptionId})`);
            }
          } catch (err: any) {
            logger.error(`❌ Failed to create/activate subscription: ${err.message}`);
          }

          // 2️⃣ Create billing record
          try {
            if (!subscriptionId) throw new Error('Cannot create billing without subscriptionId');

            // Map planType to BillingCycleDto
            const mapPlanTypeToBillingCycle = (type: string): BillingCycleDto => {
              const mapping: Record<string, BillingCycleDto> = {
                'monthly': BillingCycleDto.MONTHLY,
                'quarterly': BillingCycleDto.QUARTERLY,
                'half_year': BillingCycleDto.HALF_YEAR,
                'yearly': BillingCycleDto.YEARLY,
              };
              return mapping[type?.toLowerCase()] || BillingCycleDto.MONTHLY;
            };

            const billingDto: CreateBillingDto = {
              userId,
              planId: `${planType}_plan`,
              subscriptionId,
              amount,
              currency: 'KES',
              description: `${planType} subscription payment - Order: ${orderId}`,
              billingCycle: mapPlanTypeToBillingCycle(planType),
              transactionId: orderId,
            };

            logger.log(`💳 Creating billing record: ${JSON.stringify(billingDto)}`);
            await billingService.createBilling(billingDto);

            logger.log(`✅ Billing record created for user ${userId}`);
          } catch (err: any) {
            logger.error(`❌ Failed to create billing record: ${err.message}`);
          }
        });
      },
      inject: [PesapalService, SubscriptionService, BillingService],
    },
  ],
  exports: [PesapalService],
})
export class PesapalModule {}