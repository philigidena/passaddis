/**
 * PassAddis Pay - Export Module
 *
 * This module exports the PassAddisPay component and related types
 * for use in other applications.
 *
 * Installation for external platforms:
 * npm install @passaddis/pay
 *
 * Usage:
 * import { PassAddisPay } from '@passaddis/pay';
 *
 * <PassAddisPay
 *   amount={1000}
 *   orderId="order_123"
 *   onSuccess={(result) => console.log('Payment successful:', result)}
 *   onError={(error) => console.log('Payment failed:', error)}
 * />
 */

export { PassAddisPay, default } from './PassAddisPay';
export type {
  PassAddisPayProps,
  PaymentMethod,
  PaymentResult,
} from './PassAddisPay';
