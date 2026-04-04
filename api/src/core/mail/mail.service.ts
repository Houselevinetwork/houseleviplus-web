import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { LoggerService } from '@core/logger/logger.service';

/**
 * Mail Service
 * 
 * Sends emails in background using Bull queue
 * 
 * Netflix-Grade Features:
 * - Non-blocking (doesn't slow down API)
 * - Automatic retries (3 attempts)
 * - Email logging (DPA compliance)
 */
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectQueue('email') private emailQueue: Queue,
    private logger: LoggerService,
  ) {
    this.logger.setContext('MailService');
  }

  // ============================================
  // NETFLIX-GRADE: Email Verification
  // ============================================

  /**
   * Send welcome email with verification link
   * @param to - User email
   * @param firstName - User's first name
   * @param verificationToken - Verification token
   */
  async sendWelcomeEmail(
    to: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    await this.emailQueue.add('welcome', {
      to,
      firstName,
      verificationLink: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
    });

    this.logger.log(`Welcome email queued for ${to}`);
  }

  /**
   * Send email verification (resend)
   * @param to - User email
   * @param firstName - User's first name
   * @param verificationToken - Verification token
   */
  async sendVerificationEmail(
    to: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    await this.emailQueue.add('verify-email', {
      to,
      firstName,
      verificationLink: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
    });

    this.logger.log(`Verification email queued for ${to}`);
  }

  // ============================================
  // NETFLIX-GRADE: Password Reset
  // ============================================

  /**
   * Send password reset email
   * @param to - User email
   * @param firstName - User's first name
   * @param resetToken - Password reset token
   */
  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    await this.emailQueue.add('reset-password', {
      to,
      firstName,
      resetLink: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
    });

    this.logger.log(`Password reset email queued for ${to}`);
  }

  // ============================================
  // NETFLIX-GRADE: Payment & Subscription
  // ============================================

  /**
   * Send payment receipt
   * @param to - User email
   * @param firstName - User's first name
   * @param amount - Payment amount
   * @param plan - Subscription plan
   * @param transactionId - Payment transaction ID
   */
  async sendPaymentReceipt(
    to: string,
    firstName: string,
    amount: number,
    plan: string,
    transactionId: string,
  ): Promise<void> {
    await this.emailQueue.add('payment-receipt', {
      to,
      firstName,
      amount,
      plan,
      transactionId,
      date: new Date().toLocaleDateString('en-KE'),
    });

    this.logger.log(`Payment receipt queued for ${to}`);
  }

  /**
   * Send subscription renewal reminder
   * @param to - User email
   * @param firstName - User's first name
   * @param plan - Subscription plan
   * @param renewalDate - Renewal date
   */
  async sendSubscriptionRenewalReminder(
    to: string,
    firstName: string,
    plan: string,
    renewalDate: Date,
  ): Promise<void> {
    await this.emailQueue.add('subscription-renewal', {
      to,
      firstName,
      plan,
      renewalDate: renewalDate.toLocaleDateString('en-KE'),
    });

    this.logger.log(`Subscription renewal reminder queued for ${to}`);
  }

  // ============================================
  // NETFLIX-GRADE: Content Notifications
  // ============================================

  /**
   * Send new content notification
   * @param to - User email
   * @param firstName - User's first name
   * @param contentTitle - New movie/series title
   * @param contentType - Movie or Series
   */
  async sendNewContentNotification(
    to: string,
    firstName: string,
    contentTitle: string,
    contentType: string,
  ): Promise<void> {
    await this.emailQueue.add('new-content', {
      to,
      firstName,
      contentTitle,
      contentType,
    });

    this.logger.log(`New content notification queued for ${to}`);
  }

  // ============================================
  // DPA 2019: Security & Compliance
  // ============================================

  /**
   * Send suspicious activity alert
   * @param to - User email
   * @param firstName - User's first name
   * @param activity - Suspicious activity description
   * @param location - Location of activity
   */
  async sendSecurityAlert(
    to: string,
    firstName: string,
    activity: string,
    location: string,
  ): Promise<void> {
    await this.emailQueue.add('security-alert', {
      to,
      firstName,
      activity,
      location,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Security alert queued for ${to}`);
  }

  /**
   * Send generic email (fallback)
   * @param to - Recipient email
   * @param subject - Email subject
   * @param text - Plain text content
   * @param html - HTML content (optional)
   */
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
      html,
    });

    this.logger.log(`Generic email sent to ${to}`);
  }
}