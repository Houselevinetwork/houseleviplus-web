import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BillingService } from '../billing/billing.service';
import { CreateBillingDto, BillingCycleDto } from '../billing/dto/create-billing.dto';

@Injectable()
export class BillingEventListener {
  private readonly logger = new Logger(BillingEventListener.name);

  constructor(private readonly billingService: BillingService) {}

  @OnEvent('billing.created')
  async handleBillingCreated(payload: any) {
    try {
      this.logger.log(`🔔 Billing Created Event Received`);
      this.logger.log(`   User ID: ${payload.userId}`);
      this.logger.log(`   Plan: ${payload.planName}`);

      const billingDto: CreateBillingDto = {
        userId: payload.userId.toString(),
        planId: payload.planId.toString(),
        subscriptionId: payload.subscriptionId?.toString(),
        amount: payload.amount,
        currency: payload.currency || 'KES',
        billingCycle: this.mapPlanTypeToBillingCycle(payload.planType),
        description: payload.description,
      };

      const billing = await this.billingService.createBilling(billingDto);
      
      this.logger.log(`✅ Billing created successfully`);
      this.logger.log(`   ID: ${billing._id}`);
      this.logger.log(`   Invoice: ${billing.invoiceNumber}`);
      this.logger.log(`   Amount: ${billing.amount} ${billing.currency}`);
      
    } catch (error) {
      this.logger.error(`❌ Failed to create billing: ${error.message}`);
      throw error;
    }
  }

  @OnEvent('billing.updated')
  async handleBillingUpdated(payload: any) {
    this.logger.log(`🔔 Billing Updated Event: ${payload.billingId}`);
    // Handle billing update events
  }

  @OnEvent('billing.paid')
  async handleBillingPaid(payload: any) {
    this.logger.log(`💰 Billing Paid Event: ${payload.billingId}`);
    // Handle successful payment events
  }

  /**
   * Helper method to map plan types to billing cycle
   */
  private mapPlanTypeToBillingCycle(planType: string): BillingCycleDto {
    const mapping: Record<string, BillingCycleDto> = {
      'monthly': BillingCycleDto.MONTHLY,
      'quarterly': BillingCycleDto.QUARTERLY,
      'half_year': BillingCycleDto.HALF_YEAR,
      'yearly': BillingCycleDto.YEARLY,
    };
    
    const cycle = mapping[planType?.toLowerCase()];
    if (!cycle) {
      this.logger.warn(`Unknown plan type: ${planType}, defaulting to MONTHLY`);
      return BillingCycleDto.MONTHLY;
    }
    
    return cycle;
  }
}