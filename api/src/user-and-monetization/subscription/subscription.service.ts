import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from './schemas/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto, ActivateSubscriptionDto } from './dto/update-subscription.dto';
import { CancelSubscriptionDto } from './dto/subscription.dto';
import { ISubscriptionResponse, ISubscriptionCheck } from './interfaces/subscription.interface';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  // ============================================
  //  PLANS
  // ============================================
  async getAvailablePlans(ipAddress?: string) {
    const geo = await this.detectCurrency(ipAddress);

    const plans = [
      {
        id: 'mobile_plan',
        planName: 'Mobile',
        planType: 'monthly',
        kesAmount: 5,
        devices: 1,
        quality: '480p',
        resolution: '480p',
        badge: null,
        isPopular: false,
        isActive: true,
        color: '#4169E1',
        ctaText: 'Get Mobile',
        features: [
          'All series and movies',
          'Mobile phone & tablet only',
          '480p video quality',
          '1 screen at a time',
          'Download for offline viewing',
          'Cancel anytime',
        ],
      },
      {
        id: 'basic_plan',
        planName: 'Basic',
        planType: 'monthly',
        kesAmount: 399,
        devices: 1,
        quality: '720p HD',
        resolution: '720p',
        badge: null,
        isPopular: false,
        isActive: true,
        color: '#2196F3',
        ctaText: 'Get Basic',
        features: [
          'All series and movies',
          'TV, computer, phone & tablet',
          '720p HD video quality',
          '1 screen at a time',
          'Download for offline viewing',
          'Cancel anytime',
        ],
      },
      {
        id: 'standard_plan',
        planName: 'Standard',
        planType: 'monthly',
        kesAmount: 499,
        devices: 2,
        quality: '1080p Full HD',
        resolution: '1080p',
        badge: 'Most Popular',
        isPopular: true,
        isActive: true,
        color: '#9C27B0',
        ctaText: 'Get Standard',
        features: [
          'All series and movies',
          'TV, computer, phone & tablet',
          '1080p Full HD video quality',
          '2 screens at a time',
          'Download for offline viewing',
          'Early access to new releases',
          'Cancel anytime',
        ],
      },
      {
        id: 'premium_vip_plan',
        planName: 'Premium VIP',
        planType: 'monthly',
        kesAmount: 700,
        devices: 4,
        quality: '4K Ultra HD + HDR',
        resolution: '4K',
        badge: 'Best Value',
        isPopular: false,
        isActive: true,
        color: '#FF6B35',
        ctaText: 'Get Premium VIP',
        features: [
          'All series and movies',
          'TV, computer, phone & tablet',
          '4K Ultra HD + HDR quality',
          'Immersive spatial audio',
          '4 screens at a time',
          'Download on 6 devices',
          'Exclusive VIP event invitations',
          'Merchandise discounts',
          'Producer credits on select content',
          'Priority customer support',
        ],
      },
    ];

    return plans
      .filter(p => p.isActive)
      .map(p => ({
        ...p,
        amount: this.convertPrice(p.kesAmount, geo.rate),
        currency: geo.currency,
        currencySymbol: geo.symbol,
        displayPrice: `${geo.symbol}${this.convertPrice(p.kesAmount, geo.rate).toLocaleString()}`,
        description: 'per month',
        country: geo.country,
      }));
  }

  // ============================================
  //  GEO DETECTION
  // ============================================
  private async detectCurrency(ipAddress?: string) {
    const defaultGeo = { currency: 'KES', symbol: 'KES ', rate: 1, country: 'Kenya' };

    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1') {
      return defaultGeo;
    }

    try {
      const res = await fetch(`http://ip-api.com/json/${ipAddress}?fields=countryCode`);
      const data = await res.json();

      const map: Record<string, typeof defaultGeo> = {
        KE: { currency: 'KES', symbol: 'KES ', rate: 1,      country: 'Kenya' },
        US: { currency: 'USD', symbol: '$',    rate: 0.0077,  country: 'United States' },
        GB: { currency: 'GBP', symbol: '£',    rate: 0.0061,  country: 'United Kingdom' },
        NG: { currency: 'NGN', symbol: '₦',    rate: 12.5,    country: 'Nigeria' },
        TZ: { currency: 'TZS', symbol: 'TZS ', rate: 20.0,    country: 'Tanzania' },
        UG: { currency: 'UGX', symbol: 'UGX ', rate: 28.5,    country: 'Uganda' },
        ZA: { currency: 'ZAR', symbol: 'R',    rate: 0.14,    country: 'South Africa' },
        RW: { currency: 'RWF', symbol: 'RWF ', rate: 10.5,    country: 'Rwanda' },
        GH: { currency: 'GHS', symbol: 'GH₵',  rate: 0.11,    country: 'Ghana' },
        ET: { currency: 'ETB', symbol: 'ETB ', rate: 0.43,    country: 'Ethiopia' },
        DE: { currency: 'EUR', symbol: '€',    rate: 0.0071,  country: 'Germany' },
        FR: { currency: 'EUR', symbol: '€',    rate: 0.0071,  country: 'France' },
        CA: { currency: 'CAD', symbol: 'CA$',  rate: 0.011,   country: 'Canada' },
        AU: { currency: 'AUD', symbol: 'A$',   rate: 0.012,   country: 'Australia' },
      };

      return map[data.countryCode] || defaultGeo;
    } catch (error) {
      this.logger.warn(`Geo detection failed: ${error.message}`);
      return defaultGeo;
    }
  }

  private convertPrice(kes: number, rate: number): number {
    const v = kes * rate;
    if (v < 10)  return Math.round(v * 100) / 100;
    if (v < 100) return Math.round(v * 10) / 10;
    return Math.round(v);
  }

  // ============================================
  //  CREATE
  // ============================================
  async create(createDto: CreateSubscriptionDto, planDetails: any): Promise<Subscription> {
    this.logger.log(`Creating subscription for user: ${createDto.userId}`);

    if (!Types.ObjectId.isValid(createDto.userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, planDetails.planType);

    const subscription = new this.subscriptionModel({
      userId: new Types.ObjectId(createDto.userId),
      planId: createDto.planId,
      planName: planDetails.planName,
      billingCycle: planDetails.planType,
      amount: planDetails.amount,
      currency: planDetails.currency || 'KES',
      status: SubscriptionStatus.PENDING,
      startDate,
      endDate,
      transactionId: createDto.transactionId ? new Types.ObjectId(createDto.transactionId) : undefined,
      paymentReference: createDto.paymentReference,
      autoRenew: createDto.autoRenew ?? true,
      metadata: createDto.metadata,
      statusHistory: [{
        date: new Date(),
        status: SubscriptionStatus.PENDING,
        reason: 'Subscription created, awaiting payment',
      }],
    });

    const saved = await subscription.save();
    this.logger.log(`Subscription created (pending): ${saved._id}`);
    return saved;
  }

  // ============================================
  //  ACTIVATE
  // ============================================
  async activate(activateDto: ActivateSubscriptionDto): Promise<Subscription> {
    if (!Types.ObjectId.isValid(activateDto.subscriptionId)) {
      throw new BadRequestException('Invalid subscription ID format');
    }

    const subscription = await this.subscriptionModel.findById(activateDto.subscriptionId);
    if (!subscription) throw new NotFoundException('Subscription not found');

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      return subscription;
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.startDate = new Date();
    subscription.endDate = this.calculateEndDate(subscription.startDate, subscription.billingCycle);
    subscription.nextBillingDate = subscription.autoRenew ? subscription.endDate : undefined;

    if (activateDto.transactionId) {
      if (!Types.ObjectId.isValid(activateDto.transactionId)) {
        throw new BadRequestException('Invalid transaction ID format');
      }
      subscription.transactionId = new Types.ObjectId(activateDto.transactionId);
    }
    if (activateDto.paymentReference) {
      subscription.paymentReference = activateDto.paymentReference;
    }

    subscription.statusHistory.push({
      date: new Date(),
      status: SubscriptionStatus.ACTIVE,
      reason: 'Payment confirmed',
    });

    const activated = await subscription.save();
    this.logger.log(`Subscription activated: ${activated._id}`);
    return activated;
  }

  async activateSubscription(subscriptionId: string): Promise<Subscription> {
    return this.activate({ subscriptionId });
  }

  // ============================================
  //  READ
  // ============================================
  async checkSubscription(userId: string): Promise<ISubscriptionCheck> {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID format');

    const subscription = await this.findActiveByUserId(userId);
    if (!subscription) return { hasActiveSubscription: false, message: 'No active subscription found' };

    const isActive = subscription.endDate.getTime() > Date.now() && subscription.status === SubscriptionStatus.ACTIVE;
    return {
      hasActiveSubscription: isActive,
      subscription: subscription.toObject(),
      message: isActive ? 'Active subscription found' : 'Subscription expired',
    };
  }

  async getUserSubscription(userId: string): Promise<ISubscriptionResponse | null> {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID format');

    const subscription = await this.findActiveByUserId(userId);
    if (!subscription) return null;

    const daysRemaining = this.calculateDaysRemaining(subscription.endDate);
    const isActive = subscription.status === SubscriptionStatus.ACTIVE && daysRemaining > 0;
    return { subscription: subscription.toObject(), daysRemaining, isActive };
  }

  async findById(subscriptionId: string): Promise<Subscription> {
    if (!Types.ObjectId.isValid(subscriptionId)) throw new BadRequestException('Invalid subscription ID format');
    const subscription = await this.subscriptionModel.findById(subscriptionId).exec();
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionDocument | null> {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID format');
    return this.subscriptionModel.findOne({
      userId: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
      endDate: { $gt: new Date() },
    }).sort({ createdAt: -1 }).exec();
  }

  async findLatestByUserId(userId: string): Promise<SubscriptionDocument | null> {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID format');
    return this.subscriptionModel.findOne({
      userId: new Types.ObjectId(userId),
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
    }).sort({ createdAt: -1 }).exec();
  }

  async findAllByUserId(userId: string): Promise<Subscription[]> {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID format');
    return this.subscriptionModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  // ============================================
  //  CANCEL
  // ============================================
  async cancel(cancelDto: CancelSubscriptionDto, cancelledBy?: string): Promise<Subscription> {
    if (!Types.ObjectId.isValid(cancelDto.userId)) throw new BadRequestException('Invalid user ID format');

    const subscription = await this.findActiveByUserId(cancelDto.userId);
    if (!subscription) throw new NotFoundException('No active subscription found');

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.cancelledBy = cancelledBy ? new Types.ObjectId(cancelledBy) : subscription.userId;
    subscription.cancellationReason = cancelDto.reason;
    subscription.autoRenew = false;
    subscription.statusHistory.push({
      date: new Date(),
      status: SubscriptionStatus.CANCELLED,
      reason: cancelDto.reason || 'User requested cancellation',
    });

    return subscription.save();
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    if (!Types.ObjectId.isValid(subscriptionId)) throw new BadRequestException('Invalid subscription ID format');

    const subscription = await this.subscriptionModel.findById(subscriptionId);
    if (!subscription) throw new NotFoundException('Subscription not found');

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;
    subscription.statusHistory.push({
      date: new Date(),
      status: SubscriptionStatus.CANCELLED,
      reason: 'Cancelled for plan change',
    });

    return subscription.save();
  }

  // ============================================
  //  UPDATE
  // ============================================
  async update(subscriptionId: string, updateDto: UpdateSubscriptionDto): Promise<Subscription> {
    if (!Types.ObjectId.isValid(subscriptionId)) throw new BadRequestException('Invalid subscription ID format');

    const subscription = await this.subscriptionModel.findById(subscriptionId);
    if (!subscription) throw new NotFoundException('Subscription not found');

    Object.assign(subscription, updateDto);

    if (updateDto.status && updateDto.status !== subscription.status) {
      subscription.statusHistory.push({
        date: new Date(),
        status: updateDto.status,
        reason: 'Status updated via API',
      });
    }

    return subscription.save();
  }

  // ============================================
  //  EXPIRE
  // ============================================
  async expireSubscriptions(): Promise<number> {
    const result = await this.subscriptionModel.updateMany(
      { status: SubscriptionStatus.ACTIVE, endDate: { $lt: new Date() } },
      {
        $set: { status: SubscriptionStatus.EXPIRED },
        $push: { statusHistory: { date: new Date(), status: SubscriptionStatus.EXPIRED, reason: 'Subscription period ended' } },
      },
    );
    this.logger.log(`Expired ${result.modifiedCount} subscriptions`);
    return result.modifiedCount;
  }

  // ============================================
  //  HELPERS
  // ============================================
  private calculateEndDate(startDate: Date, billingCycle: string): Date {
    const date = new Date(startDate);
    switch (billingCycle) {
      case 'monthly':    date.setMonth(date.getMonth() + 1);      break;
      case 'quarterly':  date.setMonth(date.getMonth() + 3);      break;
      case 'half_year':  date.setMonth(date.getMonth() + 6);      break;
      case 'yearly':     date.setFullYear(date.getFullYear() + 1); break;
      default: throw new BadRequestException('Invalid billing cycle');
    }
    return date;
  }

  private calculateDaysRemaining(endDate: Date): number {
    return Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}