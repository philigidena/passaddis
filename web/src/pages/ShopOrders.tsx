import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Loader2, MapPin, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { shopApi } from '@/lib/api';
import type { ShopOrder } from '@/types';
import clsx from 'clsx';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  PENDING: { label: 'Pending Payment', color: 'text-warning', icon: Clock },
  PAID: { label: 'Paid', color: 'text-primary', icon: CheckCircle },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: 'text-success', icon: Package },
  COMPLETED: { label: 'Completed', color: 'text-white/60', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-danger', icon: Clock },
  REFUNDED: { label: 'Refunded', color: 'text-white/40', icon: Clock },
};

export function ShopOrdersPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const result = await shopApi.getMyOrders();
    if (result.data) {
      setOrders(result.data);
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

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg">
        {/* Header */}
        <div className="bg-dark-card border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-white mb-2">My Shop Orders</h1>
            <p className="text-white/60">Track your orders and pickup status</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
              <p className="text-white/60 mb-6">
                Your shop orders will appear here after you make a purchase.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Browse Shop <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function OrderCard({ order }: { order: ShopOrder }) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <Link
      to={`/shop/orders/${order.id}`}
      className="block bg-dark-card rounded-xl border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/40 text-sm">Order #{order.orderNumber}</p>
            <div className={clsx('flex items-center gap-2 mt-1', statusConfig.color)}>
              <StatusIcon className="w-4 h-4" />
              <span className="font-medium">{statusConfig.label}</span>
            </div>
          </div>
          <p className="text-white font-semibold">{order.total.toLocaleString()} ETB</p>
        </div>

        {/* Items Preview */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, i) => (
              <img
                key={item.id}
                src={item.shopItem.imageUrl || 'https://via.placeholder.com/40'}
                alt={item.shopItem.name}
                className="w-10 h-10 rounded-lg object-cover border-2 border-dark-card"
                style={{ zIndex: 3 - i }}
              />
            ))}
            {order.items.length > 3 && (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border-2 border-dark-card">
                <span className="text-white/60 text-xs">+{order.items.length - 3}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white/60 text-sm">
              {order.items.map(i => `${i.quantity}x ${i.shopItem.name}`).join(', ')}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/40" />
        </div>
      </div>
    </Link>
  );
}
