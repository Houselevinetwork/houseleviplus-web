// src/user-and-monetization/billing/billing.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { RecurringPaymentService } from './recurring-payment.service';
import { Billing, BillingSchema } from './schemas/billing.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PesapalModule } from '../pesapal/pesapal.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Billing.name, schema: BillingSchema },
      { name: Subscription.name, schema: SubscriptionSchema }, // needed by RecurringPaymentService
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    ScheduleModule.forRoot(),                    // enables @Cron decorators
    forwardRef(() => SubscriptionModule),        // avoid circular dependency
    forwardRef(() => PesapalModule),             // avoid circular dependency
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    RecurringPaymentService,                     // cron jobs: reminders + auto-renewal
  ],
  exports: [
    BillingService,
    RecurringPaymentService,
  ],
})
export class BillingModule {}