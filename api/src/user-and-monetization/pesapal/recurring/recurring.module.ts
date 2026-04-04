import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PesapalRecurringService } from './pesapal-recurring.service';
import { RecurringPaymentService } from './services/recurring-payment.service';
import { RecurringVerificationService } from './services/recurring-verification.service';
import { RecurringSubscriptionService } from './services/recurring-subscription.service';
import { RecurringCancellationService } from './services/recurring-cancellation.service';
import { SubscriptionPlanValidatorService } from './services/subscription-plan-validator.service';
import { RecurringController } from './recurring.controller';

@Module({
  providers: [
    PesapalRecurringService,
    RecurringPaymentService,
    RecurringVerificationService,
    RecurringSubscriptionService,
    RecurringCancellationService,
    SubscriptionPlanValidatorService,
  ],
  controllers: [RecurringController],
  exports: [PesapalRecurringService],
})
export class RecurringModule {}

