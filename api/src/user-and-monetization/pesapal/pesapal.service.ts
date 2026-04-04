// src/user-and-monetization/pesapal/pesapal.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOrderDto } from './dto/pesapal.dto';
import { PesapalOrder } from './pesapal.schema';
import { IPesapalAuthToken } from './pesapal.interface';

@Injectable()
export class PesapalService {
  private readonly logger = new Logger(PesapalService.name);
  private pesapalAuthToken: IPesapalAuthToken | null = null;
  private ipnId = '';

  private readonly PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
  private readonly PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
  private readonly PESAPAL_BASE_URL = process.env.PESAPAL_API_URL || 'https://pay.pesapal.com/v3/api';

  constructor(
    @InjectModel(PesapalOrder.name) private readonly pesapalOrderModel: Model<PesapalOrder>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.validateCredentials();
  }

  private validateCredentials(): void {
    if (!this.PESAPAL_CONSUMER_KEY) throw new Error('PESAPAL_CONSUMER_KEY not configured');
    if (!this.PESAPAL_CONSUMER_SECRET) throw new Error('PESAPAL_CONSUMER_SECRET not configured');
    
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      this.logger.warn('⚠️ PESAPAL_CALLBACK_URL not set — IPN may fail.');
    } else {
      this.logger.log(`✅ Pesapal credentials validated successfully`);
      this.logger.log(`✅ Base URL: ${this.PESAPAL_BASE_URL}`);
      this.logger.log(`✅ Webhook URL: ${webhookUrl}`);
    }
  }

  /**
   * Get the correct webhook URL based on environment
   * This is the BACKEND endpoint that receives Pesapal IPN notifications
   */
  private getWebhookUrl(): string {
    const env = process.env.NODE_ENV;
    
    // Try environment-specific variable first
    if (env === 'production') {
      const prodUrl = process.env.PESAPAL_CALLBACK_URL || 
                      process.env.PESAPAL_CALLBACK_URL_PROD ||
                      process.env.BACKEND_URL + '/billing/pesapal-webhook';
      this.logger.log(`🌍 Using PRODUCTION webhook: ${prodUrl}`);
      return prodUrl;
    }
    
    if (env === 'ngrok') {
      const ngrokUrl = process.env.PESAPAL_CALLBACK_URL_NGROK ||
                       process.env.BACKEND_URL_NGROK + '/billing/pesapal-webhook';
      this.logger.log(`🔧 Using NGROK webhook: ${ngrokUrl}`);
      return ngrokUrl;
    }
    
    // Development fallback
    const devUrl = process.env.PESAPAL_CALLBACK_URL_DEV ||
                   'http://localhost:4000/billing/pesapal-webhook';
    this.logger.log(`💻 Using DEVELOPMENT webhook: ${devUrl}`);
    return devUrl;
  }

  /**
   * Get the frontend callback URL for redirecting users after payment
   * This is where the USER goes after completing payment
   */
  private getFrontendCallbackUrl(): string {
    const env = process.env.NODE_ENV;
    
    if (env === 'production') {
      return process.env.FRONTEND_URL + '/payment/callback' || 
             'https://www.reelafrika.co.ke/payment/callback';
    }
    
    if (env === 'ngrok') {
      return process.env.FRONTEND_URL || 'http://localhost:5173/payment/callback';
    }
    
    return 'http://localhost:5173/payment/callback';
  }

  // -----------------------------
  //   AUTH TOKEN MANAGEMENT
  // -----------------------------
  private async getAuthToken(forceRefresh = false): Promise<string> {
    const shouldRefresh =
      forceRefresh ||
      !this.pesapalAuthToken ||
      !this.pesapalAuthToken.expiresAt ||
      this.pesapalAuthToken.expiresAt <= Date.now();

    if (!shouldRefresh) return this.pesapalAuthToken!.token;

    try {
      const response = await axios.post(
        `${this.PESAPAL_BASE_URL}/Auth/RequestToken`,
        {
          consumer_key: this.PESAPAL_CONSUMER_KEY,
          consumer_secret: this.PESAPAL_CONSUMER_SECRET,
        },
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, timeout: 30000 },
      );

      const token = response?.data?.token;
      if (!token) throw new Error('Invalid Pesapal auth response');

      const expiresIn = response.data?.expiresIn || 240;
      this.pesapalAuthToken = { token, expiresIn, expiresAt: Date.now() + expiresIn * 1000 };

      return token;
    } catch (err: any) {
      throw new HttpException(
        `Failed to authenticate with Pesapal: ${err.response?.data?.message || err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // -----------------------------
  //   GENERIC AUTH REQUEST
  // -----------------------------
  private async makeAuthenticatedRequest<T = any>(
    url: string,
    data: any,
    method: 'GET' | 'POST' = 'POST',
    retryCount = 0,
  ): Promise<T> {
    try {
      const token = await this.getAuthToken();
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 30000 };
      const response = method === 'POST' ? await axios.post(url, data, config) : await axios.get(url, config);
      return response.data as T;
    } catch (error: any) {
      if (error.response?.status === 401 && retryCount === 0) {
        await this.getAuthToken(true);
        return this.makeAuthenticatedRequest<T>(url, data, method, retryCount + 1);
      }
      throw error;
    }
  }

  // -----------------------------
  //   IPN REGISTRATION
  // -----------------------------
  private async ensureIPNRegistered(): Promise<string> {
    if (this.ipnId) return this.ipnId;
    
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      throw new HttpException('PESAPAL_CALLBACK_URL not configured', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`📝 Registering IPN with URL: ${webhookUrl}`);

    const response = await this.makeAuthenticatedRequest(`${this.PESAPAL_BASE_URL}/URLSetup/RegisterIPN`, {
      url: webhookUrl,
      ipn_notification_type: 'POST',
    });

    const ipnId: string | undefined = response?.ipn_id;
    if (!ipnId) throw new Error('Failed to register IPN — no IPN ID returned.');
    this.ipnId = ipnId;
    this.logger.log(`✅ IPN registered: ${ipnId} for URL: ${webhookUrl}`);
    return ipnId;
  }

  // -----------------------------
  //   SUBMIT ORDER (Used by BillingService)
  // -----------------------------
  async submitOrder(orderData: {
    id: string;
    currency: string;
    amount: number;
    description?: string;
    callback_url?: string;
    notification_id?: string;
    billing_address: {
      email_address: string;
      phone_number: string;
      first_name: string;
      last_name: string;
    };
    planType: string;
  }): Promise<any> {
    this.logger.log(`📤 Submitting order to Pesapal: ${orderData.id}`);

    // Ensure IPN is registered and get ID
    const ipnId = orderData.notification_id || process.env.PESAPAL_IPN_ID || await this.ensureIPNRegistered();
    
    // CRITICAL: Use the BACKEND webhook URL, not frontend callback URL
    // This is where Pesapal sends the IPN notification
    const webhookUrl = this.getWebhookUrl();
    
    // IMPORTANT: callback_url in orderData should be the FRONTEND redirect URL
    // This is where the USER is redirected after payment
    const userRedirectUrl = orderData.callback_url || this.getFrontendCallbackUrl();

    this.logger.log(`🔗 Backend Webhook URL: ${webhookUrl}`);
    this.logger.log(`🔗 Frontend Redirect URL: ${userRedirectUrl}`);

    const orderPayload = {
      id: orderData.id,
      currency: orderData.currency,
      amount: orderData.amount,
      description: orderData.description || `Payment for ${orderData.planType}`,
      notification_id: ipnId,
      callback_url: userRedirectUrl, // Where user goes after payment
      billing_address: {
        email_address: orderData.billing_address.email_address,
        phone_number: orderData.billing_address.phone_number,
        country_code: 'KE',
        first_name: orderData.billing_address.first_name,
        last_name: orderData.billing_address.last_name,
        line_1: 'Nairobi',
      },
    };

    this.logger.log(`📦 Order Payload: ${JSON.stringify(orderPayload)}`);

    try {
      const pesapalResponse = await this.makeAuthenticatedRequest(
        `${this.PESAPAL_BASE_URL}/Transactions/SubmitOrderRequest`,
        orderPayload
      );

      this.logger.log(`📥 Pesapal Full Response: ${JSON.stringify(pesapalResponse)}`);

      const trackingId = pesapalResponse?.order_tracking_id || pesapalResponse?.order_id;
      const redirectUrl = pesapalResponse?.redirect_url;
      
      if (!trackingId || !redirectUrl) {
        this.logger.error(`❌ Invalid Pesapal response - Missing tracking ID or redirect URL`);
        this.logger.error(`Response keys: ${Object.keys(pesapalResponse || {}).join(', ')}`);
        
        // Check if there's an error in the response
        if (pesapalResponse?.error) {
          this.logger.error(`Pesapal Error: ${JSON.stringify(pesapalResponse.error)}`);
          throw new Error(`Pesapal Error: ${pesapalResponse.error.message || JSON.stringify(pesapalResponse.error)}`);
        }
        
        throw new Error(`Pesapal did not return order tracking ID or redirect URL. Response: ${JSON.stringify(pesapalResponse)}`);
      }

      this.logger.log(`✅ Pesapal order submitted successfully: ${trackingId}`);
      this.logger.log(`🎯 IPN notifications will be sent to: ${webhookUrl}`);
      
      return {
        order_tracking_id: trackingId,
        orderTrackingId: trackingId,
        redirect_url: redirectUrl,
        redirectUrl: redirectUrl,
      };
    } catch (error: any) {
      this.logger.error(`❌ Pesapal API Error: ${error.message}`);
      
      if (error.response) {
        this.logger.error(`Response Status: ${error.response.status}`);
        this.logger.error(`Response Data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  }

  // -----------------------------
  //   CREATE PESAPAL ORDER (Alternative method)
  // -----------------------------
  async createOrder(dto: CreateOrderDto): Promise<any> {
    if (!dto.userId || !dto.email || !dto.phoneNumber || !dto.amount)
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);

    const order = await this.pesapalOrderModel.create({
      userId: new Types.ObjectId(dto.userId),
      planType: dto.planType,
      amount: dto.amount,
      customerEmail: dto.email,
      customerPhone: dto.phoneNumber,
      customerFirstName: dto.firstName,
      customerLastName: dto.lastName,
      orderStatus: 'PENDING',
    });

    const ipnId = process.env.PESAPAL_IPN_ID || await this.ensureIPNRegistered();
    const merchantReference = `SUB_${order._id.toString()}`;

    // Use frontend callback for user redirect
    const userRedirectUrl = dto.callbackUrl ?? this.getFrontendCallbackUrl();

    const orderPayload = {
      id: merchantReference,
      currency: 'KES',
      amount: dto.amount,
      description: dto.description ?? `${dto.planType} subscription`,
      notification_id: ipnId,
      callback_url: userRedirectUrl, // Frontend URL for user redirect
      billing_address: {
        email_address: dto.email,
        phone_number: dto.phoneNumber,
        country_code: 'KE',
        first_name: dto.firstName,
        last_name: dto.lastName,
        line_1: 'Nairobi',
      },
    };

    this.logger.log(`📦 Creating order with payload: ${JSON.stringify(orderPayload)}`);

    const pesapalResponse = await this.makeAuthenticatedRequest(`${this.PESAPAL_BASE_URL}/Transactions/SubmitOrderRequest`, orderPayload);

    const trackingId = pesapalResponse?.order_tracking_id || pesapalResponse?.order_id;
    const redirectUrl = pesapalResponse?.redirect_url;
    if (!trackingId || !redirectUrl) throw new Error('Pesapal did not return order tracking ID or redirect URL');

    order.pesapalOrderTrackingId = trackingId;
    order.pesapalOrderMerchantRef = merchantReference;
    await order.save();

    this.logger.log(`✅ Pesapal order created: ${order._id}`);
    return { success: true, redirectUrl, trackingId, merchantReference, orderId: order._id };
  }

  // -----------------------------
  //   GET TRANSACTION STATUS
  // -----------------------------
  async getTransactionStatus(orderTrackingId: string): Promise<any> {
    this.logger.log(`🔍 Checking transaction status for: ${orderTrackingId}`);
    return this.makeAuthenticatedRequest(
      `${this.PESAPAL_BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      {},
      'GET',
    );
  }

  // -----------------------------
  //   HANDLE PAYMENT CALLBACK
  // -----------------------------
  async handlePaymentCallback(orderTrackingId: string, orderMerchantReference?: string): Promise<any> {
    this.logger.log(`📞 Handling payment callback for tracking ID: ${orderTrackingId}`);
    
    const statusResponse = await this.getTransactionStatus(orderTrackingId);
    const paymentStatus: string = statusResponse?.payment_status_description || statusResponse?.status || '';

    this.logger.log(`💳 Payment status from Pesapal: ${paymentStatus}`);

    const order = await this.pesapalOrderModel.findOne({
      $or: [
        { pesapalOrderTrackingId: orderTrackingId },
        { pesapalOrderMerchantRef: orderMerchantReference },
      ],
    });

    if (!order) {
      this.logger.error(`❌ Order not found for tracking ID: ${orderTrackingId}`);
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    const isCompleted = /completed|success/i.test(paymentStatus);
    const isFailed = /failed|cancelled/i.test(paymentStatus);

    if (isCompleted && order.orderStatus !== 'COMPLETED') {
      order.orderStatus = 'COMPLETED';
      await order.save();
      this.eventEmitter.emit('payment.completed', { 
        ...order.toObject(), 
        trackingId: orderTrackingId, 
        merchantReference: orderMerchantReference 
      });
      this.logger.log(`✅ Payment completed for order: ${order._id}, User: ${order.userId}`);
      return { success: true, status: 'completed', order: order.toObject() };
    }

    if (isFailed) {
      order.orderStatus = 'FAILED';
      await order.save();
      this.eventEmitter.emit('payment.failed', { 
        orderId: order._id.toString(), 
        userId: order.userId, 
        trackingId: orderTrackingId 
      });
      this.logger.warn(`⚠️ Payment failed for order: ${order._id}`);
      return { success: false, status: 'failed', message: 'Payment failed' };
    }

    order.orderStatus = 'PENDING';
    await order.save();
    this.logger.log(`⏳ Payment still pending for order: ${order._id}`);
    return { success: false, status: 'pending', message: 'Payment is still pending' };
  }

  // -----------------------------
  //   GET SUBSCRIPTION STATUS
  // -----------------------------
  async getSubscriptionStatus(userId: string) {
    const latestOrder = await this.pesapalOrderModel.findOne({ userId }).sort({ createdAt: -1 }).exec();
    if (!latestOrder) return { status: 'no_subscription', isActive: false };

    const isActive = latestOrder.orderStatus === 'COMPLETED';
    return { status: isActive ? 'active' : 'inactive', isActive, order: latestOrder.toObject() };
  }

  // -----------------------------
  //   ORDER QUERIES
  // -----------------------------
  async getUserOrders(userId: string) {
    return this.pesapalOrderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async getOrderById(orderId: string) {
    const order = await this.pesapalOrderModel.findById(orderId).exec();
    if (!order) throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    return order;
  }
}