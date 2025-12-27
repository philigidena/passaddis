import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import {
  DashboardLayout,
  StatCard,
  StatusBadge,
} from '@/components/layout/DashboardLayout';
import type { AdminDashboardStats, Event } from '@/types';

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const EventsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ShopIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const OrganizersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Users', path: '/admin/users', icon: <UsersIcon /> },
  { label: 'Events', path: '/admin/events', icon: <EventsIcon /> },
  { label: 'Organizers', path: '/admin/organizers', icon: <OrganizersIcon /> },
  { label: 'Shop Items', path: '/admin/shop', icon: <ShopIcon /> },
];

export function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getPendingEvents({ page: 1 }),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (eventsRes.data) {
        setPendingEvents((eventsRes.data as any).data || []);
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

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Admin Panel" navItems={navItems} accentColor="primary">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Panel" navItems={navItems} accentColor="primary">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with PassAddis.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          subtitle={`${stats?.users.newThisMonth || 0} new this month`}
          icon={<UsersIcon />}
          color="blue"
        />
        <StatCard
          title="Events"
          value={stats?.events.total || 0}
          subtitle={`${stats?.events.pending || 0} pending approval`}
          icon={<EventsIcon />}
          color="purple"
        />
        <StatCard
          title="Tickets Sold"
          value={stats?.tickets.totalSold || 0}
          subtitle={`${stats?.tickets.thisMonth.sold || 0} this month`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.tickets.revenue || 0)}
          subtitle={`${formatCurrency(stats?.tickets.thisMonth.revenue || 0)} this month`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Events */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Pending Events</h2>
            <button
              onClick={() => navigate('/admin/events')}
              className="text-sm text-primary hover:text-primary/80"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {pendingEvents.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No pending events</p>
            ) : (
              <div className="space-y-3">
                {pendingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/admin/events/${event.id}`)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-600 flex items-center justify-center">
                        <EventsIcon />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{event.title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status="Pending" variant="warning" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Users by Role</h2>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-primary hover:text-primary/80"
            >
              Manage Users
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats?.users.byRole || {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      role === 'ADMIN' ? 'bg-red-400' :
                      role === 'ORGANIZER' ? 'bg-purple-400' :
                      role === 'SHOP_OWNER' ? 'bg-yellow-400' :
                      'bg-blue-400'
                    }`} />
                    <span className="text-gray-300 capitalize">{role.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/admin/events?status=PENDING')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-primary/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400">
            <EventsIcon />
          </div>
          <span className="text-sm text-gray-300">Review Events</span>
        </button>
        <button
          onClick={() => navigate('/admin/organizers?verified=false')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-primary/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
            <OrganizersIcon />
          </div>
          <span className="text-sm text-gray-300">Verify Organizers</span>
        </button>
        <button
          onClick={() => navigate('/admin/shop')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-primary/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
            <ShopIcon />
          </div>
          <span className="text-sm text-gray-300">Manage Shop</span>
        </button>
        <button
          onClick={() => navigate('/admin/users')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-primary/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
            <UsersIcon />
          </div>
          <span className="text-sm text-gray-300">Manage Users</span>
        </button>
      </div>
    </DashboardLayout>
  );
}
