import { useState, useEffect } from 'react';
import { organizerApi } from '@/lib/api';
import { DashboardButton } from '@/components/layout/DashboardLayout';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  startsAt: string | null;
  endsAt: string | null;
  maxQuantity: number | null;
  isActive: boolean;
  priority: number;
}

interface PricingTierManagerProps {
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  basePrice: number;
  onClose: () => void;
}

export function PricingTierManager({
  eventId,
  ticketTypeId,
  ticketTypeName,
  basePrice,
  onClose,
}: PricingTierManagerProps) {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

  // Form state for new/edit tier
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    startsAt: '',
    endsAt: '',
    maxQuantity: '',
    priority: 0,
  });

  useEffect(() => {
    loadTiers();
  }, [eventId, ticketTypeId]);

  const loadTiers = async () => {
    setLoading(true);
    try {
      const response = await organizerApi.getPricingTiers(eventId, ticketTypeId);
      if (response.data) {
        setTiers(response.data.pricingTiers);
      }
    } catch (err) {
      console.error('Failed to load pricing tiers:', err);
      setError('Failed to load pricing tiers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      startsAt: '',
      endsAt: '',
      maxQuantity: '',
      priority: 0,
    });
    setEditingTier(null);
    setShowAddForm(false);
  };

  const handleAddTier = async () => {
    if (!formData.name || formData.price < 0) {
      setError('Please enter a tier name and valid price');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data: any = {
        name: formData.name,
        price: formData.price,
        priority: formData.priority,
      };

      if (formData.startsAt) {
        data.startsAt = new Date(formData.startsAt).toISOString();
      }
      if (formData.endsAt) {
        data.endsAt = new Date(formData.endsAt).toISOString();
      }
      if (formData.maxQuantity) {
        data.maxQuantity = parseInt(formData.maxQuantity);
      }

      const response = await organizerApi.addPricingTier(eventId, ticketTypeId, data);
      if (response.data) {
        resetForm();
        loadTiers();
      } else {
        setError(response.error || 'Failed to add pricing tier');
      }
    } catch (err) {
      setError('Failed to add pricing tier');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTier = async () => {
    if (!editingTier) return;

    setSaving(true);
    setError('');

    try {
      const data: any = {
        name: formData.name,
        price: formData.price,
        priority: formData.priority,
      };

      if (formData.startsAt) {
        data.startsAt = new Date(formData.startsAt).toISOString();
      }
      if (formData.endsAt) {
        data.endsAt = new Date(formData.endsAt).toISOString();
      }
      if (formData.maxQuantity) {
        data.maxQuantity = parseInt(formData.maxQuantity);
      }

      const response = await organizerApi.updatePricingTier(
        eventId,
        ticketTypeId,
        editingTier.id,
        data
      );
      if (response.data) {
        resetForm();
        loadTiers();
      } else {
        setError(response.error || 'Failed to update pricing tier');
      }
    } catch (err) {
      setError('Failed to update pricing tier');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;

    try {
      await organizerApi.deletePricingTier(eventId, ticketTypeId, tierId);
      loadTiers();
    } catch (err) {
      console.error('Failed to delete tier:', err);
      setError('Failed to delete pricing tier');
    }
  };

  const handleToggleActive = async (tier: PricingTier) => {
    try {
      await organizerApi.updatePricingTier(eventId, ticketTypeId, tier.id, {
        isActive: !tier.isActive,
      });
      loadTiers();
    } catch (err) {
      console.error('Failed to toggle tier:', err);
    }
  };

  const startEdit = (tier: PricingTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      price: tier.price,
      startsAt: tier.startsAt ? new Date(tier.startsAt).toISOString().slice(0, 16) : '',
      endsAt: tier.endsAt ? new Date(tier.endsAt).toISOString().slice(0, 16) : '',
      maxQuantity: tier.maxQuantity?.toString() || '',
      priority: tier.priority,
    });
    setShowAddForm(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Pricing Tiers</h3>
            <p className="text-sm text-gray-400">
              {ticketTypeName} - Base Price: {basePrice.toLocaleString()} ETB
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Explanation */}
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-400 mb-2">How Pricing Tiers Work</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>Early Bird</strong>: Set a lower price for tickets sold before a date or up to a quantity</li>
              <li>• <strong>Priority</strong>: Higher priority tiers are checked first (use 10 for Early Bird, 5 for Regular)</li>
              <li>• Customers automatically get the best available price based on active tiers</li>
            </ul>
          </div>

          {/* Add Tier Button */}
          {!showAddForm && (
            <DashboardButton
              onClick={() => setShowAddForm(true)}
              variant="primary"
              className="mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Pricing Tier
            </DashboardButton>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h4 className="text-sm font-medium text-white mb-4">
                {editingTier ? 'Edit Pricing Tier' : 'Add New Pricing Tier'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tier Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Early Bird"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Starts At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ends At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Quantity (Optional)</label>
                  <input
                    type="number"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="First X tickets at this price"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Priority (Higher = Checked First)</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <DashboardButton
                  onClick={editingTier ? handleUpdateTier : handleAddTier}
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingTier ? 'Update Tier' : 'Add Tier'}
                </DashboardButton>
                <DashboardButton onClick={resetForm} variant="secondary">
                  Cancel
                </DashboardButton>
              </div>
            </div>
          )}

          {/* Tiers List */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No pricing tiers configured</p>
              <p className="text-sm mt-1">Add tiers to offer early bird or dynamic pricing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tiers
                .sort((a, b) => b.priority - a.priority)
                .map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-lg border ${
                      tier.isActive
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-gray-800/50 border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{tier.name}</span>
                          {!tier.isActive && (
                            <span className="text-xs px-2 py-0.5 bg-gray-600 rounded text-gray-400">
                              Inactive
                            </span>
                          )}
                          <span className="text-xs text-gray-500">Priority: {tier.priority}</span>
                        </div>
                        <div className="text-lg font-bold text-purple-400">
                          {tier.price.toLocaleString()} ETB
                          {tier.price < basePrice && (
                            <span className="text-xs text-green-400 ml-2">
                              Save {((1 - tier.price / basePrice) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                          {tier.startsAt && <p>Starts: {formatDate(tier.startsAt)}</p>}
                          {tier.endsAt && <p>Ends: {formatDate(tier.endsAt)}</p>}
                          {tier.maxQuantity && <p>Limited to first {tier.maxQuantity} tickets</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(tier)}
                          className={`p-2 rounded-lg ${
                            tier.isActive
                              ? 'text-green-400 hover:bg-green-500/10'
                              : 'text-gray-400 hover:bg-gray-600'
                          }`}
                          title={tier.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {tier.isActive ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => startEdit(tier)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-700">
          <DashboardButton onClick={onClose} variant="secondary">
            Close
          </DashboardButton>
        </div>
      </div>
    </div>
  );
}
