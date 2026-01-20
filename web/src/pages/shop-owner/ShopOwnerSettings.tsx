import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { shopOwnerApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
} from '@/components/layout/DashboardLayout';
import type { MerchantProfile } from '@/types';

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

const ethiopianCities = [
  'Addis Ababa',
  'Dire Dawa',
  'Bahir Dar',
  'Gondar',
  'Hawassa',
  'Mekelle',
  'Adama',
  'Jimma',
  'Dessie',
  'Harar',
  'Debre Birhan',
  'Arba Minch',
  'Other',
];

export function ShopOwnerSettings() {
  const { isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    tradeName: '',
    description: '',
    city: 'Addis Ababa',
  });

  useEffect(() => {
    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await shopOwnerApi.getProfile();
      if (response.data) {
        setProfile(response.data);
        setFormData({
          businessName: response.data.businessName || '',
          tradeName: response.data.tradeName || '',
          description: response.data.description || '',
          city: response.data.city || 'Addis Ababa',
        });
        setIsNewProfile(false);
      } else if (response.error) {
        // Check if it's a 404 (profile not found) or other error
        if (response.status === 404 || response.error.toLowerCase().includes('not found')) {
          setIsNewProfile(true);
        } else if (response.status === 401) {
          setError('Authentication required. Please sign in again.');
        } else if (response.status === 403) {
          setError('You do not have permission to access this page.');
        } else {
          setError(response.error || 'Failed to load profile. Please try again.');
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Validation
      if (!formData.businessName.trim()) {
        setError('Business name is required');
        setSaving(false);
        return;
      }

      if (formData.businessName.trim().length < 3) {
        setError('Business name must be at least 3 characters');
        setSaving(false);
        return;
      }

      if (formData.businessName.trim().length > 100) {
        setError('Business name must be less than 100 characters');
        setSaving(false);
        return;
      }

      let response;
      if (isNewProfile) {
        response = await shopOwnerApi.createProfile({
          businessName: formData.businessName.trim(),
          tradeName: formData.tradeName.trim() || undefined,
          description: formData.description.trim() || undefined,
          city: formData.city,
        });
      } else {
        response = await shopOwnerApi.updateProfile({
          businessName: formData.businessName.trim(),
          tradeName: formData.tradeName.trim() || undefined,
          description: formData.description.trim() || undefined,
          city: formData.city,
        });
      }

      if (response.error) {
        // Provide more specific error messages
        if (response.status === 409) {
          setError('A profile already exists for this account.');
        } else if (response.status === 401) {
          setError('Your session has expired. Please sign in again.');
        } else if (response.status === 403) {
          setError('You do not have permission to perform this action.');
        } else if (response.status === 400) {
          setError(response.error || 'Invalid input. Please check your information.');
        } else {
          setError(response.error || 'Failed to save profile. Please try again.');
        }
      } else if (response.data) {
        // If creating new profile, backend returns accessToken and user data
        if (isNewProfile && 'accessToken' in response.data) {
          const { accessToken, user, ...profileData } = response.data as any;

          // Store new JWT token with updated role
          if (accessToken) {
            localStorage.setItem('passaddis_token', accessToken);
            // Update axios default header
            const { setAuthToken } = await import('@/lib/api');
            setAuthToken(accessToken);
          }

          // Update user in local storage
          if (user) {
            localStorage.setItem('passaddis_user', JSON.stringify(user));
          }

          // Set profile data (without accessToken and user fields)
          setProfile(profileData);

          // Refresh user context with new role
          if (refreshUser) {
            try {
              await refreshUser();
            } catch (refreshError) {
              console.error('Failed to refresh user context:', refreshError);
            }
          }
        } else {
          // Update profile (no token change)
          setProfile(response.data);
        }

        setIsNewProfile(false);
        setSuccess(isNewProfile
          ? 'Profile created successfully! Your application is pending admin approval. You will be notified once your account is activated.'
          : 'Profile updated successfully!'
        );

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Profile submission error:', error);
      setError('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setSaving(false);
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
      <DashboardLayout title="Shop Owner Settings" navItems={navItems} accentColor="orange">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Shop Owner Settings" navItems={navItems} accentColor="orange">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {isNewProfile ? 'Become a Shop Partner' : 'Shop Settings'}
        </h1>
        <p className="text-gray-400 mt-1">
          {isNewProfile
            ? 'Fill out your business details to apply as a shop partner'
            : 'Manage your shop profile and settings'}
        </p>
      </div>

      {/* Error Alert (if profile failed to load) */}
      {error && !loading && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <button
                onClick={loadProfile}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Card (for existing profiles) */}
      {profile && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold text-white">{profile.businessName}</h2>
                <StatusBadge
                  status={profile.status}
                  variant={getStatusVariant(profile.status)}
                />
              </div>
              <p className="text-sm text-gray-400">
                Merchant Code: <span className="text-white font-mono">{profile.merchantCode}</span>
              </p>
              {profile.commissionRate !== undefined && (
                <p className="text-sm text-gray-400 mt-1">
                  Commission Rate: <span className="text-white">{profile.commissionRate}%</span>
                </p>
              )}
            </div>
            {profile.isVerified && (
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Verified Partner</span>
              </div>
            )}
          </div>

          {profile.status === 'PENDING' && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                Your application is pending admin approval. You'll be notified once your account is activated.
              </p>
            </div>
          )}

          {profile.status === 'SUSPENDED' && (
            <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">
                Your account has been suspended. Please contact support for assistance.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {isNewProfile ? 'Business Details' : 'Edit Profile'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Your registered business name"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be displayed to customers
              </p>
            </div>

            {/* Trade Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trade Name (Optional)
              </label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Brand or trade name (if different)"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                placeholder="Describe your business and what you sell..."
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                {ethiopianCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : isNewProfile ? (
                'Submit Application'
              ) : (
                'Save Changes'
              )}
            </button>

            {!isNewProfile && (
              <button
                type="button"
                onClick={() => navigate('/shop-owner')}
                className="px-6 py-3 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Info Cards for New Users */}
      {isNewProfile && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-2">Quick Approval</h3>
            <p className="text-gray-400 text-sm">
              Applications are typically reviewed within 24-48 hours.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-2">Earn Revenue</h3>
            <p className="text-gray-400 text-sm">
              Sell refreshments and merchandise at events and earn commissions.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-2">Easy Management</h3>
            <p className="text-gray-400 text-sm">
              Manage orders, track inventory, and scan pickups from one dashboard.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
