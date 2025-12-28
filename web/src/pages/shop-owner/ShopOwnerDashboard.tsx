import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { shopOwnerApi } from '@/lib/api';
import {
  DashboardLayout,
  StatCard,
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

const navItems = [
  { label: 'Dashboard', path: '/shop-owner', icon: <DashboardIcon /> },
  { label: 'Orders', path: '/shop-owner/orders', icon: <OrdersIcon /> },
  { label: 'Scan Pickup', path: '/shop-owner/scan', icon: <ScanIcon /> },
  { label: 'Settings', path: '/shop-owner/settings', icon: <SettingsIcon /> },
];

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  readyForPickup: number;
  completedToday: number;
  totalOrders: number;
  totalRevenue: number;
}

export function ShopOwnerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !['SHOP_OWNER', 'ADMIN'].includes(user?.role || '')) {
      if (user?.role === 'USER') {
        setNeedsProfile(true);
        setLoading(false);
      } else {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'SHOP_OWNER' || user?.role === 'ADMIN') {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardRes, ordersRes] = await Promise.all([
        shopOwnerApi.getDashboard(),
        shopOwnerApi.getOrders(),
      ]);

      if (dashboardRes.data) {
        setStats(dashboardRes.data);
        setNeedsProfile(false);
      } else if (dashboardRes.error?.includes('not found')) {
        setNeedsProfile(true);
      }

      if (ordersRes.data) {
        setRecentOrders(ordersRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
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
      case 'READY_FOR_PICKUP': return 'Ready';
      case 'COMPLETED': return 'Completed';
      case 'PAID': return 'Paid';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  // Onboarding View for new shop owners
  if (needsProfile) {
    return (
      <DashboardLayout title="Shop Owner Portal" navItems={navItems} accentColor="orange">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Become a Shop Partner
          </h1>
          <p className="text-gray-400 max-w-md mb-8">
            Partner with PassAddis to sell refreshments at events. Set up your shop profile to get started.
          </p>
          <DashboardButton
            onClick={() => navigate('/shop-owner/settings')}
            variant="primary"
            size="lg"
          >
            Create Shop Profile
          </DashboardButton>
        </div>
      </DashboardLayout>
    );
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Shop Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage orders and pickups</p>
        </div>
        <DashboardButton
          onClick={() => navigate('/shop-owner/scan')}
          variant="primary"
        >
          <ScanIcon />
          Scan Pickup
        </DashboardButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          subtitle={formatCurrency(stats?.todayRevenue || 0)}
          icon={<OrdersIcon />}
          color="orange"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          subtitle="Awaiting preparation"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="Ready for Pickup"
          value={stats?.readyForPickup || 0}
          subtitle="Awaiting customer"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          subtitle="Successfully picked up"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <button
              onClick={() => navigate('/shop-owner/orders')}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/shop-owner/orders/${order.id}`)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <OrdersIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-400">
                        {order.items.length} item(s) • {formatCurrency(order.total)}
                      </p>
                    </div>
                    <StatusBadge
                      status={getStatusLabel(order.status)}
                      variant={getStatusVariant(order.status)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Order Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { label: 'Pending Payment', count: 0, color: 'bg-gray-400' },
                { label: 'Paid (Prepare Now)', count: stats?.pendingOrders || 0, color: 'bg-yellow-400' },
                { label: 'Ready for Pickup', count: stats?.readyForPickup || 0, color: 'bg-blue-400' },
                { label: 'Completed Today', count: stats?.completedToday || 0, color: 'bg-green-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-gray-300">{item.label}</span>
                  </div>
                  <span className="font-semibold text-white">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Total Stats */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">Total Orders (All Time)</span>
                <span className="font-semibold text-white">{stats?.totalOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Revenue</span>
                <span className="font-bold text-orange-400">{formatCurrency(stats?.totalRevenue || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/shop-owner/orders?status=PAID')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-orange-500/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm text-gray-300">Pending</span>
        </button>
        <button
          onClick={() => navigate('/shop-owner/orders?status=READY_FOR_PICKUP')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-orange-500/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <span className="text-sm text-gray-300">Ready</span>
        </button>
        <button
          onClick={() => navigate('/shop-owner/scan')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-orange-500/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400">
            <ScanIcon />
          </div>
          <span className="text-sm text-gray-300">Scan</span>
        </button>
        <button
          onClick={() => navigate('/shop-owner/settings')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-orange-500/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
            <SettingsIcon />
          </div>
          <span className="text-sm text-gray-300">Settings</span>
        </button>
      </div>
    </DashboardLayout>
  );
}
