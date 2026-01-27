import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum PaymentMethod {
  TELEBIRR = 'TELEBIRR',     // Primary: Direct Telebirr integration
  CBE_BIRR = 'CBE_BIRR',     // Future: Direct integration
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod = PaymentMethod.TELEBIRR;
}

export class PaymentCallbackDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  status: string;
}

/**
 * Telebirr callback/notification DTO
 * Based on Telebirr C2B WebCheckout documentation (Step 7 - Notify)
 *
 * The callback includes a signature that must be verified using Telebirr's public key.
 */
export class TelebirrCallbackDto {
  // Fields from Telebirr callback notification (Step 7 in docs)
  notify_url?: string;           // Callback address
  appid?: string;                // Application ID
  notify_time?: string;          // Notification timestamp (long, UTC seconds)
  merch_code?: string;           // Merchant short code
  merch_order_id?: string;       // Order ID on merchant side (our reference)
  payment_order_id?: string;     // Order ID on Telebirr side
  total_amount?: string;         // Payment amount
  trans_id?: string;             // Transaction ID
  trans_currency?: string;       // Currency (ETB)
  trade_status?: string;         // Payment status: Completed, Pending, Paying, Expired, Failure
  trans_end_time?: string;       // Transaction end time (timestamp)
  callback_info?: string;        // Custom callback info passed during order creation
  sign?: string;                 // Response signature (SHA256WithRSA)
  sign_type?: string;            // Signature type (SHA256WithRSA)

  // Alternative camelCase format (for backward compatibility)
  outTradeNo?: string;
  transactionNo?: string;
  totalAmount?: string;
  tradeStatus?: string;
  msisdn?: string;
  transaction_no?: string;
  timestamp?: string;
}

export class CbeBirrCallbackDto {
  merchantId: string;
  referenceId: string;
  amount: string;
  status: string;
  transactionId: string;
}
