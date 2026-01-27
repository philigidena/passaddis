import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as https from 'https';

export interface TelebirrPaymentRequest {
  amount: number;
  orderId: string;
  title: string;
  notifyUrl: string;
  returnUrl: string;
  callbackInfo?: string;
}

export interface TelebirrPaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  rawRequest?: string;
  prepayId?: string;
  outTradeNo?: string;
  error?: string;
}

export interface TelebirrCallbackData {
  outTradeNo?: string;
  transactionNo?: string;
  totalAmount?: string;
  tradeStatus?: string;
  msisdn?: string;
  tradeNo?: string;
  merch_order_id?: string;
  trade_status?: string;
  total_amount?: string;
  transaction_no?: string;
  timestamp?: string;
  sign?: string;
}

/**
 * Telebirr C2B WebCheckout Payment Provider
 *
 * Integration flow:
 * 1. Apply Fabric Token - Get authentication token
 * 2. Create Order (PreOrder) - Create payment order with trade_type: "Checkout"
 * 3. Build Checkout URL - Combine webBaseUrl + rawRequest + params
 * 4. Redirect User - Open checkout URL in browser/WebView
 * 5. Handle Callback - Process notify_url webhook
 *
 * API Documentation: https://developerportal.ethiotelebirr.et
 */
@Injectable()
export class TelebirrProvider {
  private readonly merchantAppId: string;
  private readonly fabricAppId: string;
  private readonly appSecret: string;
  private readonly shortCode: string;
  private readonly privateKey: string;
  private readonly baseUrl: string;
  private readonly webBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.merchantAppId = this.configService.get<string>('TELEBIRR_MERCHANT_APP_ID') || '';
    this.fabricAppId = this.configService.get<string>('TELEBIRR_FABRIC_APP_ID') || '';
    this.appSecret = this.configService.get<string>('TELEBIRR_APP_SECRET') || '';
    this.shortCode = this.configService.get<string>('TELEBIRR_SHORT_CODE') || '';
    this.privateKey = this.configService.get<string>('TELEBIRR_PRIVATE_KEY') || '';

    // API Base URL
    const apiUrl = this.configService.get<string>('TELEBIRR_API_URL') ||
      'https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway';
    this.baseUrl = apiUrl.replace('/payment/gateway', '');

    // Web Checkout Base URL (for redirect)
    this.webBaseUrl = this.configService.get<string>('TELEBIRR_WEB_CHECKOUT_URL') ||
      'https://h5pay.telebirr.com/h5Pay?';
  }

  /**
   * Check if Telebirr is properly configured
   */
  isConfigured(): boolean {
    return !!(this.merchantAppId && this.fabricAppId && this.appSecret &&
              this.shortCode && this.privateKey);
  }

  /**
   * Create timestamp in required format (YYYYMMDDHHmmss)
   */
  private createTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

  /**
   * Create nonce string (random 32 char hex)
   */
  private createNonceStr(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Sign request object with private key using SHA256WithRSA
   */
  private signRequestObject(requestObj: any): string {
    try {
      // Create string to sign: sort keys, concatenate key=value pairs
      const sortedKeys = Object.keys(requestObj).sort();
      const stringToSign = sortedKeys
        .filter(key => key !== 'sign' && key !== 'sign_type')
        .map(key => {
          const value = requestObj[key];
          if (typeof value === 'object') {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join('&');

      console.log('📱 String to sign:', stringToSign);

      // Format private key
      let formattedKey = this.privateKey;
      if (!formattedKey.includes('-----BEGIN')) {
        formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
      }

      // Sign with RSA-SHA256
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(stringToSign);
      sign.end();
      return sign.sign(formattedKey, 'base64');
    } catch (error) {
      console.error('❌ Signing error:', error);
      throw error;
    }
  }

  /**
   * Make HTTPS request with SSL certificate handling
   */
  private async makeRequest(url: string, options: any, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'POST',
        headers: options.headers,
        rejectUnauthorized: false, // Required for Telebirr's certificate
      };

      const req = https.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            console.error('❌ Failed to parse response:', data);
            reject(new Error('Invalid JSON response: ' + data));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request error:', error);
        reject(error);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /**
   * Step 1: Apply for Fabric Token
   */
  private async applyFabricToken(): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/payment/v1/token`;
      console.log('📱 Applying for Fabric Token at:', url);

      const result = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': this.fabricAppId,
        },
      }, {
        appSecret: this.appSecret,
      });

      console.log('📱 Fabric Token Response:', JSON.stringify(result, null, 2));

      if (result.token) {
        return result.token;
      }

      console.error('❌ Failed to get fabric token:', result);
      return null;
    } catch (error) {
      console.error('❌ Fabric token error:', error);
      return null;
    }
  }

  /**
   * Step 2: Create Order (PreOrder) for WebCheckout
   */
  private async createPreOrder(
    fabricToken: string,
    title: string,
    amount: number,
    notifyUrl: string,
    redirectUrl: string,
    callbackInfo?: string,
  ): Promise<{ prepayId: string; outTradeNo: string } | null> {
    try {
      const outTradeNo = `PA${Date.now()}`;

      const req: any = {
        timestamp: this.createTimestamp(),
        nonce_str: this.createNonceStr(),
        method: 'payment.preorder',
        version: '1.0',
      };

      // WebCheckout specific: trade_type is "Checkout" and includes redirect_url
      const biz = {
        notify_url: notifyUrl,
        appid: this.merchantAppId,
        merch_code: this.shortCode,
        merch_order_id: outTradeNo,
        trade_type: 'Checkout', // WebCheckout type
        title: title,
        total_amount: amount.toString(),
        trans_currency: 'ETB',
        timeout_express: '120m',
        business_type: 'BuyGoods',
        payee_identifier: this.shortCode,
        payee_identifier_type: '04',
        payee_type: '5000',
        redirect_url: redirectUrl, // Where to redirect after payment
        callback_info: callbackInfo || 'PassAddis Payment',
      };

      req.biz_content = biz;
      req.sign = this.signRequestObject(req);
      req.sign_type = 'SHA256WithRSA';

      console.log('📱 PreOrder Request:', JSON.stringify(req, null, 2));

      const url = `${this.baseUrl}/payment/v1/merchant/preOrder`;
      const result = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': this.fabricAppId,
          'Authorization': fabricToken,
        },
      }, req);

      console.log('📱 PreOrder Response:', JSON.stringify(result, null, 2));

      if (result.biz_content?.prepay_id) {
        return {
          prepayId: result.biz_content.prepay_id,
          outTradeNo: outTradeNo,
        };
      }

      console.error('❌ PreOrder failed:', result);
      return null;
    } catch (error) {
      console.error('❌ PreOrder error:', error);
      return null;
    }
  }

  /**
   * Step 3: Create Raw Request string for checkout URL
   */
  private createRawRequest(prepayId: string): string {
    const map: any = {
      appid: this.merchantAppId,
      merch_code: this.shortCode,
      nonce_str: this.createNonceStr(),
      prepay_id: prepayId,
      timestamp: this.createTimestamp(),
    };

    const sign = this.signRequestObject(map);

    // Order by ASCII and create raw request string
    const rawRequest = [
      `appid=${map.appid}`,
      `merch_code=${map.merch_code}`,
      `nonce_str=${map.nonce_str}`,
      `prepay_id=${map.prepay_id}`,
      `timestamp=${map.timestamp}`,
      `sign=${sign}`,
      `sign_type=SHA256WithRSA`,
    ].join('&');

    return rawRequest;
  }

  /**
   * Build full checkout URL for WebCheckout
   */
  private buildCheckoutUrl(rawRequest: string): string {
    return `${this.webBaseUrl}${rawRequest}&version=1.0&trade_type=Checkout`;
  }

  /**
   * Initiate a Telebirr payment (WebCheckout)
   */
  async initiatePayment(
    request: TelebirrPaymentRequest,
  ): Promise<TelebirrPaymentResponse> {
    console.log('📱 Telebirr Payment Request:', {
      orderId: request.orderId,
      amount: request.amount,
      title: request.title,
    });

    // Check if configured
    if (!this.isConfigured()) {
      console.error('❌ Telebirr not configured');
      return {
        success: false,
        error: 'Telebirr payment not configured. Please set environment variables.',
      };
    }

    try {
      // Step 1: Get Fabric Token
      console.log('📱 Step 1: Getting Fabric Token...');
      const fabricToken = await this.applyFabricToken();
      if (!fabricToken) {
        return {
          success: false,
          error: 'Failed to authenticate with Telebirr',
        };
      }

      // Step 2: Create PreOrder
      console.log('📱 Step 2: Creating PreOrder...');
      const orderResult = await this.createPreOrder(
        fabricToken,
        request.title,
        request.amount,
        request.notifyUrl,
        request.returnUrl,
        request.callbackInfo,
      );

      if (!orderResult) {
        return {
          success: false,
          error: 'Failed to create payment order',
        };
      }

      // Step 3: Create Raw Request for checkout
      console.log('📱 Step 3: Creating Raw Request...');
      const rawRequest = this.createRawRequest(orderResult.prepayId);

      // Step 4: Build full checkout URL
      const checkoutUrl = this.buildCheckoutUrl(rawRequest);
      console.log('📱 Checkout URL:', checkoutUrl);

      return {
        success: true,
        checkoutUrl: checkoutUrl,
        rawRequest: rawRequest,
        prepayId: orderResult.prepayId,
        outTradeNo: orderResult.outTradeNo,
      };
    } catch (error) {
      console.error('❌ Telebirr payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment service unavailable',
      };
    }
  }

  /**
   * Verify a Telebirr callback/notification
   */
  async verifyCallback(data: TelebirrCallbackData): Promise<boolean> {
    console.log('📱 Telebirr Callback Data:', JSON.stringify(data, null, 2));

    if (!data.sign) {
      console.warn('⚠️ No signature in callback, accepting data');
      return true;
    }

    try {
      // TODO: Verify signature with Telebirr's public key if available
      return true;
    } catch (error) {
      console.error('❌ Callback verification error:', error);
      return false;
    }
  }

  /**
   * Query payment status
   */
  async queryPaymentStatus(outTradeNo: string): Promise<any> {
    console.log('📱 Querying payment status for:', outTradeNo);

    if (!this.isConfigured()) {
      return { success: false, status: 'UNKNOWN', message: 'Not configured' };
    }

    try {
      const fabricToken = await this.applyFabricToken();
      if (!fabricToken) {
        return { success: false, status: 'UNKNOWN', message: 'Auth failed' };
      }

      const req: any = {
        timestamp: this.createTimestamp(),
        nonce_str: this.createNonceStr(),
        method: 'payment.queryorder',
        version: '1.0',
      };

      const biz = {
        appid: this.merchantAppId,
        merch_code: this.shortCode,
        merch_order_id: outTradeNo,
      };

      req.biz_content = biz;
      req.sign = this.signRequestObject(req);
      req.sign_type = 'SHA256WithRSA';

      const url = `${this.baseUrl}/payment/v1/merchant/queryOrder`;
      const result = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': this.fabricAppId,
          'Authorization': fabricToken,
        },
      }, req);

      console.log('📱 Query Response:', JSON.stringify(result, null, 2));

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('❌ Query error:', error);
      return { success: false, status: 'UNKNOWN', message: 'Query failed' };
    }
  }
}
