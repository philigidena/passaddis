import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { ShopItem, PickupLocation } from '@/types';

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

const categories = ['All', 'APPAREL', 'ACCESSORIES', 'FOOD_DRINKS', 'MERCHANDISE'];

interface ItemFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
}

interface LocationFormData {
  name: string;
  area: string;
  address: string;
  hours: string;
  isActive: boolean;
}

export function AdminShop() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'items' | 'locations'>('items');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PickupLocation | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [itemForm, setItemForm] = useState<ItemFormData>({
    name: '',
    description: '',
    price: 0,
    category: 'APPAREL',
    imageUrl: '',
    inStock: true,
  });

  const [locationForm, setLocationForm] = useState<LocationFormData>({
    name: '',
    area: '',
    address: '',
    hours: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && currentUser?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, locationsRes] = await Promise.all([
        adminApi.getShopItems(),
        adminApi.getPickupLocations(),
      ]);

      if (itemsRes.data) {
        setItems(itemsRes.data);
      }
      if (locationsRes.data) {
        setLocations(locationsRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openItemModal = (item?: ShopItem) => {
    if (item) {
      setSelectedItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl || '',
        inStock: item.inStock,
      });
    } else {
      setSelectedItem(null);
      setItemForm({
        name: '',
        description: '',
        price: 0,
        category: 'APPAREL',
        imageUrl: '',
        inStock: true,
      });
    }
    setShowItemModal(true);
  };

  const openLocationModal = (location?: PickupLocation) => {
    if (location) {
      setSelectedLocation(location);
      setLocationForm({
        name: location.name,
        area: location.area || '',
        address: location.address || '',
        hours: location.hours || '',
        isActive: location.isActive,
      });
    } else {
      setSelectedLocation(null);
      setLocationForm({
        name: '',
        area: '',
        address: '',
        hours: '',
        isActive: true,
      });
    }
    setShowLocationModal(true);
  };

  const handleSaveItem = async () => {
    setSaving(true);
    try {
      if (selectedItem) {
        const response = await adminApi.updateShopItem(selectedItem.id, itemForm);
        if (response.data) {
          setItems(items.map(i => i.id === selectedItem.id ? response.data! : i));
        }
      } else {
        const response = await adminApi.createShopItem(itemForm);
        if (response.data) {
          setItems([response.data, ...items]);
        }
      }
      setShowItemModal(false);
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    setDeleting(true);
    try {
      await adminApi.deleteShopItem(selectedItem.id);
      setItems(items.filter(i => i.id !== selectedItem.id));
      setShowItemModal(false);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveLocation = async () => {
    setSaving(true);
    try {
      if (selectedLocation) {
        const response = await adminApi.updatePickupLocation(selectedLocation.id, locationForm);
        if (response.data) {
          setLocations(locations.map(l => l.id === selectedLocation.id ? response.data! : l));
        }
      } else {
        const response = await adminApi.createPickupLocation(locationForm);
        if (response.data) {
          setLocations([response.data, ...locations]);
        }
      }
      setShowLocationModal(false);
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;

    if (!confirm('Are you sure you want to delete this location?')) return;

    setDeleting(true);
    try {
      await adminApi.deletePickupLocation(selectedLocation.id);
      setLocations(locations.filter(l => l.id !== selectedLocation.id));
      setShowLocationModal(false);
    } catch (error) {
      console.error('Failed to delete location:', error);
      alert('Failed to delete location');
    } finally {
      setDeleting(false);
    }
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Shop Management</h1>
          <p className="text-gray-400 mt-1">Manage shop items and pickup locations</p>
        </div>
        <div>
          {activeTab === 'items' ? (
            <DashboardButton onClick={() => openItemModal()} variant="primary">
              + Add Item
            </DashboardButton>
          ) : (
            <DashboardButton onClick={() => openLocationModal()} variant="primary">
              + Add Location
            </DashboardButton>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-primary text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Shop Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'locations'
              ? 'bg-primary text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Pickup Locations ({locations.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={activeTab === 'items' ? 'Search items...' : 'Search locations...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
          {activeTab === 'items' && (
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {category === 'All' ? 'All' : formatCategory(category)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'items' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ShopIcon />
              <p className="text-gray-400 mt-4">No items found</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all cursor-pointer"
                onClick={() => openItemModal(item)}
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <StatusBadge
                      status={item.inStock ? 'In Stock' : 'Out of Stock'}
                      variant={item.inStock ? 'success' : 'error'}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">{item.price.toLocaleString()} ETB</span>
                    <span className="text-sm text-gray-500">{formatCategory(item.category)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <p className="text-gray-400">No locations found</p>
            </div>
          ) : (
            filteredLocations.map((location) => (
              <div
                key={location.id}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all cursor-pointer"
                onClick={() => openLocationModal(location)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{location.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{location.address}</p>
                      <p className="text-gray-500 text-sm">{location.area}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-gray-400">
                          <span className="text-gray-500">Hours:</span> {location.hours}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    status={location.isActive ? 'Active' : 'Inactive'}
                    variant={location.isActive ? 'success' : 'error'}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {selectedItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    {categories.filter(c => c !== 'All').map((category) => (
                      <option key={category} value={category}>{formatCategory(category)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Image URL</label>
                <input
                  type="text"
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={itemForm.inStock}
                  onChange={(e) => setItemForm({ ...itemForm, inStock: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                />
                <label htmlFor="inStock" className="text-gray-400 text-sm">In Stock</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-between">
              <div>
                {selectedItem && (
                  <DashboardButton
                    onClick={handleDeleteItem}
                    variant="outline"
                    disabled={deleting}
                    className="!border-red-500 !text-red-400 hover:!bg-red-500/10"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </DashboardButton>
                )}
              </div>
              <div className="flex space-x-3">
                <DashboardButton onClick={() => setShowItemModal(false)} variant="outline">
                  Cancel
                </DashboardButton>
                <DashboardButton onClick={handleSaveItem} variant="primary" disabled={saving || !itemForm.name}>
                  {saving ? 'Saving...' : selectedItem ? 'Save Changes' : 'Add Item'}
                </DashboardButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {selectedLocation ? 'Edit Location' : 'Add New Location'}
                </h2>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Location Name</label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., Bole Branch"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Area</label>
                <input
                  type="text"
                  value={locationForm.area}
                  onChange={(e) => setLocationForm({ ...locationForm, area: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., Bole"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Address</label>
                <input
                  type="text"
                  value={locationForm.address}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Full street address"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={locationForm.hours}
                  onChange={(e) => setLocationForm({ ...locationForm, hours: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="locationActive"
                  checked={locationForm.isActive}
                  onChange={(e) => setLocationForm({ ...locationForm, isActive: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                />
                <label htmlFor="locationActive" className="text-gray-400 text-sm">Active (available for pickup)</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-between">
              <div>
                {selectedLocation && (
                  <DashboardButton
                    onClick={handleDeleteLocation}
                    variant="outline"
                    disabled={deleting}
                    className="!border-red-500 !text-red-400 hover:!bg-red-500/10"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </DashboardButton>
                )}
              </div>
              <div className="flex space-x-3">
                <DashboardButton onClick={() => setShowLocationModal(false)} variant="outline">
                  Cancel
                </DashboardButton>
                <DashboardButton onClick={handleSaveLocation} variant="primary" disabled={saving || !locationForm.name}>
                  {saving ? 'Saving...' : selectedLocation ? 'Save Changes' : 'Add Location'}
                </DashboardButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
