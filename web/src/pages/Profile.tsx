import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  LogOut,
  Ticket,
  ShoppingBag,
  Settings,
  ChevronRight,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import clsx from 'clsx';

interface ProfileSection {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, refreshUser, completeProfile, setPassword } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    checkHasPassword();
  }, [user]);

  const checkHasPassword = async () => {
    const response = await authApi.hasPassword();
    if (response.data) {
      setHasPassword(response.data.hasPassword);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await completeProfile(name, email || undefined);

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
      await refreshUser();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }

    setIsLoading(false);
  };

  const handleSetPassword = async () => {
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await setPassword(newPassword);

    if (result.success) {
      setMessage({ type: 'success', text: hasPassword ? 'Password updated' : 'Password set successfully' });
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
      setHasPassword(true);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to set password' });
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ORGANIZER':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'SHOP_OWNER':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const quickActions = [
    {
      icon: <Ticket className="w-5 h-5" />,
      label: 'My Tickets',
      description: 'View purchased tickets',
      onClick: () => navigate('/tickets'),
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: 'My Orders',
      description: 'View shop orders',
      onClick: () => navigate('/orders'),
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Saved Events',
      description: 'Events you saved',
      onClick: () => navigate('/saved'),
    },
  ];

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Not Logged In</h2>
            <p className="text-white/60 mb-6">Please sign in to view your profile</p>
            <Button onClick={() => navigate('/signin')}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/20 to-dark-bg border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                {user.name?.charAt(0).toUpperCase() || user.phone?.charAt(0) || 'U'}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {user.name || 'PassAddis User'}
                  </h1>
                  <span className={clsx(
                    'px-2 py-0.5 text-xs font-medium rounded-full border',
                    getRoleBadge(user.role)
                  )}>
                    {user.role || 'USER'}
                  </span>
                </div>

                {user.email && (
                  <p className="text-white/60 flex items-center gap-2 justify-center sm:justify-start">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                )}

                {user.phone && (
                  <p className="text-white/60 flex items-center gap-2 justify-center sm:justify-start mt-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </p>
                )}

                {user.isVerified && (
                  <div className="flex items-center gap-1 text-green-400 mt-2 justify-center sm:justify-start">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Verified Account</span>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <Button
                variant={isEditing ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    setName(user.name || '');
                    setEmail(user.email || '');
                  }
                  setIsEditing(!isEditing);
                  setMessage(null);
                }}
                leftIcon={isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Message */}
          {message && (
            <div className={clsx(
              'mb-6 p-4 rounded-xl flex items-center gap-3',
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            )}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                {message.text}
              </p>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className="bg-dark-card rounded-2xl border border-white/5 p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-6">Edit Profile</h3>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  leftIcon={<User className="w-5 h-5" />}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  leftIcon={<Mail className="w-5 h-5" />}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    isLoading={isLoading}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name || '');
                      setEmail(user.email || '');
                      setMessage(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex items-center gap-4 p-4 bg-dark-card rounded-xl border border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {action.icon}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{action.label}</p>
                  <p className="text-white/40 text-sm">{action.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Account Settings */}
          <div className="bg-dark-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Account Settings
              </h3>
            </div>

            <div className="divide-y divide-white/5">
              {/* Password Setting */}
              <div className="p-4">
                <button
                  onClick={() => {
                    setShowPasswordForm(!showPasswordForm);
                    setMessage(null);
                  }}
                  className="w-full flex items-center justify-between hover:bg-white/5 -mx-4 px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">
                        {hasPassword ? 'Change Password' : 'Set Password'}
                      </p>
                      <p className="text-white/40 text-sm">
                        {hasPassword
                          ? 'Update your account password'
                          : 'Add a password for email login'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={clsx(
                    'w-5 h-5 text-white/40 transition-transform',
                    showPasswordForm && 'rotate-90'
                  )} />
                </button>

                {showPasswordForm && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      leftIcon={<Lock className="w-5 h-5" />}
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      leftIcon={<Lock className="w-5 h-5" />}
                    />

                    <Button
                      onClick={handleSetPassword}
                      isLoading={isLoading}
                      size="sm"
                    >
                      {hasPassword ? 'Update Password' : 'Set Password'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Security */}
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Privacy & Security</p>
                    <p className="text-white/40 text-sm">Manage your security settings</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-red-400 font-medium">Log Out</p>
                    <p className="text-white/40 text-sm">Sign out of your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 text-center text-white/40 text-sm">
            <p>Account created {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p className="mt-1">User ID: {user.id}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
