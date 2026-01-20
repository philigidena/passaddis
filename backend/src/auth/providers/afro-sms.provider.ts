import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Afro Message SMS Provider
 * https://afromessage.com/developers
 *
 * Ethiopia's SMS gateway for sending OTP and notifications.
 * API uses GET method with query parameters.
 */

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class AfroSmsProvider {
  private readonly apiKey: string;
  private readonly identifier: string;
  private readonly senderId: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AFRO_SMS_API_KEY') || '';
    this.identifier = this.configService.get<string>('AFRO_SMS_IDENTIFIER') || '';
    this.senderId = this.configService.get<string>('AFRO_SMS_SENDER_ID') || 'PassAddis';
    this.apiUrl = 'https://api.afromessage.com/api/send';
  }

  /**
   * Send SMS via Afro Message API
   * Uses GET method with query parameters as per their API spec
   */
  async sendSms(phone: string, message: string): Promise<SmsResponse> {
    if (!this.apiKey) {
      console.warn('⚠️ Afro SMS not configured - message not sent');
      console.log(`📱 SMS to ${phone}: ${message}`);
      return { success: true, messageId: 'mock-' + Date.now() };
    }

    try {
      // Format phone number (ensure it starts with 251)
      const formattedPhone = this.formatPhone(phone);

      // Build URL with query parameters
      // Note: In Beta mode, only 'to' and 'message' are required
      // sender/from parameters require an approved Sender ID
      const params = new URLSearchParams({
        to: formattedPhone,
        message: message,
      });

      const url = `${this.apiUrl}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      // Handle non-JSON responses (like "Unauthorized" text)
      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Afro SMS non-JSON response:', responseText);
        return {
          success: false,
          error: responseText || 'Invalid API response',
        };
      }

      if (data.acknowledge === 'success') {
        console.log(`✅ SMS sent to ${formattedPhone}`);
        return {
          success: true,
          messageId: data.response?.id || data.response?.message_id,
        };
      }

      console.error('Afro SMS error:', data);
      return {
        success: false,
        error: data.response?.errors?.[0] || data.message || 'SMS sending failed',
      };
    } catch (error) {
      console.error('Afro SMS exception:', error);
      return {
        success: false,
        error: 'SMS service unavailable',
      };
    }
  }

  /**
   * Send OTP message
   */
  async sendOtp(phone: string, code: string): Promise<SmsResponse> {
    const message = `Your PassAddis verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send ticket confirmation
   */
  async sendTicketConfirmation(
    phone: string,
    eventName: string,
    ticketCode: string,
  ): Promise<SmsResponse> {
    const message = `PassAddis: Your ticket for "${eventName}" is confirmed! Ticket code: ${ticketCode}. Show this at entry.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(
    phone: string,
    orderId: string,
    pickupCode: string,
  ): Promise<SmsResponse> {
    const message = `PassAddis: Order ${orderId.slice(-6).toUpperCase()} confirmed! Pickup code: ${pickupCode}. Show this code at the pickup location.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send ticket transfer notification to recipient
   */
  async sendTransferNotification(
    phone: string,
    eventName: string,
    transferCode: string,
    senderName?: string,
    expiryHours: number = 48,
  ): Promise<SmsResponse> {
    const fromText = senderName ? `from ${senderName} ` : '';
    const message = `PassAddis: You received a ticket ${fromText}for "${eventName}"! Claim code: ${transferCode}. Valid for ${expiryHours}h. Open app to claim.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send order ready for pickup notification
   */
  async sendOrderReadyNotification(
    phone: string,
    orderNumber: string,
    shopName: string,
  ): Promise<SmsResponse> {
    const message = `PassAddis: Your order #${orderNumber} from ${shopName} is ready for pickup! Show your pickup code at the shop.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send waitlist notification when tickets become available
   */
  async sendWaitlistNotification(
    phone: string,
    eventName: string,
  ): Promise<SmsResponse> {
    const message = `PassAddis: Great news! Tickets are now available for "${eventName}"! Get yours before they sell out. Open the app to purchase.`;
    return this.sendSms(phone, message);
  }

  /**
   * Send event cancellation notification
   */
  async sendEventCancellationNotification(
    phone: string,
    eventName: string,
  ): Promise<SmsResponse> {
    const message = `PassAddis: We regret to inform you that "${eventName}" has been cancelled. Your payment will be refunded within 5-7 business days. We apologize for any inconvenience.`;
    return this.sendSms(phone, message);
  }

  /**
   * Format Ethiopian phone number
   * Accepts: 0911234567, +251911234567, 251911234567, 911234567
   * Returns: 251911234567
   */
  private formatPhone(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Remove leading +
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // If starts with 0, replace with 251
    if (cleaned.startsWith('0')) {
      cleaned = '251' + cleaned.substring(1);
    }

    // If 9 digits (missing country code), add 251
    if (cleaned.length === 9 && cleaned.startsWith('9')) {
      cleaned = '251' + cleaned;
    }

    return cleaned;
  }
}
