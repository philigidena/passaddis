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
 * All fields must have @IsOptional() so forbidNonWhitelisted doesn't reject them.
 */
export class TelebirrCallbackDto {
  // Fields from Telebirr callback notification (Step 7 in docs)
  @IsOptional()
  @IsString()
  notify_url?: string;           // Callback address

  @IsOptional()
  @IsString()
  appid?: string;                // Application ID

  @IsOptional()
  @IsString()
  notify_time?: string;          // Notification timestamp (long, UTC seconds)

  @IsOptional()
  @IsString()
  merch_code?: string;           // Merchant short code

  @IsOptional()
  @IsString()
  merch_order_id?: string;       // Order ID on merchant side (our reference)

  @IsOptional()
  @IsString()
  payment_order_id?: string;     // Order ID on Telebirr side

  @IsOptional()
  @IsString()
  total_amount?: string;         // Payment amount

  @IsOptional()
  @IsString()
  trans_id?: string;             // Transaction ID

  @IsOptional()
  @IsString()
  trans_currency?: string;       // Currency (ETB)

  @IsOptional()
  @IsString()
  trade_status?: string;         // Payment status: Completed, Pending, Paying, Expired, Failure

  @IsOptional()
  @IsString()
  trans_end_time?: string;       // Transaction end time (timestamp)

  @IsOptional()
  @IsString()
  callback_info?: string;        // Custom callback info passed during order creation

  @IsOptional()
  @IsString()
  sign?: string;                 // Response signature (SHA256WithRSA)

  @IsOptional()
  @IsString()
  sign_type?: string;            // Signature type (SHA256WithRSA)

  // Alternative camelCase format (for backward compatibility)
  @IsOptional()
  @IsString()
  outTradeNo?: string;

  @IsOptional()
  @IsString()
  transactionNo?: string;

  @IsOptional()
  @IsString()
  totalAmount?: string;

  @IsOptional()
  @IsString()
  tradeStatus?: string;

  @IsOptional()
  @IsString()
  msisdn?: string;

  @IsOptional()
  @IsString()
  transaction_no?: string;

  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class CbeBirrCallbackDto {
  merchantId: string;
  referenceId: string;
  amount: string;
  status: string;
  transactionId: string;
}
