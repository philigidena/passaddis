import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { shopApi } from '@/lib/api';
import type { ShopOrder } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import clsx from 'clsx';

const STATUS_STEPS = ['PAID', 'READY_FOR_PICKUP', 'COMPLETED'];

const STATUS_CONFIG: Record<string, { label: string; description: string; color: string }> = {
  PENDING: {
    label: 'Pending Payment',
    description: 'Complete your payment to confirm the order',
    color: 'text-warning',
  },
  PAID: {
    label: 'Order Confirmed',
    description: 'Your order is being prepared',
    color: 'text-primary',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    description: 'Show the QR code at the pickup location',
    color: 'text-success',
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Order has been picked up',
    color: 'text-white/60',
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'This order has been cancelled',
    color: 'text-danger',
  },
  REFUNDED: {
    label: 'Refunded',
    description: 'Payment has been refunded',
    color: 'text-white/40',
  },
};

export function ShopOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    const result = await shopApi.getOrder(id);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setOrder(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-danger mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Order not found</h2>
          <p className="text-white/60 mb-6">{error || 'This order could not be loaded'}</p>
          <Link to="/shop/orders" className="text-primary hover:underline">
            Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const showQR = order.status === 'READY_FOR_PICKUP' && order.qrCode;

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg">
        {/* Header */}
        <div className="bg-dark-card border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              to="/shop/orders"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Card */}
          <div className="bg-dark-card rounded-xl border border-white/5 p-6 mb-6">
            <div className={clsx('flex items-center gap-3 mb-2', statusConfig.color)}>
              {order.status === 'READY_FOR_PICKUP' ? (
                <Package className="w-6 h-6" />
              ) : order.status === 'COMPLETED' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
              <h2 className="text-xl font-semibold">{statusConfig.label}</h2>
            </div>
            <p className="text-white/60">{statusConfig.description}</p>

            {/* Progress Steps */}
            {!['CANCELLED', 'REFUNDED', 'PENDING'].includes(order.status) && (
              <div className="mt-6 flex items-center gap-2">
                {STATUS_STEPS.map((step, index) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div
                      className={clsx(
                        'w-full h-2 rounded-full',
                        index <= currentStepIndex ? 'bg-primary' : 'bg-white/10'
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Code for Pickup */}
          {showQR && (
            <div className="bg-dark-card rounded-xl border border-white/5 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white text-center mb-4">
                Pickup QR Code
              </h3>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG
                    value={order.qrCode || ''}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
              <p className="text-white/60 text-center mt-4 text-sm">
                Show this code at the pickup location
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-dark-card rounded-xl border border-white/5 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.shopItem.imageUrl || 'https://via.placeholder.com/60'}
                    alt={item.shopItem.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.shopItem.name}</h4>
                    <p className="text-white/40 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-white font-medium">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>{order.subtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Service Fee</span>
                <span>{order.serviceFee.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-lg pt-2">
                <span>Total</span>
                <span>{order.total.toLocaleString()} ETB</span>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="text-center">
            <Link to="/shop" className="text-primary hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
