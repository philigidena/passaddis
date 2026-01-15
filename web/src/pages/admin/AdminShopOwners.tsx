import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { MerchantProfile } from '@/types';

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

const PromosIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const StoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Users', path: '/admin/users', icon: <UsersIcon /> },
  { label: 'Events', path: '/admin/events', icon: <EventsIcon /> },
  { label: 'Organizers', path: '/admin/organizers', icon: <OrganizersIcon /> },
  { label: 'Shop Owners', path: '/admin/shop-owners', icon: <StoreIcon /> },
  { label: 'Shop Items', path: '/admin/shop', icon: <ShopIcon /> },
  { label: 'Promo Codes', path: '/admin/promos', icon: <PromosIcon /> },
];

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

interface ShopOwnerWithStats extends MerchantProfile {
  orderCount?: number;
  _count?: { shopItems: number };
  stats?: {
    totalItems: number;
    totalOrders: number;
    totalRevenue: number;
  };
}

export function AdminShopOwners() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [shopOwners, setShopOwners] = useState<ShopOwnerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShopOwner, setSelectedShopOwner] = useState<ShopOwnerWithStats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [suspendReason, setSuspendReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);

  const statusFilter = searchParams.get('status') || '';
  const verifiedFilter = searchParams.get('verified');

  useEffect(() => {
    if (!authLoading && currentUser?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    loadShopOwners();
  }, [statusFilter, verifiedFilter]);

  const loadShopOwners = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getShopOwners({
        status: statusFilter || undefined,
        verified: verifiedFilter === 'true' ? true : verifiedFilter === 'false' ? false : undefined,
        search: searchQuery || undefined,
      });

      if (response.data) {
        setShopOwners((response.data as any).data || []);
      }
    } catch (error) {
      console.error('Failed to load shop owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadShopOwners();
  };

  const handleApprove = async (shopOwnerId: string) => {
    setActionLoading(shopOwnerId);
    try {
      const response = await adminApi.approveShopOwner(shopOwnerId, commissionRate);
      if (response.data) {
        setShopOwners(shopOwners.map(o =>
          o.id === shopOwnerId
            ? { ...o, isVerified: true, status: 'ACTIVE' as const, commissionRate }
            : o
        ));
        if (selectedShopOwner?.id === shopOwnerId) {
          setSelectedShopOwner({ ...selectedShopOwner, isVerified: true, status: 'ACTIVE' as const, commissionRate });
        }
      }
    } catch (error) {
      console.error('Failed to approve shop owner:', error);
      alert('Failed to approve shop owner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedShopOwner || !rejectReason.trim()) return;

    setActionLoading(selectedShopOwner.id);
    try {
      const response = await adminApi.rejectShopOwner(selectedShopOwner.id, rejectReason);
      if (response.data) {
        setShopOwners(shopOwners.map(o =>
          o.id === selectedShopOwner.id
            ? { ...o, status: 'BLOCKED' as const }
            : o
        ));
        setSelectedShopOwner(null);
        setShowRejectModal(false);
        setRejectReason('');
      }
    } catch (error) {
      console.error('Failed to reject shop owner:', error);
      alert('Failed to reject shop owner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!selectedShopOwner || !suspendReason.trim()) return;

    setActionLoading(selectedShopOwner.id);
    try {
      const response = await adminApi.suspendShopOwner(selectedShopOwner.id, suspendReason);
      if (response.data) {
        setShopOwners(shopOwners.map(o =>
          o.id === selectedShopOwner.id
            ? { ...o, status: 'SUSPENDED' as const }
            : o
        ));
        setSelectedShopOwner({ ...selectedShopOwner, status: 'SUSPENDED' as const });
        setShowSuspendModal(false);
        setSuspendReason('');
      }
    } catch (error) {
      console.error('Failed to suspend shop owner:', error);
      alert('Failed to suspend shop owner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (shopOwnerId: string) => {
    setActionLoading(shopOwnerId);
    try {
      const response = await adminApi.reactivateShopOwner(shopOwnerId);
      if (response.data) {
        setShopOwners(shopOwners.map(o =>
          o.id === shopOwnerId
            ? { ...o, status: 'ACTIVE' as const }
            : o
        ));
        if (selectedShopOwner?.id === shopOwnerId) {
          setSelectedShopOwner({ ...selectedShopOwner, status: 'ACTIVE' as const });
        }
      }
    } catch (error) {
      console.error('Failed to reactivate shop owner:', error);
      alert('Failed to reactivate shop owner');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'SUSPENDED': return 'error';
      case 'BLOCKED': return 'error';
      default: return 'default';
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Shop Owner Management</h1>
          <p className="text-gray-400 mt-1">Manage shop owners and merchants</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name..."
              className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSearchParams(filter.value ? { status: filter.value } : {})}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <button
            onClick={() => setSearchParams({ verified: 'false' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              verifiedFilter === 'false'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Unverified
          </button>
        </div>
      </div>

      {/* Shop Owners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopOwners.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <StoreIcon />
            </div>
            <p className="text-gray-400">No shop owners found</p>
          </div>
        ) : (
          shopOwners.map((shopOwner) => (
            <div
              key={shopOwner.id}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {shopOwner.logo ? (
                    <img
                      src={shopOwner.logo}
                      alt={shopOwner.businessName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <StoreIcon />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{shopOwner.businessName}</h3>
                    <p className="text-sm text-gray-400">{shopOwner.tradeName || shopOwner.city}</p>
                  </div>
                </div>
                <StatusBadge
                  status={shopOwner.status}
                  variant={getStatusVariant(shopOwner.status)}
                />
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Merchant Code</span>
                  <span className="text-white font-mono">{shopOwner.merchantCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Items</span>
                  <span className="text-white">{shopOwner._count?.shopItems || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Orders</span>
                  <span className="text-white">{shopOwner.orderCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verified</span>
                  <span className={shopOwner.isVerified ? 'text-green-400' : 'text-yellow-400'}>
                    {shopOwner.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <DashboardButton
                  onClick={() => setSelectedShopOwner(shopOwner)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  View Details
                </DashboardButton>
                {!shopOwner.isVerified && shopOwner.status === 'PENDING' && (
                  <DashboardButton
                    onClick={() => handleApprove(shopOwner.id)}
                    variant="primary"
                    size="sm"
                    disabled={actionLoading === shopOwner.id}
                  >
                    {actionLoading === shopOwner.id ? '...' : 'Approve'}
                  </DashboardButton>
                )}
                {shopOwner.status === 'SUSPENDED' && (
                  <DashboardButton
                    onClick={() => handleReactivate(shopOwner.id)}
                    variant="primary"
                    size="sm"
                    disabled={actionLoading === shopOwner.id}
                  >
                    {actionLoading === shopOwner.id ? '...' : 'Reactivate'}
                  </DashboardButton>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Shop Owner Detail Modal */}
      {selectedShopOwner && !showSuspendModal && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Shop Owner Details</h2>
                <button
                  onClick={() => setSelectedShopOwner(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                {selectedShopOwner.logo ? (
                  <img
                    src={selectedShopOwner.logo}
                    alt={selectedShopOwner.businessName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <StoreIcon />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedShopOwner.businessName}</h3>
                  <p className="text-sm text-gray-400">{selectedShopOwner.tradeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge
                      status={selectedShopOwner.status}
                      variant={getStatusVariant(selectedShopOwner.status)}
                    />
                    {selectedShopOwner.isVerified && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">BUSINESS INFO</h4>
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Merchant Code</span>
                      <span className="text-white font-mono">{selectedShopOwner.merchantCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white">{selectedShopOwner.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">City</span>
                      <span className="text-white">{selectedShopOwner.city || 'N/A'}</span>
                    </div>
                    {selectedShopOwner.description && (
                      <div>
                        <span className="text-gray-400 block mb-1">Description</span>
                        <p className="text-white text-sm">{selectedShopOwner.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">STATISTICS</h4>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {selectedShopOwner.stats?.totalItems || selectedShopOwner._count?.shopItems || 0}
                        </p>
                        <p className="text-xs text-gray-400">Items</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {selectedShopOwner.stats?.totalOrders || selectedShopOwner.orderCount || 0}
                        </p>
                        <p className="text-xs text-gray-400">Orders</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {selectedShopOwner.stats?.totalRevenue?.toLocaleString() || '0'} ETB
                        </p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">COMMISSION</h4>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current Rate</span>
                      <span className="text-2xl font-bold text-primary">{selectedShopOwner.commissionRate}%</span>
                    </div>
                    {!selectedShopOwner.isVerified && selectedShopOwner.status === 'PENDING' && (
                      <div className="mt-4">
                        <label className="text-sm text-gray-400 block mb-2">Set Commission Rate for Approval</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                            className="w-20 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-center"
                          />
                          <span className="text-gray-400">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedShopOwner.user && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">OWNER</h4>
                    <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white">{selectedShopOwner.user.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone</span>
                        <span className="text-white">{selectedShopOwner.user.phone}</span>
                      </div>
                      {selectedShopOwner.user.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email</span>
                          <span className="text-white">{selectedShopOwner.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {!selectedShopOwner.isVerified && selectedShopOwner.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <DashboardButton
                      onClick={() => handleApprove(selectedShopOwner.id)}
                      variant="primary"
                      className="flex-1"
                      disabled={actionLoading === selectedShopOwner.id}
                    >
                      {actionLoading === selectedShopOwner.id ? 'Approving...' : 'Approve Shop Owner'}
                    </DashboardButton>
                    <DashboardButton
                      onClick={() => setShowRejectModal(true)}
                      variant="outline"
                      className="flex-1 !border-red-500 !text-red-400 hover:!bg-red-500/10"
                    >
                      Reject
                    </DashboardButton>
                  </div>
                )}
                {selectedShopOwner.status === 'ACTIVE' && (
                  <DashboardButton
                    onClick={() => setShowSuspendModal(true)}
                    variant="outline"
                    className="!border-red-500 !text-red-400 hover:!bg-red-500/10"
                  >
                    Suspend Shop Owner
                  </DashboardButton>
                )}
                {selectedShopOwner.status === 'SUSPENDED' && (
                  <DashboardButton
                    onClick={() => handleReactivate(selectedShopOwner.id)}
                    variant="primary"
                    disabled={actionLoading === selectedShopOwner.id}
                  >
                    {actionLoading === selectedShopOwner.id ? 'Reactivating...' : 'Reactivate Shop Owner'}
                  </DashboardButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedShopOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Reject Shop Owner</h2>
              <p className="text-gray-400 mt-1">This will reject the shop owner application and revert user role.</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                rows={4}
              />
              <div className="flex gap-3 mt-6">
                <DashboardButton
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </DashboardButton>
                <DashboardButton
                  onClick={handleReject}
                  variant="primary"
                  className="flex-1 !bg-red-500 hover:!bg-red-600"
                  disabled={!rejectReason.trim() || actionLoading === selectedShopOwner.id}
                >
                  {actionLoading === selectedShopOwner.id ? 'Rejecting...' : 'Confirm Reject'}
                </DashboardButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedShopOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Suspend Shop Owner</h2>
              <p className="text-gray-400 mt-1">This will prevent the shop owner from managing items or processing orders.</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Reason for Suspension
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Explain why this shop owner is being suspended..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                rows={4}
              />
              <div className="flex gap-3 mt-6">
                <DashboardButton
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspendReason('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </DashboardButton>
                <DashboardButton
                  onClick={handleSuspend}
                  variant="primary"
                  className="flex-1 !bg-red-500 hover:!bg-red-600"
                  disabled={!suspendReason.trim() || actionLoading === selectedShopOwner.id}
                >
                  {actionLoading === selectedShopOwner.id ? 'Suspending...' : 'Confirm Suspend'}
                </DashboardButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
