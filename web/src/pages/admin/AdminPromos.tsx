import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import { Skeleton, TableRowSkeleton } from '@/components/ui/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorBoundary';

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

const PromoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
  { label: 'Promo Codes', path: '/admin/promos', icon: <PromoIcon /> },
];

interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  eventId?: string;
  event?: { id: string; title: string };
  createdAt: string;
}

interface PromoFormData {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  maxUses: number;
  maxUsesPerUser: number;
  validFrom: string;
  validUntil: string;
}

export function AdminPromos() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [form, setForm] = useState<PromoFormData>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchase: 0,
    maxDiscount: 0,
    maxUses: 0,
    maxUsesPerUser: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
      navigate('/');
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    fetchPromos();
  }, [filterActive]);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filterActive !== 'all' ? `?isActive=${filterActive === 'active'}` : '';
      const response = await api.get(`/promo${params}`);
      setPromos(response.data.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load promo codes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
        minPurchase: form.minPurchase || undefined,
        maxDiscount: form.maxDiscount || undefined,
        maxUses: form.maxUses || undefined,
      };

      if (selectedPromo) {
        await api.patch(`/promo/${selectedPromo.id}`, payload);
      } else {
        await api.post('/promo', payload);
      }

      setShowModal(false);
      resetForm();
      fetchPromos();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save promo code';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      await api.delete(`/promo/${promoId}`);
      fetchPromos();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete promo code';
      alert(errorMessage);
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      await api.patch(`/promo/${promo.id}`, { isActive: !promo.isActive });
      fetchPromos();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update promo code';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setSelectedPromo(null);
    setForm({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 0,
      maxDiscount: 0,
      maxUses: 0,
      maxUsesPerUser: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const openEditModal = (promo: PromoCode) => {
    setSelectedPromo(promo);
    setForm({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minPurchase: promo.minPurchase || 0,
      maxDiscount: promo.maxDiscount || 0,
      maxUses: promo.maxUses || 0,
      maxUsesPerUser: promo.maxUsesPerUser,
      validFrom: promo.validFrom.split('T')[0],
      validUntil: promo.validUntil.split('T')[0],
    });
    setShowModal(true);
  };

  const formatDiscount = (promo: PromoCode) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `${promo.discountValue}%`;
    }
    return `ETB ${promo.discountValue}`;
  };

  const isExpired = (promo: PromoCode) => {
    return new Date(promo.validUntil) < new Date();
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Promo Codes" navItems={navItems} currentPath="/admin/promos">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Promo Codes" navItems={navItems} currentPath="/admin/promos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterActive === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterActive === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterActive === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Inactive
            </button>
          </div>
          <DashboardButton
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Create Promo Code
          </DashboardButton>
        </div>

        {/* Error State */}
        {error && <ErrorMessage message={error} onRetry={fetchPromos} />}

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Usage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Valid Until</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <TableRowSkeleton key={i} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && promos.length === 0 && (
          <EmptyState
            icon="🏷️"
            title="No promo codes yet"
            message="Create your first promo code to offer discounts to customers"
            action={
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Promo Code
              </button>
            }
          />
        )}

        {/* Promo Codes Table */}
        {!loading && !error && promos.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Discount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Usage</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Valid Until</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {promos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-mono font-bold text-primary-400">{promo.code}</span>
                          {promo.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{promo.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-400">{formatDiscount(promo)}</span>
                        {promo.minPurchase && (
                          <p className="text-xs text-gray-500">Min: ETB {promo.minPurchase}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {promo.usedCount} / {promo.maxUses || '∞'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {new Date(promo.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {isExpired(promo) ? (
                          <StatusBadge status="cancelled">Expired</StatusBadge>
                        ) : promo.isActive ? (
                          <StatusBadge status="approved">Active</StatusBadge>
                        ) : (
                          <StatusBadge status="pending">Inactive</StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(promo)}
                            className={`px-3 py-1 text-xs rounded-lg ${
                              promo.isActive
                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {promo.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openEditModal(promo)}
                            className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {selectedPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono"
                    placeholder="SUMMER2025"
                    required
                    disabled={!!selectedPromo}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Summer sale discount"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Discount Type
                    </label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (ETB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                      max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Min Purchase (ETB)
                    </label>
                    <input
                      type="number"
                      value={form.minPurchase}
                      onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Discount (ETB)
                    </label>
                    <input
                      type="number"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Total Uses
                    </label>
                    <input
                      type="number"
                      value={form.maxUses}
                      onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="0"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Uses Per User
                    </label>
                    <input
                      type="number"
                      value={form.maxUsesPerUser}
                      onChange={(e) => setForm({ ...form, maxUsesPerUser: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      value={form.validUntil}
                      onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : selectedPromo ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
