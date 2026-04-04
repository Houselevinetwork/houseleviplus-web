// src/user-and-monetization/billing/billing.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import type { InitiatePaymentDto } from '../pesapal/dto/initiate-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly billingService: BillingService) {}

  /** Initiate subscription payment */
  @Post('initiate-payment')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    try {
      this.logger.log(`💳 Initiating payment for user ${dto.userId}`);
      const result = await this.billingService.initiatePayment(dto);
      return { success: true, message: 'Payment initiated successfully', data: result };
    } catch (error: any) {
      this.logger.error(`❌ Error initiating payment: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Verify payment status - Called by frontend after user returns from Pesapal */
  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Body() body: { 
      orderTrackingId?: string; 
      merchantReference?: string;
      OrderTrackingId?: string;
      OrderMerchantReference?: string;
    },
    @Req() req: any
  ) {
    try {
      const trackingId = body.orderTrackingId || body.OrderTrackingId;
      const merchantRef = body.merchantReference || body.OrderMerchantReference;
      
      if (!trackingId) {
        throw new HttpException('Order tracking ID is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`🔍 Verifying payment for order: ${trackingId}`);
      
      const result = await this.billingService.verifyPaymentStatus(
        trackingId,
        merchantRef,
        req.user?.id || req.user?._id
      );
      
      return {
        success: true,
        message: 'Payment verification complete',
        data: result
      };
    } catch (error: any) {
      this.logger.error(`❌ Payment verification failed: ${error.message}`);
      throw new HttpException(
        error.message, 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /** Handle Pesapal webhook callback */
  @Post('pesapal-webhook')
  async handlePesapalWebhook(@Body() webhookData: any) {
    try {
      this.logger.log(`🔔 Received PesaPal webhook: ${JSON.stringify(webhookData)}`);
      const result = await this.billingService.handlePaymentCallback(webhookData);
      return { success: true, message: 'Webhook processed', data: result };
    } catch (error: any) {
      this.logger.error(`❌ Webhook error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /** Get subscription status - Used by frontend to check if user has active subscription */
  @Get('subscription-status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@Req() req: any) {
    try {
      const userId = req.user?.id || req.user?._id;
      if (!userId) {
        throw new HttpException('User ID not found', HttpStatus.UNAUTHORIZED);
      }

      this.logger.log(`📊 Checking subscription status for user: ${userId}`);
      
      const status = await this.billingService.getSubscriptionStatus(userId);
      
      return {
        success: true,
        message: 'Subscription status retrieved',
        data: status
      };
    } catch (error: any) {
      this.logger.error(`❌ Error checking subscription status: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /** Create a billing record manually */
  @Post()
  async createBilling(@Body() dto: CreateBillingDto) {
    try {
      this.logger.log(`➡️ Creating billing record for user ${dto.userId}`);
      const billing = await this.billingService.createBilling(dto);
      return { success: true, message: 'Billing record created successfully', billing };
    } catch (error: any) {
      this.logger.error(`❌ Error creating billing record: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Get billing by ID */
  @Get(':billingId')
  async getBillingById(@Param('billingId') billingId: string) {
    try {
      if (!Types.ObjectId.isValid(billingId)) {
        throw new HttpException('Invalid billing ID', HttpStatus.BAD_REQUEST);
      }
      const billing = await this.billingService.getBillingById(billingId);
      return { success: true, message: 'Billing record retrieved', billing };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching billing: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Get billing by invoice number */
  @Get('invoice/:invoiceNumber')
  async getBillingByInvoice(@Param('invoiceNumber') invoiceNumber: string) {
    try {
      const billing = await this.billingService.getBillingByInvoiceNumber(invoiceNumber);
      return { success: true, message: 'Invoice retrieved successfully', billing };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching invoice: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Get user billing history */
  @Get('user/:userId')
  async getUserBillingHistory(@Param('userId') userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
      }
      const history = await this.billingService.getAllBillingsByUser(userId);
      return { success: true, message: 'Billing history retrieved', count: history.length, history };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching billing history: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Get billing statistics */
  @Get('stats/overview')
  async getBillingStats(@Query('userId') userId: string) {
    try {
      if (!userId) throw new HttpException('UserId query parameter is required', HttpStatus.BAD_REQUEST);
      const stats = await this.billingService.getBillingStats(userId);
      return { success: true, message: 'Billing stats retrieved', stats };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching billing stats: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Update billing */
  @Put(':billingId')
  async updateBilling(@Param('billingId') billingId: string, @Body() dto: UpdateBillingDto) {
    try {
      if (!Types.ObjectId.isValid(billingId)) {
        throw new HttpException('Invalid billing ID', HttpStatus.BAD_REQUEST);
      }
      const billing = await this.billingService.updateBilling(billingId, dto);
      return { success: true, message: 'Billing record updated', billing };
    } catch (error: any) {
      this.logger.error(`❌ Error updating billing: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Cancel billing (soft delete) */
  @Delete(':billingId')
  async cancelBilling(@Param('billingId') billingId: string) {
    try {
      if (!Types.ObjectId.isValid(billingId)) {
        throw new HttpException('Invalid billing ID', HttpStatus.BAD_REQUEST);
      }
      const billing = await this.billingService.cancelBilling(billingId);
      return { success: true, message: 'Billing record cancelled', billing };
    } catch (error: any) {
      this.logger.error(`❌ Error cancelling billing: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}