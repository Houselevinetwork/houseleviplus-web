/**
 * OTP Service - Handle verification codes
 * Location: api/src/user-and-monetization/auth/services/otp.service.ts
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Otp } from '../schemas/otp.schema';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  // Generate 6-digit OTP code
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to email
  async sendOTP(email: string, purpose: string = 'login'): Promise<void> {
    // Delete any existing OTPs for this email
    await this.otpModel.deleteMany({ email });

    // Generate new code
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to database
    await this.otpModel.create({
      email,
      code,
      expiresAt,
      purpose,
      attempts: 0,
      verified: false,
    });

    // Send email
    await this.sendOTPEmail(email, code);

    this.logger.log(`OTP sent to ${email} (Purpose: ${purpose})`);
  }

  // Verify OTP code
  async verifyOTP(email: string, code: string): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      email,
      code,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      // Check if OTP exists but is wrong/expired
      const existingOtp = await this.otpModel.findOne({ email, verified: false });
      
      if (existingOtp) {
        // Increment attempts
        existingOtp.attempts += 1;
        await existingOtp.save();

        // Block after 3 attempts
        if (existingOtp.attempts >= 3) {
          await this.otpModel.deleteMany({ email });
          throw new BadRequestException('Too many failed attempts. Request a new code.');
        }
      }

      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    this.logger.log(`OTP verified for ${email}`);
    return true;
  }

  // Check if OTP can be resent (rate limiting)
  async canResend(email: string): Promise<boolean> {
    const recentOtp = await this.otpModel.findOne({
      email,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Last 60 seconds
    });

    return !recentOtp;
  }

// Send OTP email
  private async sendOTPEmail(email: string, code: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Sign-in Code - House Levi+',
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
      <h2 style="font-size:1.5rem;font-weight:400;margin:0 0 20px 0;color:#000000">Your Sign-in Code</h2>
      <p style="font-size:1rem;margin:0 0 30px 0;color:#666666">Enter this code to sign in to House Levi+:</p>
      <div style="background:linear-gradient(135deg,#f4f4f4 0%,#e8e8e8 100%);padding:30px;text-align:center;border-radius:8px;margin:40px 0">
        <p style="font-size:3rem;font-weight:700;letter-spacing:0.3em;color:#000000;margin:0;font-family:'Courier New',monospace">${code}</p>
        <p style="font-size:0.875rem;color:#666666;margin:10px 0 0 0;text-transform:uppercase;letter-spacing:0.1em">Verification Code</p>
      </div>
      <p style="font-size:0.875rem;color:#999999;text-align:center;margin:20px 0">This code will expire in <span style="color:#4169E1;font-weight:500">10 minutes</span>.</p>
      <p style="margin-top:30px;font-size:0.875rem;text-align:center;color:#666666">If you didn't request this code, please ignore this email.</p>
    </div>
    <div style="background-color:#f9f9f9;padding:30px;text-align:center;border-top:1px solid #eeeeee">
      <p style="font-size:0.75rem;color:#999999;margin:5px 0">This is an automated message. Please do not reply to this email.</p>
      <p style="font-size:0.75rem;color:#999999;margin:5px 0">© 2026 House Levi+. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP email: ${error.message}`);
      throw new BadRequestException('Failed to send verification code');
    }
  }ss
}
