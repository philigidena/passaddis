import { useState } from 'react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  operatingHours: string;
  isActive: boolean;
}

// Mock data
const mockShopItems: ShopItem[] = [
  {
    id: '1',
    name: 'PassAddis T-Shirt',
    description: 'Official PassAddis branded t-shirt, 100% cotton',
    price: 500,
    category: 'Apparel',
    stock: 150,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Event Cap',
    description: 'Stylish cap with PassAddis logo',
    price: 300,
    category: 'Apparel',
    stock: 80,
    isActive: true,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Wristband Set',
    description: 'Set of 3 event wristbands',
    price: 150,
    category: 'Accessories',
    stock: 0,
    isActive: false,
    createdAt: '2024-02-01',
  },
];

const mockPickupLocations: PickupLocation[] = [
  {
    id: '1',
    name: 'Bole Branch',
    address: 'Bole Road, Next to Edna Mall',
    city: 'Addis Ababa',
    phone: '+251911234567',
    operatingHours: '9:00 AM - 6:00 PM',
    isActive: true,
  },
  {
    id: '2',
    name: 'Piassa Branch',
    address: 'Churchill Avenue, Near National Theater',
    city: 'Addis Ababa',
    phone: '+251922345678',
    operatingHours: '10:00 AM - 8:00 PM',
    isActive: true,
  },
];

const categories = ['All', 'Apparel', 'Accessories', 'Food & Drinks', 'Merchandise'];

export function AdminShop() {
  const [activeTab, setActiveTab] = useState<'items' | 'locations'>('items');
  const [items] = useState<ShopItem[]>(mockShopItems);
  const [locations] = useState<PickupLocation[]>(mockPickupLocations);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PickupLocation | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { label: 'Dashboard', href: '/admin', active: false },
    { label: 'Events', href: '/admin/events', active: false },
    { label: 'Users', href: '/admin/users', active: false },
    { label: 'Organizers', href: '/admin/organizers', active: false },
    { label: 'Shop', href: '/admin/shop', active: true },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="bg-dark-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-primary">
                PassAddis
              </a>
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      item.active
                        ? 'bg-primary/20 text-primary'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/60 text-sm">Admin</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Shop Management</h1>
            <p className="text-white/60 mt-1">Manage shop items and pickup locations</p>
          </div>
          <div className="mt-4 md:mt-0">
            {activeTab === 'items' ? (
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowItemModal(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                + Add Item
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setShowLocationModal(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                + Add Location
              </button>
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
                : 'bg-dark-card text-white/60 hover:text-white'
            }`}
          >
            Shop Items
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'locations'
                ? 'bg-primary text-white'
                : 'bg-dark-card text-white/60 hover:text-white'
            }`}
          >
            Pickup Locations
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-dark-card rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={activeTab === 'items' ? 'Search items...' : 'Search locations...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
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
                        : 'bg-dark-bg text-white/60 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'items' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-dark-card rounded-xl overflow-hidden hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setShowItemModal(true);
                }}
              >
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-16 h-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        item.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">{item.price.toLocaleString()} ETB</span>
                    <span
                      className={`text-sm ${
                        item.stock > 0 ? 'text-white/60' : 'text-red-400'
                      }`}
                    >
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-white/40">
                    Category: {item.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className="bg-dark-card rounded-xl p-6 hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedLocation(location);
                  setShowLocationModal(true);
                }}
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
                      <p className="text-white/60 text-sm mt-1">{location.address}</p>
                      <p className="text-white/40 text-sm">{location.city}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-white/60">
                          <span className="text-white/40">Phone:</span> {location.phone}
                        </span>
                        <span className="text-white/60">
                          <span className="text-white/40">Hours:</span> {location.operatingHours}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      location.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {location.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'items' && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-white/60">No items found</p>
          </div>
        )}

        {activeTab === 'locations' && filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-white/60">No locations found</p>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {selectedItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">Item Name</label>
                <input
                  type="text"
                  defaultValue={selectedItem?.name}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Description</label>
                <textarea
                  defaultValue={selectedItem?.description}
                  rows={3}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    defaultValue={selectedItem?.price}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Stock</label>
                  <input
                    type="number"
                    defaultValue={selectedItem?.stock}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Category</label>
                <select
                  defaultValue={selectedItem?.category || 'Apparel'}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {categories.filter(c => c !== 'All').map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Image URL</label>
                <input
                  type="text"
                  defaultValue={selectedItem?.image}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  defaultChecked={selectedItem?.isActive ?? true}
                  className="rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-white/60 text-sm">Active (visible in shop)</label>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
              {selectedItem && (
                <button className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  Delete Item
                </button>
              )}
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                {selectedItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {selectedLocation ? 'Edit Location' : 'Add New Location'}
                </h2>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">Location Name</label>
                <input
                  type="text"
                  defaultValue={selectedLocation?.name}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., Bole Branch"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Address</label>
                <input
                  type="text"
                  defaultValue={selectedLocation?.address}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">City</label>
                <input
                  type="text"
                  defaultValue={selectedLocation?.city || 'Addis Ababa'}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue={selectedLocation?.phone}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="+251..."
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Operating Hours</label>
                <input
                  type="text"
                  defaultValue={selectedLocation?.operatingHours}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="locationActive"
                  defaultChecked={selectedLocation?.isActive ?? true}
                  className="rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                />
                <label htmlFor="locationActive" className="text-white/60 text-sm">Active (available for pickup)</label>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
              {selectedLocation && (
                <button className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  Delete Location
                </button>
              )}
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                {selectedLocation ? 'Save Changes' : 'Add Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
