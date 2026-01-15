import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shopApi, ShopOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ShopOrdersScreen() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await shopApi.getMyOrders();
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      const response = await shopApi.cancelOrder(selectedOrder.id, cancelReason);
      if (response.data) {
        setOrders(orders.map(o =>
          o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o
        ));
        Alert.alert('Success', 'Order cancelled successfully');
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedOrder(null);
      } else {
        Alert.alert('Error', response.error || 'Failed to cancel order');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'PAID': return '#3B82F6';
      case 'READY_FOR_PICKUP': return '#8B5CF6';
      case 'COMPLETED': return '#10B981';
      case 'CANCELLED': return '#EF4444';
      case 'REFUNDED': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending Payment';
      case 'PAID': return 'Paid';
      case 'READY_FOR_PICKUP': return 'Ready for Pickup';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      case 'REFUNDED': return 'Refunded';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="log-in-outline" size={64} color="#6B7280" />
          <Text style={styles.emptyTitle}>Sign in Required</Text>
          <Text style={styles.emptySubtitle}>Please sign in to view your orders</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/signin')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#6B7280" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>Your shop orders will appear here</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/shop')}
          >
            <Text style={styles.shopButtonText}>Browse Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
            />
          }
        >
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => setSelectedOrder(order)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderItems}>
                {order.items.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    {item.shopItem.imageUrl ? (
                      <Image source={{ uri: item.shopItem.imageUrl }} style={styles.itemImage} />
                    ) : (
                      <View style={[styles.itemImage, styles.placeholderImage]}>
                        <Ionicons name="cube-outline" size={16} color="#6B7280" />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.shopItem.name}</Text>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                ))}
                {order.items.length > 3 && (
                  <Text style={styles.moreItems}>+{order.items.length - 3} more items</Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{formatCurrency(order.total)}</Text>
              </View>

              {['PENDING', 'PAID'].includes(order.status) && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                    setShowCancelModal(true);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Order Detail Modal */}
      <Modal
        visible={selectedOrder !== null && !showCancelModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order #{selectedOrder.orderNumber}</Text>
                <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {/* Status */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedOrder.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status) }]}>
                      {getStatusLabel(selectedOrder.status)}
                    </Text>
                  </View>
                </View>

                {/* QR Code */}
                {selectedOrder.qrCode && ['PAID', 'READY_FOR_PICKUP'].includes(selectedOrder.status) && (
                  <View style={styles.qrSection}>
                    <Text style={styles.qrLabel}>Show this at pickup</Text>
                    <View style={styles.qrContainer}>
                      <Text style={styles.qrCode}>{selectedOrder.qrCode}</Text>
                    </View>
                  </View>
                )}

                {/* Items */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Items</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.detailItem}>
                      {item.shopItem.imageUrl ? (
                        <Image source={{ uri: item.shopItem.imageUrl }} style={styles.detailItemImage} />
                      ) : (
                        <View style={[styles.detailItemImage, styles.placeholderImage]}>
                          <Ionicons name="cube-outline" size={20} color="#6B7280" />
                        </View>
                      )}
                      <View style={styles.detailItemInfo}>
                        <Text style={styles.detailItemName}>{item.shopItem.name}</Text>
                        <Text style={styles.detailItemMeta}>
                          {formatCurrency(item.price)} x {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.detailItemTotal}>
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalRowLabel}>Subtotal</Text>
                    <Text style={styles.totalRowValue}>{formatCurrency(selectedOrder.subtotal)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalRowLabel}>Service Fee</Text>
                    <Text style={styles.totalRowValue}>{formatCurrency(selectedOrder.serviceFee)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.totalRowFinal]}>
                    <Text style={styles.totalRowLabelFinal}>Total</Text>
                    <Text style={styles.totalRowValueFinal}>{formatCurrency(selectedOrder.total)}</Text>
                  </View>
                </View>

                {/* Pickup Location */}
                {selectedOrder.pickupLocation && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Pickup Location</Text>
                    <View style={styles.locationCard}>
                      <Ionicons name="location-outline" size={20} color="#F97316" />
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{selectedOrder.pickupLocation.name}</Text>
                        <Text style={styles.locationAddress}>
                          {selectedOrder.pickupLocation.area} - {selectedOrder.pickupLocation.hours}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Cancel Button */}
                {['PENDING', 'PAID'].includes(selectedOrder.status) && (
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowCancelModal(true)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel Order</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalContent}>
            <Text style={styles.cancelModalTitle}>Cancel Order</Text>
            <Text style={styles.cancelModalSubtitle}>
              Please provide a reason for cancellation
            </Text>

            <TextInput
              style={styles.cancelInput}
              placeholder="Reason for cancellation..."
              placeholderTextColor="#6B7280"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
            />

            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalBack}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                <Text style={styles.cancelModalBackText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelModalConfirm, cancelling && styles.buttonDisabled]}
                onPress={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.cancelModalConfirmText}>Confirm Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    marginTop: 24,
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  shopButton: {
    marginTop: 24,
    backgroundColor: '#F97316',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  moreItems: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalScroll: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  qrLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  qrCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'monospace',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  detailItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  detailItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  detailItemMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  detailItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  totalsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRowLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  totalRowValue: {
    fontSize: 14,
    color: '#fff',
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
    paddingTop: 12,
    marginTop: 8,
  },
  totalRowLabelFinal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  totalRowValueFinal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  locationAddress: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalCancelButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cancelModalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  cancelModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cancelModalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  cancelInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cancelModalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelModalBack: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  cancelModalBackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelModalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  cancelModalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
