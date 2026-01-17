import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export enum PaymentMethod {
  CHAPA = 'CHAPA',           // Recommended: Payment facilitator
  TELEBIRR = 'TELEBIRR',     // Future: Direct integration
  CBE_BIRR = 'CBE_BIRR',     // Future: Direct integration
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
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

export class TelebirrCallbackDto {
  outTradeNo: string;
  transactionNo: string;
  totalAmount: string;
  tradeStatus: string;
  msisdn: string;
}

export class CbeBirrCallbackDto {
  merchantId: string;
  referenceId: string;
  amount: string;
  status: string;
  transactionId: string;
}

// Chapa webhook payload
export class ChapaWebhookDto {
  event: string;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  charge: number;
  payment_method: string;
  reference: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
}
