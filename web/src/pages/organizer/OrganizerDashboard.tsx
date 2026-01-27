import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { organizerApi } from '@/lib/api';
import {
  DashboardLayout,
  StatCard,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { OrganizerDashboardStats, Event } from '@/types';

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const EventsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', path: '/organizer', icon: <DashboardIcon /> },
  { label: 'My Events', path: '/organizer/events', icon: <EventsIcon /> },
  { label: 'Wallet', path: '/organizer/wallet', icon: <WalletIcon /> },
  { label: 'Settings', path: '/organizer/settings', icon: <SettingsIcon /> },
];

type MerchantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | null;

export function OrganizerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrganizerDashboardStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [merchantStatus, setMerchantStatus] = useState<MerchantStatus>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If user has ORGANIZER or ADMIN role, load the dashboard
    if (['ORGANIZER', 'ADMIN'].includes(user?.role || '')) {
      loadDashboard();
    } else if (user?.role === 'USER' || user?.role === 'SHOP_OWNER') {
      // User wants to become an organizer - show the onboarding view
      setNeedsProfile(true);
      setLoading(false);
    } else {
      // Unknown role or not logged in, redirect to home
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardRes, eventsRes] = await Promise.all([
        organizerApi.getDashboard(),
        organizerApi.getMyEvents(),
      ]);

      if (dashboardRes.data) {
        setStats(dashboardRes.data);
        setNeedsProfile(false);

        // Check merchant status from profile
        const status = dashboardRes.data.profile?.status as MerchantStatus;
        if (status) {
          setMerchantStatus(status);
        } else {
          setMerchantStatus('ACTIVE'); // Fallback for legacy data
        }
      } else if (dashboardRes.error?.includes('not found')) {
        setNeedsProfile(true);
      }

      if (eventsRes.data) {
        setEvents(eventsRes.data);
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
      case 'PUBLISHED': return 'success';
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'REJECTED': return 'error';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  // Onboarding View for new organizers
  if (needsProfile) {
    return (
      <DashboardLayout title="Organizer Portal" navItems={navItems} accentColor="purple">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Become an Event Organizer
          </h1>
          <p className="text-gray-400 max-w-md mb-8">
            Create and manage events on PassAddis. Start by setting up your organizer profile.
          </p>
          <DashboardButton
            onClick={() => navigate('/organizer/settings')}
            variant="primary"
            size="lg"
          >
            Create Organizer Profile
          </DashboardButton>
        </div>
      </DashboardLayout>
    );
  }

  // Pending Approval View
  if (merchantStatus === 'PENDING') {
    return (
      <DashboardLayout title="Organizer Portal" navItems={navItems} accentColor="purple">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Application Pending Approval
          </h1>
          <p className="text-gray-400 max-w-md mb-4">
            Thank you for applying to become a PassAddis event organizer! Your application is currently being reviewed by our team.
          </p>
          <p className="text-gray-500 text-sm max-w-md mb-8">
            This usually takes 24-48 hours. You'll receive a notification once your account is activated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <DashboardButton
              onClick={() => navigate('/organizer/settings')}
              variant="secondary"
            >
              View Profile
            </DashboardButton>
            <DashboardButton
              onClick={() => navigate('/organizer/events/new')}
              variant="primary"
            >
              Draft Your First Event
            </DashboardButton>
          </div>
          <p className="text-gray-500 text-xs mt-6">
            You can create draft events while waiting for approval. They'll be ready to publish once you're activated.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Suspended/Blocked View
  if (merchantStatus === 'SUSPENDED' || merchantStatus === 'BLOCKED') {
    return (
      <DashboardLayout title="Organizer Portal" navItems={navItems} accentColor="purple">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Account {merchantStatus === 'SUSPENDED' ? 'Suspended' : 'Blocked'}
          </h1>
          <p className="text-gray-400 max-w-md mb-8">
            Your organizer account has been {merchantStatus.toLowerCase()}. Please contact our support team for assistance.
          </p>
          <DashboardButton
            onClick={() => window.location.href = 'mailto:support@passaddis.com'}
            variant="primary"
          >
            Contact Support
          </DashboardButton>
        </div>
      </DashboardLayout>
    );
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Organizer Portal" navItems={navItems} accentColor="purple">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Organizer Portal" navItems={navItems} accentColor="purple">
      {/* Profile Status Banner - show for unverified but ACTIVE merchants */}
      {stats && merchantStatus === 'ACTIVE' && !stats.profile.isVerified && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-400">Profile Verification Pending</p>
              <p className="text-sm text-gray-400 mt-1">
                Your organizer profile is pending verification. You can still create events, but they will need admin approval before publishing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome, {stats?.profile.businessName || 'Organizer'}
          </h1>
          <p className="text-gray-400 mt-1">Here's your event performance overview</p>
        </div>
        <DashboardButton
          onClick={() => navigate('/organizer/events/new')}
          variant="primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </DashboardButton>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Events"
          value={stats?.events.total || 0}
          subtitle={`${stats?.events.published || 0} published`}
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
          title="Total Revenue"
          value={formatCurrency(stats?.tickets.revenue || 0)}
          subtitle={`${formatCurrency(stats?.tickets.thisMonth.revenue || 0)} this month`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="Wallet Balance"
          value={formatCurrency(stats?.wallet.balance || 0)}
          subtitle={`${formatCurrency(stats?.wallet.pendingSettlement || 0)} pending`}
          icon={<WalletIcon />}
          color="blue"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Status Breakdown */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Event Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { label: 'Draft', count: stats?.events.draft || 0, color: 'bg-gray-400' },
                { label: 'Pending Approval', count: stats?.events.pending || 0, color: 'bg-yellow-400' },
                { label: 'Approved', count: stats?.events.approved || 0, color: 'bg-blue-400' },
                { label: 'Published', count: stats?.events.published || 0, color: 'bg-green-400' },
                { label: 'Rejected', count: stats?.events.rejected || 0, color: 'bg-red-400' },
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
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Recent Events</h2>
            <button
              onClick={() => navigate('/organizer/events')}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No events yet</p>
                <DashboardButton
                  onClick={() => navigate('/organizer/events/new')}
                  variant="secondary"
                  size="sm"
                >
                  Create Your First Event
                </DashboardButton>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/organizer/events/${event.id}`)}
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
                    <StatusBadge
                      status={event.status}
                      variant={getStatusVariant(event.status)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/organizer/events/new')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm text-gray-300">New Event</span>
        </button>
        <button
          onClick={() => navigate('/organizer/events?status=DRAFT')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-gray-500/20 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span className="text-sm text-gray-300">Drafts</span>
        </button>
        <button
          onClick={() => navigate('/organizer/wallet')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-colors"
        >
          <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
            <WalletIcon />
          </div>
          <span className="text-sm text-gray-300">Wallet</span>
        </button>
        <button
          onClick={() => navigate('/organizer/settings')}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-colors"
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
