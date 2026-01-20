import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Email Provider (Mock Implementation)
 *
 * TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
 * For now, this logs emails to console for development.
 */

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailProvider {
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@passaddis.com';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:5173';
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(
    email: string,
    name: string | null,
    verificationToken: string,
  ): Promise<EmailResponse> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;

    const emailContent = {
      to: email,
      from: this.fromEmail,
      subject: 'Verify your PassAddis email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Welcome to PassAddis${name ? `, ${name}` : ''}!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          <p>
            <a href="${verificationUrl}"
               style="display: inline-block; padding: 12px 24px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 6px;">
              Verify Email Address
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't create an account with PassAddis, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `
Welcome to PassAddis${name ? `, ${name}` : ''}!

Thank you for signing up. Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with PassAddis, you can safely ignore this email.
      `,
    };

    // TODO: Replace with actual email service
    console.log('\n📧 ==================== EMAIL ====================');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Verification URL:', verificationUrl);
    console.log('================================================\n');

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string | null,
    resetToken: string,
  ): Promise<EmailResponse> {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;

    const emailContent = {
      to: email,
      from: this.fromEmail,
      subject: 'Reset your PassAddis password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Password Reset Request</h2>
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p>
            <a href="${resetUrl}"
               style="display: inline-block; padding: 12px 24px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 6px;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
          </p>
        </div>
      `,
      text: `
Password Reset Request

Hello${name ? ` ${name}` : ''},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
      `,
    };

    // TODO: Replace with actual email service
    console.log('\n📧 ==================== EMAIL ====================');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Reset URL:', resetUrl);
    console.log('================================================\n');

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(
    email: string,
    name: string | null,
  ): Promise<EmailResponse> {
    const emailContent = {
      to: email,
      from: this.fromEmail,
      subject: 'Welcome to PassAddis!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Welcome to PassAddis!</h2>
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Your email has been verified successfully. You're all set to start discovering amazing events!</p>
          <p>
            <a href="${this.appUrl}/events"
               style="display: inline-block; padding: 12px 24px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 6px;">
              Browse Events
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Happy exploring!<br>
            The PassAddis Team
          </p>
        </div>
      `,
    };

    console.log('\n📧 ==================== EMAIL ====================');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('================================================\n');

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }
}
