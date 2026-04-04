// src/user-and-monetization/billing/billing.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Billing, BillingDocument, BillingStatus, BillingCycle } from './schemas/billing.schema';
import { CreateBillingDto, BillingCycleDto } from './dto/create-billing.dto';
import { UpdateBillingDto, BillingStatusUpdate } from './dto/update-billing.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { PesapalService } from '../pesapal/pesapal.service';
import { PlanType } from '../pesapal/dto/create-order.dto';

type PesapalResponse = {
  order_tracking_id?: string;
  orderTrackingId?: string;
  trackingId?: string;
  redirect_url?: string;
  redirectUrl?: string;
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Billing.name)
    private billingModel: Model<BillingDocument>,
    private subscriptionService: SubscriptionService,
    private pesapalService: PesapalService,
  ) {}

  /**
   * Get all billings by user
   */
  async getAllBillingsByUser(userId: string): Promise<BillingDocument[]> {
    return this.billingModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('planId subscriptionId')
      .sort({ createdAt: -1 });
  }

  /**
   * Get billing by ID
   */
  async getBillingById(billingId: string): Promise<BillingDocument> {
    const billing = await this.billingModel
      .findById(billingId)
      .populate('planId subscriptionId');
    
    if (!billing) {
      throw new NotFoundException('Billing record not found');
    }
    
    return billing;
  }

  /**
   * Get billing by invoice number
   */
  async getBillingByInvoiceNumber(invoiceNumber: string): Promise<BillingDocument> {
    const billing = await this.billingModel
      .findOne({ invoiceNumber })
      .populate('planId subscriptionId');
    
    if (!billing) {
      throw new NotFoundException('Invoice not found');
    }
    
    return billing;
  }

  /**
   * Get billing statistics for a user
   */
  async getBillingStats(userId: string) {
    const billings = await this.billingModel.find({ 
      userId: new Types.ObjectId(userId) 
    });

    const stats = {
      totalBillings: billings.length,
      totalSpent: 0,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      cancelledPayments: 0,
      refundedPayments: 0,
      lastPaymentDate: null as Date | null,
      averagePayment: 0,
    };

    billings.forEach((billing) => {
      if (billing.status === BillingStatus.COMPLETED) {
        stats.totalSpent += billing.amount;
        stats.completedPayments++;
        if (billing.paidAt && (!stats.lastPaymentDate || billing.paidAt > stats.lastPaymentDate)) {
          stats.lastPaymentDate = billing.paidAt;
        }
      } else if (billing.status === BillingStatus.PENDING) {
        stats.pendingPayments++;
      } else if (billing.status === BillingStatus.FAILED) {
        stats.failedPayments++;
      } else if (billing.status === BillingStatus.CANCELLED) {
        stats.cancelledPayments++;
      } else if (billing.status === BillingStatus.REFUNDED) {
        stats.refundedPayments++;
      }
    });

    stats.averagePayment = stats.completedPayments > 0 
      ? stats.totalSpent / stats.completedPayments 
      : 0;

    return stats;
  }

  /**
   * Verify payment status - Called by frontend after user returns from payment
   * This checks Pesapal directly and updates local database
   */
  async verifyPaymentStatus(
    orderTrackingId: string,
    merchantReference?: string,
    userId?: string
  ) {
    this.logger.log(`🔍 Verifying payment status for tracking ID: ${orderTrackingId}`);
    
    try {
      // 1. Get transaction status from Pesapal
      const pesapalStatus = await this.pesapalService.getTransactionStatus(orderTrackingId);
      this.logger.log(`📊 Pesapal status response: ${JSON.stringify(pesapalStatus)}`);
      
      const paymentStatus = pesapalStatus?.payment_status_description || 
                           pesapalStatus?.PaymentStatusDescription || 
                           pesapalStatus?.status_description ||
                           'UNKNOWN';
      
      this.logger.log(`💳 Payment status: ${paymentStatus}`);
      
      // 2. Find the billing record
      const query: any = { transactionId: orderTrackingId };
      if (userId) {
        query.userId = new Types.ObjectId(userId);
      }
      
      const billing = await this.billingModel.findOne(query);
      
      if (!billing) {
        this.logger.error(`❌ Billing record not found for tracking ID: ${orderTrackingId}`);
        
        // Return status from Pesapal even if billing record not found
        return {
          status: paymentStatus.toLowerCase(),
          message: 'Payment status retrieved but billing record not found',
          pesapalStatus: paymentStatus,
          subscriptionActivated: false
        };
      }
      
      // 3. Check current billing status
      const currentStatus = billing.status;
      this.logger.log(`📋 Current billing status: ${currentStatus}`);
      
      // 4. Update billing based on Pesapal status
      const statusLower = paymentStatus.toLowerCase();
      let subscriptionActivated = false;
      
      if (statusLower.includes('completed') || statusLower.includes('success')) {
        if (currentStatus !== BillingStatus.COMPLETED) {
          // Update billing to completed - FIX: Cast _id to Types.ObjectId
          await this.updateBilling((billing._id as Types.ObjectId).toString(), {
            status: BillingStatusUpdate.COMPLETED,
            paymentReference: orderTrackingId,
            paidAt: new Date(),
          });
          
          // Activate subscription
          if (billing.subscriptionId) {
            try {
              await this.subscriptionService.activateSubscription(
                billing.subscriptionId.toString()
              );
              subscriptionActivated = true;
              this.logger.log(`✅ Subscription activated: ${billing.subscriptionId}`);
            } catch (error) {
              this.logger.error(`Failed to activate subscription: ${error.message}`);
            }
          }
        } else {
          // Already completed
          subscriptionActivated = true;
        }
        
        return {
          status: 'completed',
          message: 'Payment completed successfully',
          billing: billing.toObject(),
          subscriptionActivated,
          subscriptionId: billing.subscriptionId?.toString()
        };
        
      } else if (statusLower.includes('failed')) {
        // FIX: Cast _id to Types.ObjectId
        await this.updateBilling((billing._id as Types.ObjectId).toString(), {
          status: BillingStatusUpdate.FAILED,
        });
        
        return {
          status: 'failed',
          message: 'Payment failed',
          billing: billing.toObject(),
          subscriptionActivated: false
        };
        
      } else if (statusLower.includes('cancelled')) {
        // FIX: Cast _id to Types.ObjectId
        await this.updateBilling((billing._id as Types.ObjectId).toString(), {
          status: BillingStatusUpdate.CANCELLED,
        });
        
        return {
          status: 'cancelled',
          message: 'Payment was cancelled',
          billing: billing.toObject(),
          subscriptionActivated: false
        };
      }
      
      // Still pending
      return {
        status: 'pending',
        message: 'Payment is still pending',
        billing: billing.toObject(),
        subscriptionActivated: false
      };
      
    } catch (error: any) {
      this.logger.error(`❌ Error verifying payment: ${error.message}`);
      throw new BadRequestException(`Failed to verify payment: ${error.message}`);
    }
  }

  /**
   * Get subscription status for a user
   * Used by frontend to check if user has active access
   */
  async getSubscriptionStatus(userId: string) {
    this.logger.log(`📊 Getting subscription status for user: ${userId}`);
    
    try {
      // Get latest subscription for this user
      const subscription = await this.subscriptionService.findLatestByUserId(userId);
      
      if (!subscription) {
        return {
          hasSubscription: false,
          status: 'none',
          message: 'No subscription found',
          isActive: false
        };
      }
      
      const isActive = subscription.status === 'active';
      const isPending = subscription.status === 'pending';
      const isCancelled = subscription.status === 'cancelled';
      const isExpired = subscription.status === 'expired';
      
      // Check if subscription has expired - FIX: Use endDate instead of currentPeriodEnd
      let needsRenewal = false;
      if (isActive && subscription.endDate) {
        const now = new Date();
        if (subscription.endDate < now) {
          needsRenewal = true;
        }
      }
      
      return {
        hasSubscription: true,
        status: subscription.status,
        isActive: isActive && !needsRenewal,
        isPending,
        isCancelled,
        isExpired: isExpired || needsRenewal,
        needsRenewal,
        subscription: {
          id: subscription._id,
          planId: subscription.planId,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          nextBillingDate: subscription.nextBillingDate || null,
        },
        message: isActive && !needsRenewal 
          ? 'Subscription is active' 
          : isPending 
          ? 'Subscription payment pending'
          : isCancelled
          ? 'Subscription cancelled'
          : 'Subscription expired or needs renewal'
      };
      
    } catch (error: any) {
      this.logger.error(`❌ Error getting subscription status: ${error.message}`);
      
      // If findLatestByUserId doesn't exist, return no subscription
      if (error.message?.includes('findLatestByUserId is not a function')) {
        return {
          hasSubscription: false,
          status: 'none',
          message: 'No subscription found',
          isActive: false
        };
      }
      
      throw new BadRequestException(`Failed to get subscription status: ${error.message}`);
    }
  }

  /**
   * Handle payment callback from Pesapal
   */
  async handlePaymentCallback(webhookData: any) {
    this.logger.log(`Processing payment callback: ${JSON.stringify(webhookData)}`);

    const orderTrackingId = webhookData.OrderTrackingId || webhookData.order_tracking_id;
    
    if (!orderTrackingId) {
      throw new BadRequestException('Order tracking ID not found in webhook data');
    }

    // Find billing by transaction ID
    const billing = await this.billingModel.findOne({ 
      transactionId: orderTrackingId 
    });

    if (!billing) {
      throw new NotFoundException(`Billing record not found for transaction: ${orderTrackingId}`);
    }

    // Query Pesapal for the actual payment status
    let paymentStatus = 'UNKNOWN';
    try {
      const pesapalStatus = await this.pesapalService.getTransactionStatus(orderTrackingId);
      this.logger.log(`📊 Pesapal status response: ${JSON.stringify(pesapalStatus)}`);
      
      paymentStatus = pesapalStatus?.payment_status_description || 
                     pesapalStatus?.PaymentStatusDescription || 
                     pesapalStatus?.status_description ||
                     pesapalStatus?.payment_status ||
                     'UNKNOWN';
    } catch (error) {
      this.logger.error(`Failed to get Pesapal status: ${error.message}`);
      // Try fallback from webhook data
      paymentStatus = webhookData.payment_status_description || 
                     webhookData.PaymentStatusDescription || 
                     'UNKNOWN';
    }

    this.logger.log(`💳 Payment status for ${orderTrackingId}: ${paymentStatus}`);

    // Map Pesapal status to billing status
    let billingStatus = BillingStatusUpdate.PENDING;
    
    const statusLower = paymentStatus.toLowerCase();
    
    if (statusLower.includes('completed') || statusLower.includes('success')) {
      billingStatus = BillingStatusUpdate.COMPLETED;
    } else if (statusLower.includes('failed')) {
      billingStatus = BillingStatusUpdate.FAILED;
    } else if (statusLower.includes('cancelled')) {
      billingStatus = BillingStatusUpdate.CANCELLED;
    }

    this.logger.log(`🔄 Updating billing to status: ${billingStatus}`);

    // Update billing record
    const updatedBilling = await this.updateBilling((billing._id as Types.ObjectId).toString(), {
      status: billingStatus,
      paymentReference: orderTrackingId,
      paidAt: billingStatus === BillingStatusUpdate.COMPLETED ? new Date() : undefined,
    });

    // If payment completed, activate subscription
    if (billingStatus === BillingStatusUpdate.COMPLETED && billing.subscriptionId) {
      try {
        await this.subscriptionService.activateSubscription(
          billing.subscriptionId.toString()
        );
        this.logger.log(`✅ Subscription activated: ${billing.subscriptionId}`);
      } catch (error) {
        this.logger.error(`Failed to activate subscription: ${error.message}`);
      }
    }

    return updatedBilling;
  }

  /**
   * Cancel billing (soft delete)
   */
  async cancelBilling(billingId: string): Promise<BillingDocument> {
    const billing = await this.billingModel.findById(billingId);
    if (!billing) throw new NotFoundException('Billing record not found');

    billing.status = BillingStatus.CANCELLED;
    billing.set({ updatedAt: new Date() });
    return billing.save();
  }

  /**
   * Initiate payment
   */
  async initiatePayment(paymentData: {
    userId: string;
    planId: string;
    planName: string;
    billingCycle: PlanType;
    amount: number;
    currency?: string;
    description?: string;
    callbackUrl?: string;
    email?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    metadata?: { ipAddress?: string; userAgent?: string };
  }) {
    this.logger.log(`Initiating payment for user: ${paymentData.userId}`);

    if (!paymentData.userId || !paymentData.planId || !paymentData.planName || !paymentData.billingCycle || !paymentData.amount) {
      throw new BadRequestException('Missing required payment fields');
    }

    // Check if user already has an active or pending subscription
    let subscription;
    try {
      subscription = await this.subscriptionService.findLatestByUserId(paymentData.userId);
      
      if (subscription) {
        // If user has active subscription and trying to subscribe again
        if (subscription.status === 'active') {
          this.logger.log(`User ${paymentData.userId} already has active subscription: ${subscription._id}`);
          
          // Check if it's a plan change/upgrade
          const isSamePlan = subscription.planId?.toString() === paymentData.planId;
          
          if (isSamePlan) {
            throw new BadRequestException('You already have an active subscription to this plan');
          } else {
            // It's a plan change - cancel old subscription
            this.logger.log(`User changing plan from ${subscription.planId} to ${paymentData.planId}`);
            await this.subscriptionService.cancelSubscription(subscription._id.toString());
          }
        }
        
        // If pending subscription exists, we can reuse it for retry scenarios
        if (subscription.status === 'pending') {
          this.logger.log(`Reusing pending subscription: ${subscription._id}`);
        }
      }
    } catch (error) {
      // If findLatestByUserId throws (method doesn't exist), continue to create new subscription
      this.logger.log(`No existing subscription check: ${error.message}`);
    }

    // Create new subscription if none exists or old one was cancelled
    if (!subscription || subscription.status === 'cancelled') {
      subscription = await this.subscriptionService.create(
        {
          userId: paymentData.userId,
          planId: paymentData.planId,
          metadata: paymentData.metadata || {},
        },
        {
          planName: paymentData.planName,
          planType: paymentData.billingCycle,
          amount: paymentData.amount,
          currency: paymentData.currency || 'KES',
        },
      );
    }

    // Access _id safely from Document
    const subscriptionId = (subscription as any)._id?.toString() || null;
    if (!subscriptionId) {
      throw new BadRequestException('Failed to create subscription');
    }

    // Check if billing record already exists for this subscription
    let billing: BillingDocument | null = await this.billingModel.findOne({
      subscriptionId,
      status: BillingStatus.PENDING
    });

    if (billing) {
      this.logger.log(`♻️ Reusing existing pending billing record: ${billing._id}`);
      
      // Update the billing with latest payment data if needed
      billing.amount = paymentData.amount;
      billing.currency = paymentData.currency || 'KES';
      billing.description = paymentData.description || 'Subscription Payment';
      billing.set({ updatedAt: new Date() });
      await billing.save();
    } else {
      // Create new billing record only if none exists
      this.logger.log(`📝 Creating new billing record for subscription: ${subscriptionId}`);
      const billingDto: CreateBillingDto = {
        userId: paymentData.userId,
        planId: paymentData.planId,
        subscriptionId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'KES',
        billingCycle: this.mapBillingCycleToBillingCycleDto(paymentData.billingCycle),
        description: paymentData.description || 'Subscription Payment',
      };

      billing = await this.createBilling(billingDto);
    }

    if (!billing) {
      throw new BadRequestException('Failed to create or retrieve billing record');
    }

    const billingId = (billing._id as Types.ObjectId).toString();
    
    // Generate unique order ID for Pesapal (append timestamp to make it unique)
    const uniqueOrderId = `${billingId}-${Date.now()}`;

    // Initiate payment with Pesapal safely
    let paymentResponse: PesapalResponse | null = null;
    try {
      if (!this.pesapalService.submitOrder) throw new Error('Pesapal submitOrder method not available');

      const pesapalResult = await this.pesapalService.submitOrder({
        id: uniqueOrderId,
        currency: billing.currency,
        amount: billing.amount,
        description: billing.description,
        callback_url: paymentData.callbackUrl || process.env.PESAPAL_CALLBACK_URL,
        notification_id: process.env.PESAPAL_IPN_ID,
        billing_address: {
          email_address: paymentData.email || '',
          phone_number: paymentData.phoneNumber || '',
          first_name: paymentData.firstName || '',
          last_name: paymentData.lastName || '',
        },
        planType: paymentData.planName,
      });

      paymentResponse = pesapalResult as unknown as PesapalResponse;

      if (!paymentResponse) throw new Error('Pesapal submitOrder returned no response');
    } catch (err: any) {
      await this.updateBilling(billingId, {
        status: BillingStatusUpdate.FAILED,
        notes: `Pesapal initiation failed: ${err.message}`,
      });
      this.logger.error(`Pesapal initiation failed: ${err.message}`);
      throw new BadRequestException('Payment initiation failed');
    }

    const transactionId =
      paymentResponse.order_tracking_id ||
      paymentResponse.orderTrackingId ||
      paymentResponse.trackingId ||
      '';

    await this.updateBilling(billingId, {
      paymentReference: transactionId,
      transactionId,
      notes: `Pesapal Order ID: ${uniqueOrderId}`,
    });

    return {
      redirectUrl: paymentResponse.redirect_url || paymentResponse.redirectUrl || '',
      transactionId,
      subscriptionId,
      billingId,
    };
  }

  /**
   * Create billing record
   */
  async createBilling(createDto: CreateBillingDto): Promise<BillingDocument> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const billing = new this.billingModel({
      ...createDto,
      invoiceNumber,
      status: BillingStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return billing.save();
  }

  /**
   * Update billing
   */
  async updateBilling(billingId: string, updateDto: UpdateBillingDto): Promise<BillingDocument> {
    const billing = await this.billingModel.findById(billingId);
    if (!billing) throw new NotFoundException('Billing record not found');

    // Map BillingStatusUpdate enum to BillingStatus enum
    if (updateDto.status) {
      switch (updateDto.status) {
        case BillingStatusUpdate.COMPLETED:
          billing.status = BillingStatus.COMPLETED;
          break;
        case BillingStatusUpdate.FAILED:
          billing.status = BillingStatus.FAILED;
          break;
        case BillingStatusUpdate.CANCELLED:
          billing.status = BillingStatus.CANCELLED;
          break;
        case BillingStatusUpdate.REFUNDED:
          billing.status = BillingStatus.REFUNDED;
          break;
        case BillingStatusUpdate.PENDING:
          billing.status = BillingStatus.PENDING;
          break;
      }
    }

    // Update other fields
    if (updateDto.transactionId) billing.transactionId = updateDto.transactionId;
    if (updateDto.paymentReference) billing.paymentReference = updateDto.paymentReference;
    if (updateDto.notes) billing.notes = updateDto.notes;
    if (updateDto.paidAt) billing.paidAt = updateDto.paidAt;

    // Auto-set paidAt if status is COMPLETED and not already set
    if (billing.status === BillingStatus.COMPLETED && !billing.paidAt) {
      billing.paidAt = new Date();
    }

    billing.set({ updatedAt: new Date() });

    return billing.save();
  }

  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const prefix = `INV-${year}${month}-`;
    
    // Find the highest invoice number with this prefix
    const lastInvoice = await this.billingModel
      .findOne({ invoiceNumber: { $regex: `^${prefix}` } })
      .sort({ invoiceNumber: -1 })
      .select('invoiceNumber')
      .lean();
    
    let nextNumber = 1;
    if (lastInvoice?.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10);
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  /**
   * Map PlanType to BillingCycleDto
   */
  private mapBillingCycleToBillingCycleDto(planType: PlanType): BillingCycleDto {
    const mapping: Record<string, BillingCycleDto> = {
      'monthly': BillingCycleDto.MONTHLY,
      'quarterly': BillingCycleDto.QUARTERLY,
      'half_year': BillingCycleDto.HALF_YEAR,
      'yearly': BillingCycleDto.YEARLY,
    };
    
    return mapping[planType.toLowerCase()] || BillingCycleDto.MONTHLY;
  }
}