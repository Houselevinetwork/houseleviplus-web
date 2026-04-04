// api/src/user-and-monetization/billing/recurring-payment.service.ts
// Handles: auto-renewal for cards, reminder notifications for M-Pesa,
// grace period management, and subscription expiry enforcement.

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Billing, BillingDocument, BillingStatus } from './schemas/billing.schema';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from '../subscription/schemas/subscription.schema';
import { BillingService } from './billing.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PlanType } from '../pesapal/dto/create-order.dto';

// How many days before expiry to send each reminder
const REMINDER_DAYS = [3, 1];
// Grace period in days after expiry before account is fully paused
const GRACE_PERIOD_DAYS = 3;

@Injectable()
export class RecurringPaymentService {
  private readonly logger = new Logger(RecurringPaymentService.name);

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Billing.name)
    private readonly billingModel: Model<BillingDocument>,
    private readonly billingService: BillingService,
    private readonly mailerService: MailerService,
  ) {}

  // ─── RUNS DAILY AT 07:00 EAT ─────────────────────────────────
  @Cron('0 4 * * *') // 04:00 UTC = 07:00 EAT
  async runDailyRenewalJobs() {
    this.logger.log('⏰ Running daily renewal jobs');
    await Promise.all([
      this.sendRenewalReminders(),
      this.expireSubscriptions(),
      this.enforceGracePeriod(),
    ]);
  }

  // ─── SEND RENEWAL REMINDERS ───────────────────────────────────
  // Fires for subscriptions expiring in exactly REMINDER_DAYS days.
  // Only relevant for M-Pesa users (cards auto-renew via Pesapal).
  async sendRenewalReminders() {
    this.logger.log('📧 Checking for upcoming renewals to remind...');

    for (const daysAhead of REMINDER_DAYS) {
      const targetDate = this.getDateOffsetDays(daysAhead);
      const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
      const dayEnd   = new Date(targetDate.setHours(23, 59, 59, 999));

      const subscriptions = await this.subscriptionModel
        .find({
          status: SubscriptionStatus.ACTIVE,
          autoRenew: false, // M-Pesa users have autoRenew: false
          endDate: { $gte: dayStart, $lte: dayEnd },
        })
        .populate('userId')
        .exec();

      this.logger.log(`📬 Found ${subscriptions.length} subscriptions expiring in ${daysAhead} day(s)`);

      for (const sub of subscriptions) {
        await this.sendReminderEmail(sub, daysAhead);
      }
    }
  }

  // ─── EXPIRE SUBSCRIPTIONS ─────────────────────────────────────
  // Marks subscriptions past endDate as EXPIRED (starts grace period clock).
  async expireSubscriptions() {
    const now = new Date();
    const result = await this.subscriptionModel.updateMany(
      {
        status: SubscriptionStatus.ACTIVE,
        endDate: { $lt: now },
      },
      {
        $set: { status: SubscriptionStatus.EXPIRED },
        $push: {
          statusHistory: {
            date: now,
            status: SubscriptionStatus.EXPIRED,
            reason: 'Subscription period ended — grace period started',
          },
        },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`🔴 Expired ${result.modifiedCount} subscription(s)`);
    }
  }

  // ─── ENFORCE GRACE PERIOD ─────────────────────────────────────
  // After GRACE_PERIOD_DAYS from expiry, fully suspend account access.
  async enforceGracePeriod() {
    const graceExpiry = this.getDateOffsetDays(-GRACE_PERIOD_DAYS); // 3 days ago

    const subscriptions = await this.subscriptionModel
      .find({
        status: SubscriptionStatus.EXPIRED,
        endDate: { $lt: graceExpiry },
      })
      .populate('userId')
      .exec();

    for (const sub of subscriptions) {
      sub.status = SubscriptionStatus.SUSPENDED;
      sub.statusHistory.push({
        date: new Date(),
        status: 'suspended' as any,
        reason: `Grace period of ${GRACE_PERIOD_DAYS} days elapsed without renewal`,
      });
      await sub.save();
      await this.sendGraceExpiredEmail(sub);
      this.logger.log(`🔒 Suspended account for subscription: ${sub._id}`);
    }
  }

  // ─── AUTO-RENEW CARD SUBSCRIPTIONS ───────────────────────────
  // Runs daily — attempts Pesapal charge for card subscriptions due today.
  @Cron('0 5 * * *') // 05:00 UTC = 08:00 EAT
  async autoRenewCardSubscriptions() {
    this.logger.log('💳 Running auto-renewal for card subscriptions...');

    const tomorrow = this.getDateOffsetDays(1);
    const dayStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const dayEnd   = new Date(tomorrow.setHours(23, 59, 59, 999));

    const subscriptions = await this.subscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        autoRenew: true, // Card users
        nextBillingDate: { $gte: dayStart, $lte: dayEnd },
      })
      .populate('userId')
      .exec();

    this.logger.log(`💳 ${subscriptions.length} card subscription(s) due for renewal tomorrow`);

    for (const sub of subscriptions) {
      await this.attemptAutoRenewal(sub);
    }
  }

  // ─── ATTEMPT AUTO-RENEWAL ─────────────────────────────────────
  private async attemptAutoRenewal(subscription: SubscriptionDocument) {
    try {
      const user = subscription.userId as any;
      if (!user?.email) return;

      this.logger.log(`🔄 Attempting auto-renewal for subscription: ${subscription._id}`);

      // Get the latest billing record for this subscription to get plan details
      const lastBilling = await this.billingModel
        .findOne({ subscriptionId: subscription._id })
        .sort({ createdAt: -1 })
        .exec();

      if (!lastBilling) {
        this.logger.warn(`⚠️ No billing record found for subscription: ${subscription._id}`);
        return;
      }

      // Initiate new payment — billing service creates new billing + Pesapal order
      // For card auto-renewal, Pesapal charges the stored token
      const result = await this.billingService.initiatePayment({
        userId:       user._id.toString(),
        planId:       subscription.planId,
        planName:     subscription.planName,
        billingCycle: (subscription.billingCycle || 'monthly') as PlanType,
        amount:       lastBilling.amount,
        currency:     lastBilling.currency || 'KES',
        description:  `Auto-renewal: House Levi+ ${subscription.planName}`,
        email:        user.email,
        phoneNumber:  user.phoneNumber || '',
        firstName:    user.firstName   || '',
        lastName:     user.lastName    || '',
      });

      this.logger.log(`✅ Auto-renewal initiated: ${result.transactionId}`);
    } catch (err: any) {
      this.logger.error(`❌ Auto-renewal failed for ${subscription._id}: ${err.message}`);
      await this.sendRenewalFailedEmail(subscription);
    }
  }

  // ─── EMAILS ───────────────────────────────────────────────────
  private async sendReminderEmail(subscription: SubscriptionDocument, daysLeft: number) {
    const user = subscription.userId as any;
    if (!user?.email) return;

    const urgency = daysLeft === 1 ? 'Last chance' : `${daysLeft} days left`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `${urgency} — Renew your House Levi+ subscription`,
        html: this.buildReminderEmail({
          firstName: user.firstName || 'Subscriber',
          planName:  subscription.planName,
          endDate:   subscription.endDate,
          daysLeft,
          renewUrl:  `${process.env.FRONTEND_URL}/choose-plan`,
        }),
      });
      this.logger.log(`📧 Reminder sent to ${user.email} (${daysLeft}d remaining)`);
    } catch (err: any) {
      this.logger.error(`Failed to send reminder: ${err.message}`);
    }
  }

  private async sendGraceExpiredEmail(subscription: SubscriptionDocument) {
    const user = subscription.userId as any;
    if (!user?.email) return;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Your House Levi+ account has been paused',
        html: this.buildGraceExpiredEmail({
          firstName: user.firstName || 'Subscriber',
          planName:  subscription.planName,
          renewUrl:  `${process.env.FRONTEND_URL}/choose-plan`,
        }),
      });
    } catch (err: any) {
      this.logger.error(`Failed to send grace expired email: ${err.message}`);
    }
  }

  private async sendRenewalFailedEmail(subscription: SubscriptionDocument) {
    const user = subscription.userId as any;
    if (!user?.email) return;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Action required — House Levi+ renewal failed',
        html: this.buildRenewalFailedEmail({
          firstName: user.firstName || 'Subscriber',
          planName:  subscription.planName,
          renewUrl:  `${process.env.FRONTEND_URL}/choose-plan`,
        }),
      });
    } catch (err: any) {
      this.logger.error(`Failed to send renewal failed email: ${err.message}`);
    }
  }

  // ─── EMAIL TEMPLATES ──────────────────────────────────────────
  private buildReminderEmail(data: {
    firstName: string;
    planName: string;
    endDate: Date;
    daysLeft: number;
    renewUrl: string;
  }): string {
    const urgencyColor = data.daysLeft === 1 ? '#c62828' : '#b45309';
    const expiry = data.endDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"></head>
      <body style="background:#f7f7f5;font-family:-apple-system,sans-serif;padding:40px 20px;margin:0;">
        <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e8e8e6;border-radius:10px;overflow:hidden;">
          <div style="background:#0d0d0d;padding:24px 32px;">
            <p style="color:#fff;font-size:1.125rem;font-weight:300;letter-spacing:-0.02em;margin:0;">
              HOUSE LEVI<span style="color:#4169E1;">+</span>
            </p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:0.6875rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${urgencyColor};margin:0 0 12px;">
              Subscription Reminder
            </p>
            <h1 style="font-size:1.5rem;font-weight:300;letter-spacing:-0.025em;color:#0d0d0d;margin:0 0 16px;">
              Hi ${data.firstName}, your subscription expires in <strong>${data.daysLeft} day${data.daysLeft > 1 ? 's' : ''}</strong>.
            </h1>
            <p style="font-size:0.875rem;color:#888;line-height:1.6;margin:0 0 24px;">
              Your <strong style="color:#0d0d0d;">${data.planName} Plan</strong> expires on <strong style="color:#0d0d0d;">${expiry}</strong>.
              To continue enjoying uninterrupted access to all House Levi+ content, please renew before then.
            </p>
            <p style="font-size:0.8rem;color:#b45309;background:rgba(180,83,9,0.07);border:1px solid rgba(180,83,9,0.2);border-radius:6px;padding:12px 16px;margin:0 0 24px;">
              <strong>Note:</strong> M-Pesa does not support auto-renewal. Renewing now takes 2 minutes.
              Consider switching to a card for automatic renewals.
            </p>
            <a href="${data.renewUrl}" style="display:inline-block;background:#4169E1;color:#fff;padding:13px 28px;border-radius:7px;font-size:0.875rem;font-weight:600;text-decoration:none;letter-spacing:0.03em;">
              Renew Now →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #e8e8e6;">
            <p style="font-size:0.6875rem;color:#bbb;margin:0;line-height:1.6;">
              You're receiving this because your House Levi+ subscription is approaching its renewal date.
              To manage your subscription, visit Account Settings.
              Questions? Email <a href="mailto:support@houselevi.com" style="color:#4169E1;">support@houselevi.com</a>.
            </p>
          </div>
        </div>
      </body></html>`;
  }

  private buildGraceExpiredEmail(data: { firstName: string; planName: string; renewUrl: string }): string {
    return `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"></head>
      <body style="background:#f7f7f5;font-family:-apple-system,sans-serif;padding:40px 20px;margin:0;">
        <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e8e8e6;border-radius:10px;overflow:hidden;">
          <div style="background:#0d0d0d;padding:24px 32px;">
            <p style="color:#fff;font-size:1.125rem;font-weight:300;letter-spacing:-0.02em;margin:0;">
              HOUSE LEVI<span style="color:#4169E1;">+</span>
            </p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:0.6875rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c62828;margin:0 0 12px;">
              Account Paused
            </p>
            <h1 style="font-size:1.5rem;font-weight:300;letter-spacing:-0.025em;color:#0d0d0d;margin:0 0 16px;">
              Hi ${data.firstName}, your account has been paused.
            </h1>
            <p style="font-size:0.875rem;color:#888;line-height:1.6;margin:0 0 24px;">
              Your <strong style="color:#0d0d0d;">${data.planName} Plan</strong> has expired and the 3-day grace period has ended.
              Your account has been temporarily paused. Renew now to restore full access instantly.
            </p>
            <a href="${data.renewUrl}" style="display:inline-block;background:#4169E1;color:#fff;padding:13px 28px;border-radius:7px;font-size:0.875rem;font-weight:600;text-decoration:none;letter-spacing:0.03em;">
              Restore Access →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #e8e8e6;">
            <p style="font-size:0.6875rem;color:#bbb;margin:0;">
              Need help? <a href="mailto:support@houselevi.com" style="color:#4169E1;">support@houselevi.com</a>
            </p>
          </div>
        </div>
      </body></html>`;
  }

  private buildRenewalFailedEmail(data: { firstName: string; planName: string; renewUrl: string }): string {
    return `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"></head>
      <body style="background:#f7f7f5;font-family:-apple-system,sans-serif;padding:40px 20px;margin:0;">
        <div style="max-width:540px;margin:0 auto;background:#fff;border:1px solid #e8e8e6;border-radius:10px;overflow:hidden;">
          <div style="background:#0d0d0d;padding:24px 32px;">
            <p style="color:#fff;font-size:1.125rem;font-weight:300;letter-spacing:-0.02em;margin:0;">
              HOUSE LEVI<span style="color:#4169E1;">+</span>
            </p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:0.6875rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c62828;margin:0 0 12px;">
              Renewal Failed
            </p>
            <h1 style="font-size:1.5rem;font-weight:300;letter-spacing:-0.025em;color:#0d0d0d;margin:0 0 16px;">
              We couldn't renew your subscription.
            </h1>
            <p style="font-size:0.875rem;color:#888;line-height:1.6;margin:0 0 24px;">
              Hi ${data.firstName}, automatic renewal of your <strong style="color:#0d0d0d;">${data.planName} Plan</strong> failed.
              This may be due to insufficient funds or a card issue. Please update your payment method and renew manually.
            </p>
            <a href="${data.renewUrl}" style="display:inline-block;background:#4169E1;color:#fff;padding:13px 28px;border-radius:7px;font-size:0.875rem;font-weight:600;text-decoration:none;letter-spacing:0.03em;">
              Update & Renew →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #e8e8e6;">
            <p style="font-size:0.6875rem;color:#bbb;margin:0;">
              Need help? <a href="mailto:support@houselevi.com" style="color:#4169E1;">support@houselevi.com</a>
            </p>
          </div>
        </div>
      </body></html>`;
  }

  // ─── HELPERS ──────────────────────────────────────────────────
  private getDateOffsetDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }
}