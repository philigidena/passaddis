/**
 * PassAddis Pay - Reusable Payment Component
 *
 * A standalone payment component that can be embedded in any React Native app.
 * Designed for reusability across multiple platforms beyond PassAddis.
 *
 * Usage:
 * <PassAddisPay
 *   amount={1000}
 *   orderId="order_123"
 *   description="Event Ticket"
 *   onSuccess={(payment) => console.log('Paid!', payment)}
 *   onError={(error) => console.log('Error:', error)}
 *   onCancel={() => console.log('Cancelled')}
 * />
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  useColorScheme,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentsApi, PaymentInitiation } from '../../services/api';

// PassAddis Pay brand colors (can be customized by integrators)
const PASSADDIS_GREEN = '#00A86B';
const PASSADDIS_DARK = '#1A1A2E';

export type PaymentMethod = 'TELEBIRR' | 'CBE_BIRR';

export interface PaymentResult {
  orderId: string;
  txRef: string;
  status: 'success' | 'pending' | 'failed';
  method: PaymentMethod;
  amount: number;
}

export interface PassAddisPayProps {
  /** Amount in ETB */
  amount: number;
  /** Order ID from your system */
  orderId: string;
  /** Description shown to user */
  description?: string;
  /** Customer email for receipt */
  email?: string;
  /** Customer phone number */
  phone?: string;
  /** Customer name */
  customerName?: string;
  /** Called when payment succeeds */
  onSuccess?: (result: PaymentResult) => void;
  /** Called when payment fails */
  onError?: (error: string) => void;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Custom button text */
  buttonText?: string;
  /** Show as modal or inline */
  displayMode?: 'button' | 'inline';
  /** Custom primary color */
  primaryColor?: string;
  /** Disable the component */
  disabled?: boolean;
  /** Show PassAddis branding */
  showBranding?: boolean;
}

const PAYMENT_METHODS = [
  {
    id: 'TELEBIRR' as PaymentMethod,
    name: 'Telebirr',
    description: 'Pay with your Telebirr wallet',
    icon: 'phone-portrait-outline',
    recommended: true,
  },
];

export function PassAddisPay({
  amount,
  orderId,
  description,
  email,
  phone,
  customerName,
  onSuccess,
  onError,
  onCancel,
  buttonText = 'Pay with PassAddis',
  displayMode = 'button',
  primaryColor = PASSADDIS_GREEN,
  disabled = false,
  showBranding = true,
}: PassAddisPayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('TELEBIRR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'redirecting' | 'verifying'>('idle');

  const backgroundColor = isDark ? PASSADDIS_DARK : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
  const secondaryText = isDark ? '#A1A1AA' : '#6B7280';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const formatAmount = (amt: number) => {
    return amt.toLocaleString('en-ET') + ' ETB';
  };

  const handlePayPress = () => {
    if (displayMode === 'button') {
      setIsModalVisible(true);
    } else {
      initiatePayment();
    }
  };

  const initiatePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const response = await paymentsApi.initiate(orderId, selectedMethod);

      if (response.error || !response.data) {
        onError?.(response.error || 'Failed to initiate payment');
        setIsProcessing(false);
        setPaymentStatus('idle');
        return;
      }

      setPaymentStatus('redirecting');
      // API returns both checkout_url and checkoutUrl, tx_ref and txRef
      const checkoutUrl = response.data.checkoutUrl || response.data.checkout_url;
      const txRef = response.data.txRef || response.data.tx_ref;

      // Open Telebirr checkout in browser
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);

        // Start polling for payment status
        setPaymentStatus('verifying');
        pollPaymentStatus(orderId, txRef);
      } else {
        onError?.('Cannot open payment page');
        setIsProcessing(false);
        setPaymentStatus('idle');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
      setPaymentStatus('idle');
    }
  };

  const pollPaymentStatus = async (oid: string, txRef: string, attempts = 0) => {
    const MAX_ATTEMPTS = 60; // 5 minutes with 5s interval
    const POLL_INTERVAL = 5000;

    if (attempts >= MAX_ATTEMPTS) {
      setIsProcessing(false);
      setPaymentStatus('idle');
      onError?.('Payment verification timeout. Please check your order status.');
      return;
    }

    try {
      const response = await paymentsApi.verify(oid);

      if (response.data?.verified) {
        setIsProcessing(false);
        setPaymentStatus('idle');
        setIsModalVisible(false);
        onSuccess?.({
          orderId: oid,
          txRef,
          status: 'success',
          method: selectedMethod,
          amount,
        });
        return;
      }

      if (response.data?.status === 'FAILED') {
        setIsProcessing(false);
        setPaymentStatus('idle');
        onError?.('Payment failed. Please try again.');
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(oid, txRef, attempts + 1), POLL_INTERVAL);
    } catch (error) {
      // Continue polling on network errors
      setTimeout(() => pollPaymentStatus(oid, txRef, attempts + 1), POLL_INTERVAL);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsProcessing(false);
    setPaymentStatus('idle');
    onCancel?.();
  };

  const renderPayButton = () => (
    <TouchableOpacity
      style={[
        styles.payButton,
        { backgroundColor: disabled ? secondaryText : primaryColor },
      ]}
      onPress={handlePayPress}
      disabled={disabled || isProcessing}
      activeOpacity={0.8}
    >
      {isProcessing ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.payButtonText}>{buttonText}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderPaymentMethods = () => (
    <View style={styles.methodsContainer}>
      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            {
              backgroundColor: isDark ? '#252540' : '#F8F9FA',
              borderColor: selectedMethod === method.id ? primaryColor : borderColor,
              borderWidth: selectedMethod === method.id ? 2 : 1,
            },
          ]}
          onPress={() => setSelectedMethod(method.id)}
          disabled={isProcessing}
        >
          <View style={styles.methodHeader}>
            <View style={[styles.methodIcon, { backgroundColor: `${primaryColor}20` }]}>
              <Ionicons name={method.icon as any} size={24} color={primaryColor} />
            </View>
            <View style={styles.methodInfo}>
              <View style={styles.methodTitleRow}>
                <Text style={[styles.methodName, { color: textColor }]}>{method.name}</Text>
                {method.recommended && (
                  <View style={[styles.recommendedBadge, { backgroundColor: primaryColor }]}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.methodDescription, { color: secondaryText }]}>
                {method.description}
              </Text>
            </View>
            <View style={[
              styles.radioOuter,
              { borderColor: selectedMethod === method.id ? primaryColor : secondaryText }
            ]}>
              {selectedMethod === method.id && (
                <View style={[styles.radioInner, { backgroundColor: primaryColor }]} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderModalContent = () => (
    <View style={[styles.modalContent, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
        {showBranding && (
          <View style={styles.brandingRow}>
            <LinearGradient
              colors={[primaryColor, '#006644']}
              style={styles.brandLogo}
            >
              <Text style={styles.brandLogoText}>P</Text>
            </LinearGradient>
            <Text style={[styles.brandName, { color: textColor }]}>PassAddis Pay</Text>
          </View>
        )}
        <View style={{ width: 32 }} />
      </View>

      {/* Order Summary */}
      <View style={[styles.orderSummary, { backgroundColor: isDark ? '#252540' : '#F8F9FA' }]}>
        <Text style={[styles.orderLabel, { color: secondaryText }]}>
          {description || 'Order Payment'}
        </Text>
        <Text style={[styles.orderAmount, { color: textColor }]}>
          {formatAmount(amount)}
        </Text>
      </View>

      {/* Payment Methods */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Select Payment Method</Text>
      {renderPaymentMethods()}

      {/* Status Message */}
      {paymentStatus !== 'idle' && (
        <View style={[styles.statusContainer, { backgroundColor: `${primaryColor}10` }]}>
          <ActivityIndicator color={primaryColor} size="small" />
          <Text style={[styles.statusText, { color: primaryColor }]}>
            {paymentStatus === 'processing' && 'Initiating payment...'}
            {paymentStatus === 'redirecting' && 'Opening payment page...'}
            {paymentStatus === 'verifying' && 'Waiting for payment confirmation...'}
          </Text>
        </View>
      )}

      {/* Pay Button */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          { backgroundColor: isProcessing ? secondaryText : primaryColor },
        ]}
        onPress={initiatePayment}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Pay {formatAmount(amount)}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={14} color={secondaryText} />
        <Text style={[styles.securityText, { color: secondaryText }]}>
          Secured by PassAddis Pay. Your payment is protected.
        </Text>
      </View>
    </View>
  );

  if (displayMode === 'inline') {
    return renderModalContent();
  }

  return (
    <>
      {renderPayButton()}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
  },
  orderSummary: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  orderAmount: {
    fontSize: 32,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  methodsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  methodCard: {
    padding: 16,
    borderRadius: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
  },
  recommendedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  methodDescription: {
    fontSize: 13,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
  },
});

export default PassAddisPay;
