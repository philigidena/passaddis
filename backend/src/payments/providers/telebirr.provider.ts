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
  // Fields from Telebirr callback notification (Step 7 in docs)
  notify_url?: string;
  appid?: string;
  notify_time?: string;
  merch_code?: string;
  merch_order_id?: string;
  payment_order_id?: string;
  total_amount?: string;
  trans_id?: string;
  trans_currency?: string;
  trade_status?: string;
  trans_end_time?: string;
  callback_info?: string;
  sign?: string;
  sign_type?: string;

  // Alternative camelCase format (legacy/alternative)
  outTradeNo?: string;
  transactionNo?: string;
  totalAmount?: string;
  tradeStatus?: string;
  msisdn?: string;
  tradeNo?: string;
  transaction_no?: string;
  timestamp?: string;
}

export interface TelebirrRefundRequest {
  orderId: string;           // Original merchant order ID
  transactionId: string;     // Payment transaction ID (from Telebirr)
  amount: number;            // Amount to refund
  reason?: string;           // Optional refund reason
}

export interface TelebirrRefundResponse {
  success: boolean;
  refundOrderId?: string;
  refundStatus?: string;
  error?: string;
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
  private readonly publicKey: string; // Telebirr's public key for verifying callbacks
  private readonly baseUrl: string;
  private readonly webBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.merchantAppId = this.configService.get<string>('TELEBIRR_MERCHANT_APP_ID') || '';
    this.fabricAppId = this.configService.get<string>('TELEBIRR_FABRIC_APP_ID') || '';
    this.appSecret = this.configService.get<string>('TELEBIRR_APP_SECRET') || '';
    this.shortCode = this.configService.get<string>('TELEBIRR_SHORT_CODE') || '';
    this.privateKey = this.configService.get<string>('TELEBIRR_PRIVATE_KEY') || '';
    // Telebirr's public key for verifying callback signatures
    this.publicKey = this.configService.get<string>('TELEBIRR_PUBLIC_KEY') || '';

    // API Base URL - Use environment variable or default to testbed
    // Testbed API: https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway
    // Production API: https://telebirrappcube.ethiomobilemoney.et:38443/apiaccess/payment/gateway
    // NOTE: Keep full URL - endpoints are appended to this base
    this.baseUrl = this.configService.get<string>('TELEBIRR_API_URL') ||
      'https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway';

    // Web Checkout Base URL (for redirect)
    // Testbed: https://developerportal.ethiotelebirr.et:38443/payment/web/paygate?
    // Production: https://telebirrappcube.ethiomobilemoney.et:38443/payment/web/paygate?
    this.webBaseUrl = this.configService.get<string>('TELEBIRR_WEB_CHECKOUT_URL') ||
      'https://developerportal.ethiotelebirr.et:38443/payment/web/paygate?';

    // Note: Use domain name for checkout URL (same as v39/v40 which worked)

    console.log('📱 Telebirr configured with API base:', this.baseUrl);
    console.log('📱 Telebirr web checkout base:', this.webBaseUrl);
  }

  /**
   * Check if Telebirr is properly configured
   */
  isConfigured(): boolean {
    return !!(this.merchantAppId && this.fabricAppId && this.appSecret &&
              this.shortCode && this.privateKey);
  }

  /**
   * Create timestamp - MILLISECONDS (13 digits)
   * v40 used this format and it worked with checkout
   */
  private createTimestamp(): string {
    return Date.now().toString();
  }

  /**
   * Create nonce string (32 char lowercase hex)
   * v40 used this format and it worked with checkout
   */
  private createNonceStr(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Sign request object with private key using SHA256withRSAandMGF1 (RSA-PSS)
   *
   * Per Telebirr demo code (tools.js):
   * - Algorithm: "SHA256withRSAandMGF1" which is RSA-PSS with MGF1
   * - This is NOT standard RSA-SHA256 (PKCS#1 v1.5)
   *
   * Signature process:
   * 1. Exclude sign, sign_type, biz_content (as object) fields
   * 2. Flatten biz_content fields into the main map
   * 3. Sort all fields alphabetically (A-Z)
   * 4. Join as key=value pairs with &
   * 5. Sign with RSA-PSS (SHA256withRSAandMGF1)
   */
  private signRequestObject(requestObj: any): string {
    try {
      const excludeFields = ['sign', 'sign_type', 'header', 'refund_info', 'openType', 'raw_request', 'biz_content', 'wallet_reference_data'];
      const fieldMap: Record<string, string> = {};

      // Add top-level fields (excluding biz_content)
      for (const key of Object.keys(requestObj)) {
        if (excludeFields.includes(key)) continue;
        fieldMap[key] = String(requestObj[key]);
      }

      // Flatten biz_content fields into the map
      if (requestObj.biz_content) {
        for (const key of Object.keys(requestObj.biz_content)) {
          if (excludeFields.includes(key)) continue;
          fieldMap[key] = String(requestObj.biz_content[key]);
        }
      }

      // Sort keys alphabetically and build signature string
      const sortedKeys = Object.keys(fieldMap).sort();
      const stringToSign = sortedKeys.map(key => `${key}=${fieldMap[key]}`).join('&');

      console.log('📱 String to sign:', stringToSign);

      // Format private key
      let formattedKey = this.privateKey;
      if (!formattedKey.includes('-----BEGIN')) {
        formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
      }

      // Sign with RSA-PSS (SHA256withRSAandMGF1) per Telebirr demo code
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(stringToSign);
      sign.end();
      return sign.sign({
        key: formattedKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      }, 'base64');
    } catch (error) {
      console.error('❌ Signing error:', error);
      throw error;
    }
  }

  /**
   * Make HTTPS request with SSL certificate handling and timeout
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
        timeout: 30000, // 30 second timeout
      };

      console.log(`📱 Making request to: ${url}`);

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

      // Handle timeout
      req.on('timeout', () => {
        req.destroy();
        console.error('❌ Request timeout after 30s');
        reject(new Error('Connection to Telebirr API timed out. The API may be unreachable from this server location.'));
      });

      req.on('error', (error: any) => {
        console.error('❌ Request error:', error.message);
        if (error.code === 'ECONNREFUSED') {
          reject(new Error('Connection refused by Telebirr API. Please check network/firewall settings.'));
        } else if (error.code === 'ENOTFOUND') {
          reject(new Error('Could not resolve Telebirr API hostname.'));
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
          reject(new Error('Connection to Telebirr API timed out. The API may be unreachable from this server.'));
        } else {
          reject(error);
        }
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
  private async applyFabricToken(): Promise<{ token: string } | { error: string }> {
    try {
      const url = `${this.baseUrl}/payment/v1/token`;
      console.log('📱 Applying for Fabric Token at:', url);
      console.log('📱 Using X-APP-Key:', this.fabricAppId);
      console.log('📱 Using appSecret:', this.appSecret ? `${this.appSecret.substring(0, 8)}...` : 'NOT SET');

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
        return { token: result.token };
      }

      // Return actual error from Telebirr
      const errorMsg = result.errorMsg || result.msg || result.message || JSON.stringify(result);
      console.error('❌ Failed to get fabric token:', errorMsg);
      return { error: `Telebirr token error: ${errorMsg}` };
    } catch (error) {
      console.error('❌ Fabric token error:', error);
      return { error: error instanceof Error ? error.message : 'Connection failed' };
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
  ): Promise<{ prepayId: string; outTradeNo: string } | { error: string }> {
    try {
      const outTradeNo = `PA${Date.now()}`;

      const req: any = {
        timestamp: this.createTimestamp(),
        nonce_str: this.createNonceStr(),
        method: 'payment.preorder',
        version: '1.0',
      };

      // WebCheckout specific - matching working v38 structure
      const biz: any = {
        notify_url: notifyUrl,
        appid: this.merchantAppId,
        merch_code: this.shortCode,
        merch_order_id: outTradeNo,
        trade_type: 'Checkout',
        title: title,
        total_amount: amount.toString(),
        trans_currency: 'ETB',
        timeout_express: '120m',
        business_type: 'BuyGoods',
        redirect_url: redirectUrl,
      };

      // Add payee fields like v38 working version
      if (this.shortCode) {
        biz.payee_identifier = this.shortCode;
        biz.payee_identifier_type = '04';
        biz.payee_type = '5000';
      }

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

      // Return actual error from Telebirr
      const errorMsg = result.msg || result.errorMsg || result.message ||
        result.biz_content?.msg || result.biz_content?.error ||
        JSON.stringify(result);
      console.error('❌ PreOrder failed:', errorMsg);
      return { error: `Telebirr PreOrder error: ${errorMsg}` };
    } catch (error) {
      console.error('❌ PreOrder error:', error);
      return { error: error instanceof Error ? error.message : 'PreOrder request failed' };
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

    // URL-encode values to safely handle base64 signature characters (+, /, =)
    // Without encoding, + in base64 is decoded as space in URL query strings
    const rawRequest = [
      `appid=${encodeURIComponent(map.appid)}`,
      `merch_code=${encodeURIComponent(map.merch_code)}`,
      `nonce_str=${encodeURIComponent(map.nonce_str)}`,
      `prepay_id=${encodeURIComponent(map.prepay_id)}`,
      `timestamp=${encodeURIComponent(map.timestamp)}`,
      `sign=${encodeURIComponent(sign)}`,
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
      const tokenResult = await this.applyFabricToken();
      if ('error' in tokenResult) {
        return {
          success: false,
          error: tokenResult.error,
        };
      }
      const fabricToken = tokenResult.token;

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

      if ('error' in orderResult) {
        return {
          success: false,
          error: orderResult.error,
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
   * Verify a Telebirr callback/notification signature
   *
   * According to Telebirr docs (Step 7 - Notify):
   * 1. Exclude sign and sign_type from callback fields
   * 2. Sort remaining fields alphabetically
   * 3. Join as key=value pairs with &
   * 4. Verify signature using Telebirr's public key with SHA256WithRSA
   */
  async verifyCallback(data: TelebirrCallbackData): Promise<boolean> {
    console.log('📱 Telebirr Callback Data:', JSON.stringify(data, null, 2));

    // If no signature provided, reject the callback (security)
    if (!data.sign) {
      console.error('❌ No signature in callback - rejecting for security');
      return false;
    }

    // If no public key configured, log warning but allow (for backward compatibility during setup)
    if (!this.publicKey) {
      console.warn('⚠️ TELEBIRR_PUBLIC_KEY not configured - signature verification skipped');
      console.warn('⚠️ This is a SECURITY RISK - please configure TELEBIRR_PUBLIC_KEY');
      return true;
    }

    try {
      // Fields to exclude from signature verification
      const excludeFields = ['sign', 'sign_type'];
      const fieldMap: Record<string, string> = {};

      // Build field map excluding sign fields
      for (const key of Object.keys(data)) {
        if (excludeFields.includes(key)) continue;
        const value = (data as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          fieldMap[key] = String(value);
        }
      }

      // Sort keys alphabetically and build signature string
      const sortedKeys = Object.keys(fieldMap).sort();
      const stringToVerify = sortedKeys.map(key => `${key}=${fieldMap[key]}`).join('&');

      console.log('📱 String to verify:', stringToVerify);

      // Format public key
      let formattedKey = this.publicKey;
      if (!formattedKey.includes('-----BEGIN')) {
        formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
      }

      // Verify signature using RSA-PSS (SHA256withRSAandMGF1) matching the signing algorithm
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(stringToVerify);
      verify.end();

      const isValid = verify.verify(
        {
          key: formattedKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
        },
        data.sign,
        'base64'
      );

      if (isValid) {
        console.log('✅ Telebirr callback signature verified successfully');
      } else {
        console.error('❌ Telebirr callback signature verification FAILED');
      }

      return isValid;
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
      const tokenResult = await this.applyFabricToken();
      if ('error' in tokenResult) {
        return { success: false, status: 'UNKNOWN', message: tokenResult.error };
      }
      const fabricToken = tokenResult.token;

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

  /**
   * Step 8: Refund Order
   * Process a refund for a previously successful payment
   */
  async refundPayment(request: TelebirrRefundRequest): Promise<TelebirrRefundResponse> {
    console.log('📱 Telebirr Refund Request:', {
      orderId: request.orderId,
      transactionId: request.transactionId,
      amount: request.amount,
    });

    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Telebirr not configured',
      };
    }

    try {
      // Step 1: Get Fabric Token
      const tokenResult = await this.applyFabricToken();
      if ('error' in tokenResult) {
        return {
          success: false,
          error: tokenResult.error,
        };
      }
      const fabricToken = tokenResult.token;

      // Step 2: Create Refund Request
      const req: any = {
        timestamp: this.createTimestamp(),
        nonce_str: this.createNonceStr(),
        method: 'payment.refund',
        version: '1.0',
      };

      const biz = {
        appid: this.merchantAppId,
        merch_code: this.shortCode,
        merch_order_id: request.orderId,
        refund_request_no: request.transactionId, // Transaction ID from original payment
        actual_amount: request.amount.toString(),
        trans_currency: 'ETB',
        refund_reason: request.reason || 'Customer refund request',
      };

      req.biz_content = biz;
      req.sign = this.signRequestObject(req);
      req.sign_type = 'SHA256WithRSA';

      console.log('📱 Refund Request:', JSON.stringify(req, null, 2));

      const url = `${this.baseUrl}/payment/v1/merchant/refund`;
      const result = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': this.fabricAppId,
          'Authorization': fabricToken,
        },
      }, req);

      console.log('📱 Refund Response:', JSON.stringify(result, null, 2));

      if (result.result === 'SUCCESS' && result.code === '0') {
        return {
          success: true,
          refundOrderId: result.biz_content?.refund_order_id,
          refundStatus: result.biz_content?.refund_status,
        };
      }

      return {
        success: false,
        error: result.msg || 'Refund failed',
        refundStatus: result.biz_content?.refund_status,
      };
    } catch (error) {
      console.error('❌ Refund error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund service unavailable',
      };
    }
  }
}
