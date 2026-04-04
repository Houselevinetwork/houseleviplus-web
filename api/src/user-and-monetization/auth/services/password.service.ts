/**
 * Password Service
 * Purpose: Handle password reset operations
 * Location: api/src/user-and-monetization/auth/services/password.service.ts
 * 
 * SINGLE RESPONSIBILITY: Password management only
 * Netflix-style: Forgot & reset password flows
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { SessionService } from './session.service';
import { RefreshTokenService } from './refresh-token.service';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  constructor(
    private userService: UserService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private sessionService: SessionService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Request password reset (forgot password)
   */
  async requestPasswordReset(email: string) {
    const user = await this.userService.findByEmail(email);

    // Don't reveal if email exists (security)
    if (!user) {
      return {
        success: true,
        message: 'If email exists, reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    // Save token to user
    await this.userService.updateUser(user._id.toString(), {
      passwordResetToken: resetToken,
      passwordResetTokenExpiry: resetTokenExpiry,
    });

    // Send email
    await this.sendPasswordResetEmail(user.email, resetToken, user.firstName);

    this.logger.log(`Password reset requested for: ${email}`);

    return {
      success: true,
      message: 'If email exists, reset link has been sent',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    // Find user by reset token
    const user = await this.userService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    // Revoke all sessions and tokens (security measure)
    await this.sessionService.revokeAllUserSessions(
      user._id.toString(),
      'password_change',
    );
    await this.refreshTokenService.revokeAllUserTokens(
      user._id.toString(),
      'password_change',
    );

    this.logger.log(`Password reset successful for: ${user.email}`);

    return {
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    };
  }

  /**
   * Send password reset email
   */
  private async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string,
  ) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password - House Levi+',
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
      <h2 style="font-size:1.5rem;font-weight:400;margin:0 0 20px 0;color:#000000">Reset Your Password</h2>
      <p style="font-size:1rem;margin:0 0 30px 0;color:#666666">Hi ${firstName || 'there'},</p>
      <p style="font-size:1rem;margin:0 0 30px 0;color:#666666">We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align:center;margin:40px 0">
        <a href="${resetUrl}" style="display:inline-block;background-color:#4169E1;color:#ffffff;padding:16px 48px;border-radius:6px;text-decoration:none;font-size:1.125rem;font-weight:500">Reset Password</a>
      </div>
      <p style="font-size:0.875rem;color:#999999;text-align:center;margin:20px 0">This link will expire in <span style="color:#4169E1;font-weight:500">1 hour</span>.</p>
      <p style="margin-top:30px;font-size:0.875rem;color:#666666">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="text-align:center;word-break:break-all;font-size:0.875rem;color:#4169E1">${resetUrl}</p>
    </div>
    <div style="background-color:#f9f9f9;padding:30px;text-align:center;border-top:1px solid #eeeeee">
      <p style="font-size:0.75rem;color:#999999;margin:5px 0">If you didn't request a password reset, please ignore this email.</p>
      <p style="font-size:0.75rem;color:#999999;margin:5px 0">© 2026 House Levi+. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      throw new BadRequestException('Failed to send password reset email');
    }
  }
}