import { useState } from 'react';

interface OrganizerProfile {
  businessName: string;
  businessType: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  logo?: string;
  tinNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  ticketSaleAlerts: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  lowStockAlerts: boolean;
}

// Mock data
const mockProfile: OrganizerProfile = {
  businessName: 'Addis Events',
  businessType: 'Event Management Company',
  description: 'Premier event organizers in Addis Ababa, specializing in concerts, festivals, and corporate events.',
  email: 'contact@addisevents.com',
  phone: '+251911234567',
  website: 'https://addisevents.com',
  address: 'Bole Road, Near Edna Mall',
  city: 'Addis Ababa',
  tinNumber: '0012345678',
  bankName: 'Commercial Bank of Ethiopia',
  bankAccountNumber: '1000234567890',
  bankAccountName: 'Addis Events PLC',
};

const mockNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: true,
  ticketSaleAlerts: true,
  dailySummary: false,
  weeklyReport: true,
  lowStockAlerts: true,
};

export function OrganizerSettings() {
  const [profile, setProfile] = useState<OrganizerProfile>(mockProfile);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications);
  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'notifications' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/organizer', active: false },
    { label: 'Events', href: '/organizer/events', active: false },
    { label: 'Wallet', href: '/organizer/wallet', active: false },
    { label: 'Settings', href: '/organizer/settings', active: true },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
              <span className="text-white/60 text-sm">Organizer</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">O</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/60 mt-1">Manage your organizer profile and preferences</p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-400">Settings saved successfully!</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'profile', label: 'Business Profile' },
            { id: 'bank', label: 'Bank Account' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'security', label: 'Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-dark-card text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-dark-card rounded-xl p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">{profile.businessName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <button className="bg-dark-bg border border-white/10 text-white px-4 py-2 rounded-lg hover:border-primary/50 transition-colors">
                    Upload Logo
                  </button>
                  <p className="text-white/40 text-sm mt-2">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Business Name</label>
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Business Type</label>
                  <select
                    value={profile.businessType}
                    onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option>Event Management Company</option>
                    <option>Concert Promoter</option>
                    <option>Festival Organizer</option>
                    <option>Corporate Events</option>
                    <option>Individual Organizer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">Description</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  rows={3}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="https://"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">TIN Number</label>
                <input
                  type="text"
                  value={profile.tinNumber}
                  onChange={(e) => setProfile({ ...profile, tinNumber: e.target.value })}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Tax Identification Number"
                />
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-yellow-400 font-medium text-sm">Bank Account Verification</p>
                    <p className="text-white/60 text-sm mt-1">
                      Your bank account details are used for receiving payments. Please ensure the information is accurate.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">Bank Name</label>
                <select
                  value={profile.bankName}
                  onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  <option>Commercial Bank of Ethiopia</option>
                  <option>Dashen Bank</option>
                  <option>Awash Bank</option>
                  <option>Abyssinia Bank</option>
                  <option>United Bank</option>
                  <option>Wegagen Bank</option>
                  <option>Nib International Bank</option>
                  <option>Zemen Bank</option>
                  <option>Oromia Bank</option>
                  <option>Bunna Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">Account Number</label>
                <input
                  type="text"
                  value={profile.bankAccountNumber}
                  onChange={(e) => setProfile({ ...profile, bankAccountNumber: e.target.value })}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Enter your bank account number"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={profile.bankAccountName}
                  onChange={(e) => setProfile({ ...profile, bankAccountName: e.target.value })}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Name as it appears on the account"
                />
              </div>

              <div className="bg-dark-bg rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Current Bank Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Bank:</span>
                    <span className="text-white">{profile.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Account:</span>
                    <span className="text-white">****{profile.bankAccountNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Name:</span>
                    <span className="text-white">{profile.bankAccountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className="text-green-400">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-4">Communication Channels</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-white/60 text-sm">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="w-5 h-5 rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer">
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-white/60 text-sm">Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                      className="w-5 h-5 rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer">
                    <div>
                      <p className="text-white font-medium">Ticket Sale Alerts</p>
                      <p className="text-white/60 text-sm">Get notified when someone purchases a ticket</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.ticketSaleAlerts}
                      onChange={() => handleNotificationChange('ticketSaleAlerts')}
                      className="w-5 h-5 rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer">
                    <div>
                      <p className="text-white font-medium">Daily Summary</p>
                      <p className="text-white/60 text-sm">Receive a daily summary of sales and activity</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.dailySummary}
                      onChange={() => handleNotificationChange('dailySummary')}
                      className="w-5 h-5 rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer">
                    <div>
                      <p className="text-white font-medium">Weekly Report</p>
                      <p className="text-white/60 text-sm">Receive a weekly performance report</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReport}
                      onChange={() => handleNotificationChange('weeklyReport')}
                      className="w-5 h-5 rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer">
                    <div>
                      <p className="text-white font-medium">Low Ticket Stock Alerts</p>
                      <p className="text-white/60 text-sm">Get notified when ticket availability is low</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.lowStockAlerts}
                      onChange={() => handleNotificationChange('lowStockAlerts')}
                      className="w-5 h-5 rounded border-white/10 bg-dark-bg text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="bg-dark-bg rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">SMS Authentication</p>
                    <p className="text-white/60 text-sm">Receive a code via SMS when signing in</p>
                  </div>
                  <button className="bg-primary/20 text-primary px-4 py-2 rounded-lg hover:bg-primary/30 transition-colors">
                    Enable
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-semibold mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="bg-dark-bg rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-white font-medium">Chrome on Windows</p>
                        <p className="text-white/60 text-sm">Addis Ababa, Ethiopia • Current session</p>
                      </div>
                    </div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="bg-dark-bg rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-white font-medium">PassAddis App on iPhone</p>
                        <p className="text-white/60 text-sm">Addis Ababa, Ethiopia • Last active 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-red-400 text-sm hover:text-red-300">Sign Out</button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-red-400 font-semibold mb-4">Danger Zone</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">Deactivate Account</p>
                      <p className="text-white/60 text-sm mt-1">
                        Permanently deactivate your organizer account. This action cannot be undone.
                      </p>
                    </div>
                    <button className="text-red-400 border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
