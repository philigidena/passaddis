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
 * Telebirr may send fields in different formats (camelCase or snake_case)
 */
export class TelebirrCallbackDto {
  // camelCase format
  outTradeNo?: string;
  transactionNo?: string;
  totalAmount?: string;
  tradeStatus?: string;
  msisdn?: string;

  // snake_case format (alternative)
  merch_order_id?: string;
  transaction_no?: string;
  total_amount?: string;
  trade_status?: string;

  // Common fields
  callback_info?: string;
  sign?: string;
  timestamp?: string;
}

export class CbeBirrCallbackDto {
  merchantId: string;
  referenceId: string;
  amount: string;
  status: string;
  transactionId: string;
}
