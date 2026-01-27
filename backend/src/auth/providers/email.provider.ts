import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Email Provider using Resend
 *
 * Resend offers 100 emails/day free tier.
 * Sign up at: https://resend.com
 *
 * Required environment variables:
 * - RESEND_API_KEY: Your Resend API key
 * - EMAIL_FROM: Sender email (must be verified domain or use onboarding@resend.dev for testing)
 */

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailProvider {
  private readonly resend: Resend | null;
  private readonly fromEmail: string;
  private readonly appUrl: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'PassAddis <onboarding@resend.dev>';
    this.appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      console.log('📧 Email service configured with Resend');
    } else {
      this.resend = null;
      this.isConfigured = false;
      console.warn('⚠️ RESEND_API_KEY not configured - emails will be logged to console');
    }
  }

  /**
   * Send email using Resend or log to console if not configured
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<EmailResponse> {
    // If Resend is configured, send real email
    if (this.resend && this.isConfigured) {
      try {
        const { data, error } = await this.resend.emails.send({
          from: this.fromEmail,
          to: [to],
          subject: subject,
          html: html,
          text: text,
        });

        if (error) {
          console.error('❌ Resend email error:', error);
          return {
            success: false,
            error: error.message,
          };
        }

        console.log(`✅ Email sent to ${to}: ${data?.id}`);
        return {
          success: true,
          messageId: data?.id,
        };
      } catch (error) {
        console.error('❌ Email sending failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Email sending failed',
        };
      }
    }

    // Fallback: Log to console for development
    console.log('\n📧 ==================== EMAIL (DEV MODE) ====================');
    console.log('To:', to);
    console.log('From:', this.fromEmail);
    console.log('Subject:', subject);
    console.log('============================================================\n');

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
    };
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">PassAddis</h1>
        </div>
        <h2 style="color: #333;">Welcome${name ? `, ${name}` : ''}!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Thank you for signing up. Please verify your email address to complete your registration.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #FF6B35;">${verificationUrl}</a>
        </p>
        <p style="color: #888; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you didn't create an account with PassAddis, you can safely ignore this email.
        </p>
      </div>
    `;

    const text = `
Welcome to PassAddis${name ? `, ${name}` : ''}!

Thank you for signing up. Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with PassAddis, you can safely ignore this email.
    `;

    return this.sendEmail(email, 'Verify your PassAddis email', html, text);
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">PassAddis</h1>
        </div>
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Hello${name ? ` ${name}` : ''},
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #FF6B35;">${resetUrl}</a>
        </p>
        <p style="color: #888; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>
    `;

    const text = `
Password Reset Request

Hello${name ? ` ${name}` : ''},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
    `;

    return this.sendEmail(email, 'Reset your PassAddis password', html, text);
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(
    email: string,
    name: string | null,
  ): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">PassAddis</h1>
        </div>
        <h2 style="color: #333;">Welcome to PassAddis!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Hello${name ? ` ${name}` : ''},
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Your email has been verified successfully. You're all set to start discovering amazing events!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.appUrl}/events"
             style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Browse Events
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #555; font-size: 14px;">
          Happy exploring!<br>
          <strong>The PassAddis Team</strong>
        </p>
      </div>
    `;

    const text = `
Welcome to PassAddis!

Hello${name ? ` ${name}` : ''},

Your email has been verified successfully. You're all set to start discovering amazing events!

Visit ${this.appUrl}/events to browse events.

Happy exploring!
The PassAddis Team
    `;

    return this.sendEmail(email, 'Welcome to PassAddis!', html, text);
  }

  /**
   * Send ticket purchase confirmation
   */
  async sendTicketConfirmation(
    email: string,
    name: string | null,
    eventTitle: string,
    ticketCount: number,
    orderTotal: number,
    ticketUrl: string,
  ): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">PassAddis</h1>
        </div>
        <h2 style="color: #333;">Your Tickets are Confirmed!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Hello${name ? ` ${name}` : ''},
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Thank you for your purchase! Your tickets for <strong>${eventTitle}</strong> have been confirmed.
        </p>
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Event:</strong> ${eventTitle}</p>
          <p style="margin: 5px 0;"><strong>Tickets:</strong> ${ticketCount}</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> ${orderTotal.toFixed(2)} ETB</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ticketUrl}"
             style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View Your Tickets
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          Show the QR code on your ticket at the event entrance.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #555; font-size: 14px;">
          Enjoy the event!<br>
          <strong>The PassAddis Team</strong>
        </p>
      </div>
    `;

    const text = `
Your Tickets are Confirmed!

Hello${name ? ` ${name}` : ''},

Thank you for your purchase! Your tickets for ${eventTitle} have been confirmed.

Event: ${eventTitle}
Tickets: ${ticketCount}
Total: ${orderTotal.toFixed(2)} ETB

View your tickets: ${ticketUrl}

Show the QR code on your ticket at the event entrance.

Enjoy the event!
The PassAddis Team
    `;

    return this.sendEmail(email, `Tickets Confirmed: ${eventTitle}`, html, text);
  }

  /**
   * Send ticket transfer notification
   */
  async sendTicketTransferNotification(
    recipientEmail: string,
    senderName: string | null,
    eventTitle: string,
    transferCode: string,
    claimUrl: string,
  ): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">PassAddis</h1>
        </div>
        <h2 style="color: #333;">You've Received a Ticket!</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          ${senderName || 'Someone'} has transferred a ticket to you for <strong>${eventTitle}</strong>.
        </p>
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 5px 0; font-size: 14px; color: #666;">Transfer Code:</p>
          <p style="margin: 10px 0; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #FF6B35;">${transferCode}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${claimUrl}"
             style="display: inline-block; padding: 14px 28px; background-color: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Claim Your Ticket
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          This transfer expires in 48 hours.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you don't know the sender or weren't expecting this, you can safely ignore this email.
        </p>
      </div>
    `;

    const text = `
You've Received a Ticket!

${senderName || 'Someone'} has transferred a ticket to you for ${eventTitle}.

Transfer Code: ${transferCode}

Claim your ticket: ${claimUrl}

This transfer expires in 48 hours.

If you don't know the sender or weren't expecting this, you can safely ignore this email.
    `;

    return this.sendEmail(recipientEmail, `Ticket Transfer: ${eventTitle}`, html, text);
  }
}
