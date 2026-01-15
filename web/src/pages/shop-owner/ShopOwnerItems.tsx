import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { shopOwnerApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { ShopItem } from '@/types';

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

const categories = [
  { label: 'All', value: '' },
  { label: 'Water', value: 'WATER' },
  { label: 'Drinks', value: 'DRINKS' },
  { label: 'Snacks', value: 'SNACKS' },
  { label: 'Merch', value: 'MERCH' },
  { label: 'Bundles', value: 'BUNDLES' },
];

interface ExtendedShopItem extends ShopItem {
  stockQuantity?: number;
  lowStockThreshold?: number;
  sku?: string;
  isCurated?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  badge?: string;
}

export function ShopOwnerItems() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ExtendedShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCuratedOnly, setShowCuratedOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtendedShopItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !['SHOP_OWNER', 'ADMIN'].includes(user?.role || '')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'SHOP_OWNER' || user?.role === 'ADMIN') {
      loadItems();
    }
  }, [user, selectedCategory, showCuratedOnly]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await shopOwnerApi.getItems({
        category: selectedCategory || undefined,
        curatedOnly: showCuratedOnly || undefined,
        search: searchQuery || undefined,
      });
      if (response.data) {
        setItems(response.data as ExtendedShopItem[]);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadItems();
  };

  const handleToggleCurated = async (item: ExtendedShopItem) => {
    try {
      await shopOwnerApi.updateCuratedStatus([item.id], !item.isCurated);
      setItems(items.map(i =>
        i.id === item.id ? { ...i, isCurated: !i.isCurated } : i
      ));
    } catch (error) {
      console.error('Failed to update curated status:', error);
    }
  };

  const handleUpdateStock = async (itemId: string, quantity: number) => {
    try {
      await shopOwnerApi.updateStock(itemId, quantity);
      setItems(items.map(i =>
        i.id === itemId ? { ...i, stockQuantity: quantity, inStock: quantity > 0 } : i
      ));
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await shopOwnerApi.deleteItem(itemId);
      setItems(items.filter(i => i.id !== itemId));
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Items</h1>
          <p className="text-gray-400 mt-1">Manage your shop inventory and curated selection</p>
        </div>
        <DashboardButton
          onClick={() => setShowCreateModal(true)}
          variant="primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </DashboardButton>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              >
                Search
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Curated Toggle */}
          <button
            onClick={() => setShowCuratedOnly(!showCuratedOnly)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              showCuratedOnly
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Curated Only
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <ItemsIcon />
          </div>
          <p className="text-gray-400 mb-4">No items found</p>
          <DashboardButton onClick={() => setShowCreateModal(true)} variant="primary">
            Add Your First Item
          </DashboardButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-orange-500/50 transition-colors"
            >
              {/* Item Image */}
              <div className="relative aspect-square bg-gray-700">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ItemsIcon />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.isCurated && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500 text-gray-900">
                      Curated
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500 text-white">
                      Featured
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Stock Badge */}
                <div className="absolute top-2 right-2">
                  <StatusBadge
                    status={item.inStock ? 'In Stock' : 'Out of Stock'}
                    variant={item.inStock ? 'success' : 'error'}
                  />
                </div>
              </div>

              {/* Item Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.category}</p>
                  </div>
                  <span className="text-lg font-bold text-orange-400">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                {/* Stock Info */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">Stock:</span>
                  <span className={`font-medium ${
                    (item.stockQuantity || 0) <= (item.lowStockThreshold || 10)
                      ? 'text-red-400'
                      : 'text-green-400'
                  }`}>
                    {item.stockQuantity || 0} units
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleCurated(item)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.isCurated
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {item.isCurated ? 'Uncurate' : 'Curate'}
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Item Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={async (data) => {
            setIsSubmitting(true);
            try {
              const response = await shopOwnerApi.updateItem(selectedItem.id, data);
              if (response.data) {
                setItems(items.map(i => i.id === selectedItem.id ? { ...i, ...data } : i));
                setSelectedItem(null);
              }
            } finally {
              setIsSubmitting(false);
            }
          }}
          onDelete={() => handleDeleteItem(selectedItem.id)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Create Item Modal */}
      {showCreateModal && (
        <ItemModal
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            setIsSubmitting(true);
            try {
              const response = await shopOwnerApi.createItem(data as any);
              if (response.data) {
                setItems([response.data as ExtendedShopItem, ...items]);
                setShowCreateModal(false);
              }
            } finally {
              setIsSubmitting(false);
            }
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </DashboardLayout>
  );
}

// Item Modal Component
interface ItemModalProps {
  item?: ExtendedShopItem;
  onClose: () => void;
  onSave: (data: Partial<ExtendedShopItem>) => Promise<void>;
  onDelete?: () => void;
  isSubmitting: boolean;
}

function ItemModal({ item, onClose, onSave, onDelete, isSubmitting }: ItemModalProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    imageUrl: item?.imageUrl || '',
    category: item?.category || 'SNACKS',
    stockQuantity: item?.stockQuantity || 0,
    lowStockThreshold: item?.lowStockThreshold || 10,
    sku: item?.sku || '',
    isCurated: item?.isCurated || false,
    isFeatured: item?.isFeatured || false,
    badge: item?.badge || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {item ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price (ETB) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="WATER">Water</option>
                <option value="DRINKS">Drinks</option>
                <option value="SNACKS">Snacks</option>
                <option value="MERCH">Merch</option>
                <option value="BUNDLES">Bundles</option>
              </select>
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Low Stock Alert</label>
              <input
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
              placeholder="https://..."
            />
          </div>

          {/* SKU & Badge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Badge</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="New, Best Seller..."
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCurated}
                onChange={(e) => setFormData({ ...formData, isCurated: e.target.checked })}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-300">Curated</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-300">Featured</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {item && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : item ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
