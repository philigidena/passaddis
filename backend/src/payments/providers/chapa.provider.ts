import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Chapa Payment Provider
 * https://developer.chapa.co/docs
 *
 * Chapa is an Ethiopian payment facilitator that handles
 * Telebirr, CBE Birr, and bank payments through a single API.
 *
 * This is the RECOMMENDED approach for starting out - no PSO license needed.
 */

export interface ChapaPaymentRequest {
  amount: number;
  currency: string;
  email?: string;
  phone: string;
  tx_ref: string; // Your unique transaction reference
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface ChapaPaymentResponse {
  success: boolean;
  checkout_url?: string;
  tx_ref?: string;
  error?: string;
}

export interface ChapaWebhookPayload {
  event: string;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  charge: number;
  payment_method: string;
  reference: string;
  created_at: string;
}

@Injectable()
export class ChapaProvider {
  private readonly secretKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('CHAPA_SECRET_KEY') || '';
    this.apiUrl = 'https://api.chapa.co/v1';
  }

  /**
   * Initialize a payment
   * Returns a checkout URL where user completes payment
   */
  async initiatePayment(
    request: ChapaPaymentRequest,
  ): Promise<ChapaPaymentResponse> {
    if (!this.secretKey) {
      console.warn('⚠️ Chapa not configured - returning mock response');
      return {
        success: true,
        checkout_url: `https://checkout.chapa.co/mock/${request.tx_ref}`,
        tx_ref: request.tx_ref,
      };
    }

    try {
      const sanitizedDescription = (request.customization?.description || 'Event Tickets and Shop').replace(/[^a-zA-Z0-9\-_\s.]/g, '');
      const payload = {
        amount: request.amount.toString(),
        currency: request.currency || 'ETB',
        phone_number: request.phone,
        tx_ref: request.tx_ref,
        callback_url: request.callback_url,
        return_url: request.return_url,
        customization: {
          title: request.customization?.title || 'PassAddis',
          description: sanitizedDescription,
        },
      };

      console.log('Chapa payment request:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.apiUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Chapa API response:', JSON.stringify(data, null, 2));

      if (data.status === 'success') {
        return {
          success: true,
          checkout_url: data.data.checkout_url,
          tx_ref: request.tx_ref,
        };
      }

      // Chapa returns validation errors in data.errors or as root level object
      const errorMessage = data.message ||
        (data.errors ? JSON.stringify(data.errors) : null) ||
        JSON.stringify(data);
      console.error('Chapa API error:', errorMessage);

      return {
        success: false,
        error: data.errors || data.message || 'Payment initialization failed',
      };
    } catch (error) {
      console.error('Chapa payment error:', error);
      return {
        success: false,
        error: 'Payment service unavailable',
      };
    }
  }

  /**
   * Verify a payment after callback
   */
  async verifyPayment(tx_ref: string): Promise<any> {
    if (!this.secretKey) {
      return { status: 'success', verified: true };
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/transaction/verify/${tx_ref}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chapa verify error:', error);
      return { status: 'error', message: 'Verification failed' };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(signature: string, payload: string): boolean {
    // Chapa sends webhook with x-chapa-signature header
    // Verify using HMAC-SHA256
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    return signature === expectedSignature;
  }
}
