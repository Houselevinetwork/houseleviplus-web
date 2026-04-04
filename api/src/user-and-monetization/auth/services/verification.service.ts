/**
 * Verification Service
 * Purpose: Generate tokens, send verification emails, verify tokens
 * Location: api/src/user-and-monetization/auth/services/verification.service.ts
 * 
 * SECURITY:
 * - Crypto-random tokens (32 bytes)
 * - 15-minute expiry
 * - Single-use tokens
 * - Rate limiting (max 3 per hour)
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { VerificationToken } from '../schemas/verification-token.schema';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @InjectModel(VerificationToken.name) private verificationTokenModel: Model<VerificationToken>,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate crypto-secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex'); // 64-character hex string
  }

  /**
   * Send verification email to new user
   */
  async sendVerificationEmail(email: string, ipAddress?: string): Promise<void> {
    // 🔐 RATE LIMITING: Check recent emails
    const recentTokens = await this.verificationTokenModel.countDocuments({
      email,
      createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    });

    if (recentTokens >= 3) {
      throw new BadRequestException('Too many verification emails requested. Please try again later.');
    }

    // Delete any existing unused tokens for this email
    await this.verificationTokenModel.deleteMany({ 
      email, 
      used: false 
    });

    // Generate new token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save to database
    await this.verificationTokenModel.create({
      email,
      token,
      type: 'signup',
      expiresAt,
      used: false,
      ipAddress,
    });

    // Build verification URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    // Send email
    await this.sendEmail(email, verificationUrl);

    this.logger.log(`Verification email sent to ${email} (Expires in 15 minutes)`);
  }

  /**
   * Verify token from email link
   */
  async verifyToken(token: string): Promise<string> {
    const verification = await this.verificationTokenModel.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    // Mark as used
    verification.used = true;
    verification.usedAt = new Date();
    await verification.save();

    this.logger.log(`Token verified for ${verification.email}`);

    return verification.email;
  }

  /**
   * Check if user can request new verification email (rate limiting)
   */
  async canRequestVerification(email: string): Promise<boolean> {
    const recentTokens = await this.verificationTokenModel.countDocuments({
      email,
      createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
    });

    return recentTokens < 3;
  }

  /**
   * Send verification email using template
   */
  private async sendEmail(email: string, verificationUrl: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Finish Signing Up - House Levi+',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background-color:#f5f5f5">
  <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="background:linear-gradient(135deg,#000000 0%,#1a1a1a 100%);color:white;padding:40px 20px;text-align:center">
      <h1 style="font-size:2.5rem;font-weight:300;letter-spacing:-0.03em;margin:0">HOUSE LEVI<span style="color:#4169E1">+</span></h1>
      <p style="font-size:0.875rem;color:rgba(255,255,255,0.7);margin:10px 0 0 0;letter-spacing:0.05em">All Things Theatre and Film</p>
    </div>
    <div style="padding:40px 30px;color:#333333;line-height:1.6">
      <h2 style="font-size:1.5rem;font-weight:400;margin:0 0 20px 0;color:#000000">Welcome to House Levi+!</h2>
      <p style="font-size:1rem;margin:0 0 30px 0;color:#666666">We're excited to have you join our premium streaming platform. Click the button below to verify your email and finish signing up:</p>
      <div style="text-align:center;margin:40px 0">
        <a href="${verificationUrl}" style="display:inline-block;background-color:#4169E1;color:#ffffff;padding:16px 48px;border-radius:6px;text-decoration:none;font-size:1.125rem;font-weight:500">Finish Signing Up</a>
      </div>
      <p style="font-size:0.875rem;color:#999999;text-align:center;margin:20px 0">This link will expire in <span style="color:#4169E1;font-weight:500">15 minutes</span>.</p>
      <p style="margin-top:30px;font-size:0.875rem;color:#666666">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="text-align:center;word-break:break-all;font-size:0.875rem;color:#4169E1">${verificationUrl}</p>
    </div>
    <div style="background-color:#f9f9f9;padding:30px;text-align:center;border-top:1px solid #eeeeee">
      <p style="font-size:0.75rem;color:#999999;margin:5px 0">If you didn't create an account, please ignore this email.</p>
      <p style="font-size:0.75rem;color:#999999;margin:5px 0">© 2026 House Levi+. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      throw new BadRequestException('Failed to send verification email');
    }
  }
}