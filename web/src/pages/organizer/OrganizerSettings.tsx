import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { organizerApi, authApi, setAuthToken } from '@/lib/api';
import {
  DashboardLayout,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { MerchantProfile } from '@/types';

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
  { label: 'Events', path: '/organizer/events', icon: <EventsIcon /> },
  { label: 'Wallet', path: '/organizer/wallet', icon: <WalletIcon /> },
  { label: 'Settings', path: '/organizer/settings', icon: <SettingsIcon /> },
];

interface ProfileFormData {
  businessName: string;
  tradeName: string;
  description: string;
  city: string;
  bankName: string;
  bankAccount: string;
}

export function OrganizerSettings() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'security'>('profile');
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    businessName: '',
    tradeName: '',
    description: '',
    city: '',
    bankName: '',
    bankAccount: '',
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !['ORGANIZER', 'ADMIN', 'USER'].includes(user?.role || '')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await organizerApi.getProfile();
      if (response.data) {
        setProfile(response.data);
        setFormData({
          businessName: response.data.businessName || '',
          tradeName: response.data.tradeName || '',
          description: response.data.description || '',
          city: response.data.city || '',
          bankName: response.data.bankName || '',
          bankAccount: response.data.bankAccount || '',
        });
        setIsCreating(false);
      } else {
        // Profile doesn't exist, user needs to create one
        setIsCreating(true);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setIsCreating(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let response;
      if (isCreating) {
        response = await organizerApi.createProfile({
          businessName: formData.businessName,
          tradeName: formData.tradeName || undefined,
          description: formData.description || undefined,
          city: formData.city || undefined,
          bankName: formData.bankName || undefined,
          bankAccount: formData.bankAccount || undefined,
        });
      } else {
        response = await organizerApi.updateProfile({
          businessName: formData.businessName,
          tradeName: formData.tradeName || undefined,
          description: formData.description || undefined,
          city: formData.city || undefined,
          bankName: formData.bankName || undefined,
          bankAccount: formData.bankAccount || undefined,
        });
      }

      if (response.data) {
        // If creating new profile, backend returns accessToken and user data
        if (isCreating && 'accessToken' in response.data) {
          const { accessToken, user: userData, ...profileData } = response.data as any;

          // Store new JWT token with updated role
          if (accessToken) {
            localStorage.setItem('passaddis_token', accessToken);
            setAuthToken(accessToken);
          }

          // Update user in local storage
          if (userData) {
            localStorage.setItem('passaddis_user', JSON.stringify(userData));
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

          setSuccessMessage('Profile created successfully! Your application is pending admin approval.');
        } else {
          // Update profile (no token change)
          setProfile(response.data);
          setSuccessMessage('Settings saved successfully!');
        }

        setIsCreating(false);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(response.error || 'Failed to save settings');
      }
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    setError('');

    try {
      const response = await authApi.setPassword(passwords.newPassword);
      if (response.data) {
        setSuccessMessage('Password updated successfully!');
        setPasswords({ newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.error || 'Failed to update password');
      }
    } catch (error) {
      setError('Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {isCreating ? 'Create Organizer Profile' : 'Settings'}
        </h1>
        <p className="text-gray-400 mt-1">
          {isCreating
            ? 'Set up your organizer profile to start hosting events'
            : 'Manage your organizer profile and preferences'}
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-400">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Tabs - only show if not creating */}
      {!isCreating && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'profile', label: 'Business Profile' },
            { id: 'bank', label: 'Bank Account' },
            { id: 'security', label: 'Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        {(activeTab === 'profile' || isCreating) && (
          <div className="space-y-6">
            {/* Profile Header with Status */}
            {profile && !isCreating && (
              <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg mb-6">
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-400">
                    {profile.businessName?.charAt(0) || 'O'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{profile.businessName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.isVerified ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                        Pending Verification
                      </span>
                    )}
                    <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                      {profile.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Your business name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Trade Name</label>
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Display name (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Tell us about your organization..."
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g., Addis Ababa"
              />
            </div>

            {/* Show bank fields when creating */}
            {isCreating && (
              <>
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bank Details (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Bank Name</label>
                      <select
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Select a bank</option>
                        <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia</option>
                        <option value="Dashen Bank">Dashen Bank</option>
                        <option value="Awash Bank">Awash Bank</option>
                        <option value="Abyssinia Bank">Abyssinia Bank</option>
                        <option value="United Bank">United Bank</option>
                        <option value="Wegagen Bank">Wegagen Bank</option>
                        <option value="Nib International Bank">Nib International Bank</option>
                        <option value="Zemen Bank">Zemen Bank</option>
                        <option value="Oromia Bank">Oromia Bank</option>
                        <option value="Bunna Bank">Bunna Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Your bank account number"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bank' && !isCreating && (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-yellow-400 font-medium text-sm">Bank Account Verification</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Your bank account details are used for receiving payouts. Please ensure the information is accurate.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Bank Name</label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select a bank</option>
                <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia</option>
                <option value="Dashen Bank">Dashen Bank</option>
                <option value="Awash Bank">Awash Bank</option>
                <option value="Abyssinia Bank">Abyssinia Bank</option>
                <option value="United Bank">United Bank</option>
                <option value="Wegagen Bank">Wegagen Bank</option>
                <option value="Nib International Bank">Nib International Bank</option>
                <option value="Zemen Bank">Zemen Bank</option>
                <option value="Oromia Bank">Oromia Bank</option>
                <option value="Bunna Bank">Bunna Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your bank account number"
              />
            </div>

            {/* Current Bank Details Display */}
            {profile?.bankName && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Current Bank Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank:</span>
                    <span className="text-white">{profile.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account:</span>
                    <span className="text-white">
                      {profile.bankAccount ? `****${profile.bankAccount.slice(-4)}` : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && !isCreating && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Confirm new password"
                  />
                </div>
                <DashboardButton
                  onClick={handlePasswordChange}
                  variant="secondary"
                  disabled={changingPassword || !passwords.newPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </DashboardButton>
              </div>
            </div>

            {/* Account Info */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-white font-semibold mb-4">Account Information</h3>
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{user?.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{user?.email || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Role:</span>
                  <span className="text-white">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {(activeTab !== 'security' || isCreating) && (
          <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
            <DashboardButton
              onClick={handleSave}
              variant="primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isCreating ? 'Create Profile' : 'Save Changes'}</span>
              )}
            </DashboardButton>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
