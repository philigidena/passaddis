import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface StripePaymentRequest {
  amount: number;
  currency: string; // 'USD', 'EUR', 'GBP', etc.
  orderId: string;
  title: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentResponse {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_intent: string;
      payment_status: string;
      metadata: Record<string, string>;
      amount_total: number;
      currency: string;
    };
  };
}

@Injectable()
export class StripeProvider {
  private readonly logger = new Logger(StripeProvider.name);
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly apiUrl = 'https://api.stripe.com/v1';

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  get isConfigured(): boolean {
    return !!this.secretKey && !this.secretKey.includes('PLACEHOLDER');
  }

  /**
   * Create a Stripe Checkout Session
   * Returns a URL where the user completes payment
   */
  async createCheckoutSession(
    request: StripePaymentRequest,
  ): Promise<StripePaymentResponse> {
    if (!this.isConfigured) {
      this.logger.warn('Stripe is not configured - using test mode');
      return {
        success: true,
        sessionId: `test_session_${request.orderId}`,
        checkoutUrl: `${request.successUrl}?test_payment=true&session_id=test_session_${request.orderId}`,
      };
    }

    try {
      // Convert amount to smallest currency unit (cents)
      const amountInCents = Math.round(request.amount * 100);

      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('payment_method_types[]', 'card');
      params.append('line_items[0][price_data][currency]', request.currency.toLowerCase());
      params.append('line_items[0][price_data][unit_amount]', amountInCents.toString());
      params.append('line_items[0][price_data][product_data][name]', request.title);
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${request.successUrl}?session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', request.cancelUrl);
      params.append('metadata[orderId]', request.orderId);

      if (request.customerEmail) {
        params.append('customer_email', request.customerEmail);
      }

      if (request.metadata) {
        for (const [key, value] of Object.entries(request.metadata)) {
          params.append(`metadata[${key}]`, value);
        }
      }

      const response = await fetch(`${this.apiUrl}/checkout/sessions`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.error) {
        this.logger.error(`Stripe API error: ${data.error.message}`);
        return {
          success: false,
          error: data.error.message || 'Stripe payment initialization failed',
        };
      }

      this.logger.log(`Stripe checkout session created: ${data.id}`);
      return {
        success: true,
        sessionId: data.id,
        checkoutUrl: data.url,
      };
    } catch (error) {
      this.logger.error('Stripe payment error:', error);
      return {
        success: false,
        error: 'Payment service unavailable',
      };
    }
  }

  /**
   * Retrieve a Checkout Session to verify payment
   */
  async retrieveSession(sessionId: string): Promise<any> {
    if (!this.isConfigured) {
      return { id: sessionId, payment_status: 'paid', metadata: {} };
    }

    try {
      const response = await fetch(`${this.apiUrl}/checkout/sessions/${sessionId}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
        },
      });

      return await response.json();
    } catch (error) {
      this.logger.error('Stripe session retrieval error:', error);
      return null;
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;

    try {
      const crypto = require('crypto');
      const elements = signature.split(',');
      const timestampStr = elements.find((e: string) => e.startsWith('t='))?.split('=')[1];
      const signatures = elements
        .filter((e: string) => e.startsWith('v1='))
        .map((e: string) => e.split('=')[1]);

      if (!timestampStr || signatures.length === 0) return false;

      const signedPayload = `${timestampStr}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signedPayload)
        .digest('hex');

      return signatures.some((sig: string) => crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(expectedSignature),
      ));
    } catch {
      return false;
    }
  }

  /**
   * Issue a refund
   */
  async refund(paymentIntentId: string, amount?: number): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: true };
    }

    try {
      const params = new URLSearchParams();
      params.append('payment_intent', paymentIntentId);
      if (amount) {
        params.append('amount', Math.round(amount * 100).toString());
      }

      const response = await fetch(`${this.apiUrl}/refunds`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (data.error) {
        return { success: false, error: data.error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Refund failed' };
    }
  }
}
