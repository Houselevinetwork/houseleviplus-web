import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggerService } from '@core/logger/logger.service';

/**
 * Mail Processor
 * 
 * Processes email jobs in background
 * 
 * Netflix-Grade:
 * - Non-blocking email sending
 * - Automatic retries (3 attempts)
 * - Error logging
 */
@Processor('email')
export class MailProcessor {
  constructor(
    private mailerService: MailerService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('MailProcessor');
  }

  /**
   * Process welcome email
   */
  @Process('welcome')
  async sendWelcome(job: Job) {
    const { to, firstName, verificationLink } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject: '🎬 Welcome to ReelAfrika!',
        template: './welcome',
        context: {
          firstName,
          verificationLink,
        },
      });

      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error.stack);
      throw error; // Will trigger retry
    }
  }

  /**
   * Process verification email
   */
  @Process('verify-email')
  async sendVerification(job: Job) {
    const { to, firstName, verificationLink } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject: '✅ Verify Your ReelAfrika Email',
        template: './verify-email',
        context: {
          firstName,
          verificationLink,
        },
      });

      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error.stack);
      throw error;
    }
  }

  /**
   * Process password reset email
   */
  @Process('reset-password')
  async sendPasswordReset(job: Job) {
    const { to, firstName, resetLink } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject: '🔐 Reset Your ReelAfrika Password',
        template: './reset-password',
        context: {
          firstName,
          resetLink,
        },
      });

      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error.stack);
      throw error;
    }
  }

  /**
   * Process payment receipt email
   */
  @Process('payment-receipt')
  async sendPaymentReceipt(job: Job) {
    const { to, firstName, amount, plan, transactionId, date } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject: '💳 Payment Receipt - ReelAfrika',
        template: './payment-receipt',
        context: {
          firstName,
          amount,
          plan,
          transactionId,
          date,
        },
      });

      this.logger.log(`Payment receipt sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send payment receipt to ${to}`, error.stack);
      throw error;
    }
  }

  /**
   * Process subscription renewal reminder
   */
  @Process('subscription-renewal')
  async sendSubscriptionRenewal(job: Job) {
    const { to, firstName, plan, renewalDate } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject: '📢 Subscription Renewal Reminder',
        template: './subscription-renewal',
        context: {
          firstName,
          plan,
          renewalDate,
        },
      });

      this.logger.log(`Subscription renewal reminder sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send renewal reminder to ${to}`, error.stack);
      throw error;
    }
  }

  /**
   * Process new content notification
   */
  @Process('new-content')
  async sendNewContentNotification(job: Job) {
    const { to, firstName, contentTitle, contentType } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject: `🎬 New ${contentType} on ReelAfrika: ${contentTitle}`,
        template: './new-content',
        context: {
          firstName,
          contentTitle,
          contentType,
        },
      });

      this.logger.log(`New content notification sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send new content notification to ${to}`, error.stack);
      throw error;
    }
  }

  /**
   * Process security alert
   */
  @Process('security-alert')
  async sendSecurityAlert(job: Job) {
    const { to, firstName, activity, location, timestamp } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject: '⚠️ Security Alert - ReelAfrika',
        template: './security-alert',
        context: {
          firstName,
          activity,
          location,
          timestamp,
        },
      });

      this.logger.log(`Security alert sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send security alert to ${to}`, error.stack);
      throw error;
    }
  }
}