import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { shopOwnerApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { ShopOrder } from '@/types';

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ScanIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2M6 4h2m8 0h2" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ItemsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', path: '/shop-owner', icon: <DashboardIcon /> },
  { label: 'Items', path: '/shop-owner/items', icon: <ItemsIcon /> },
  { label: 'Orders', path: '/shop-owner/orders', icon: <OrdersIcon /> },
  { label: 'Scan Pickup', path: '/shop-owner/scan', icon: <ScanIcon /> },
  { label: 'Settings', path: '/shop-owner/settings', icon: <SettingsIcon /> },
];

const statusFilters = [
  { label: 'All Orders', value: '' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function ShopOwnerOrders() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    if (!authLoading && !['SHOP_OWNER', 'ADMIN'].includes(user?.role || '')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'SHOP_OWNER' || user?.role === 'ADMIN') {
      loadOrders();
    }
  }, [user, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await shopOwnerApi.getOrders(statusFilter || undefined);
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: 'READY_FOR_PICKUP' | 'COMPLETED') => {
    setUpdatingStatus(orderId);
    try {
      const response = await shopOwnerApi.updateOrderStatus(orderId, newStatus);
      if (response.data) {
        // Update local state
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'READY_FOR_PICKUP': return 'info';
      case 'PAID': return 'warning';
      case 'PENDING': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP': return 'Ready for Pickup';
      case 'COMPLETED': return 'Completed';
      case 'PAID': return 'Paid';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Shop Owner Portal" navItems={navItems} accentColor="orange">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Shop Owner Portal" navItems={navItems} accentColor="orange">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 mt-1">Manage customer orders</p>
        </div>
        <DashboardButton
          onClick={() => navigate('/shop-owner/scan')}
          variant="primary"
        >
          <ScanIcon />
          Scan Pickup
        </DashboardButton>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSearchParams(filter.value ? { status: filter.value } : {})}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <OrdersIcon />
            </div>
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-white">#{order.orderNumber}</span>
                      <StatusBadge
                        status={getStatusLabel(order.status)}
                        variant={getStatusVariant(order.status)}
                      />
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>{order.items.length} item(s)</p>
                      <p className="font-medium text-orange-400">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {order.status === 'PAID' && (
                      <DashboardButton
                        onClick={() => handleStatusUpdate(order.id, 'READY_FOR_PICKUP')}
                        variant="secondary"
                        size="sm"
                        disabled={updatingStatus === order.id}
                      >
                        {updatingStatus === order.id ? 'Updating...' : 'Mark Ready'}
                      </DashboardButton>
                    )}
                    {order.status === 'READY_FOR_PICKUP' && (
                      <DashboardButton
                        onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                        variant="primary"
                        size="sm"
                        disabled={updatingStatus === order.id}
                      >
                        {updatingStatus === order.id ? 'Updating...' : 'Complete Pickup'}
                      </DashboardButton>
                    )}
                    <DashboardButton
                      onClick={() => setSelectedOrder(order)}
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </DashboardButton>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {item.quantity}x {item.shopItem.name}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Order #{selectedOrder.orderNumber}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <StatusBadge
                  status={getStatusLabel(selectedOrder.status)}
                  variant={getStatusVariant(selectedOrder.status)}
                />
              </div>
            </div>

            <div className="p-6">
              {/* Items */}
              <h3 className="text-sm font-medium text-gray-400 mb-3">ORDER ITEMS</h3>
              <div className="space-y-3 mb-6">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.shopItem.imageUrl ? (
                        <img
                          src={item.shopItem.imageUrl}
                          alt={item.shopItem.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{item.shopItem.name}</p>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-white font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Service Fee</span>
                  <span>{formatCurrency(selectedOrder.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-400">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* QR Code */}
              {selectedOrder.qrCode && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center">
                  <p className="text-sm text-gray-400 mb-2">Pickup Code</p>
                  <p className="font-mono text-lg text-white">{selectedOrder.qrCode}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                {selectedOrder.status === 'PAID' && (
                  <DashboardButton
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'READY_FOR_PICKUP')}
                    variant="secondary"
                    className="flex-1"
                    disabled={updatingStatus === selectedOrder.id}
                  >
                    {updatingStatus === selectedOrder.id ? 'Updating...' : 'Mark Ready for Pickup'}
                  </DashboardButton>
                )}
                {selectedOrder.status === 'READY_FOR_PICKUP' && (
                  <DashboardButton
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'COMPLETED')}
                    variant="primary"
                    className="flex-1"
                    disabled={updatingStatus === selectedOrder.id}
                  >
                    {updatingStatus === selectedOrder.id ? 'Updating...' : 'Complete Pickup'}
                  </DashboardButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
