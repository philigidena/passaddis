/**
 * Profile Screen
 * User profile, settings, and account management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        </View>
        <View style={styles.notAuthContainer}>
          <LinearGradient
            colors={[theme.primary, '#006644']}
            style={styles.notAuthIconWrapper}
          >
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.notAuthTitle, { color: theme.text }]}>Welcome to PassAddis</Text>
          <Text style={[styles.notAuthText, { color: theme.textSecondary }]}>
            Sign in to access your tickets, orders, and personalized recommendations
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/signin')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createAccountButton, { borderColor: theme.primary }]}
            onPress={() => router.push('/signin')}
          >
            <Text style={[styles.createAccountText, { color: theme.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Check if user is organizer or admin
  const isOrganizerOrAdmin = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  const menuItems = [
    // Scanner option for organizers/admins
    ...(isOrganizerOrAdmin ? [{
      id: 'scanner',
      icon: 'scan-outline',
      label: 'Scan Tickets',
      sublabel: 'Validate tickets at entry',
      onPress: () => router.push('/scanner' as any),
    }] : []),
    {
      id: 'tickets',
      icon: 'ticket-outline',
      label: 'My Tickets',
      sublabel: 'View your event tickets',
      onPress: () => router.push('/(tabs)/tickets'),
    },
    {
      id: 'orders',
      icon: 'bag-outline',
      label: 'Order History',
      sublabel: 'View past orders',
      onPress: () => {},
    },
    {
      id: 'payment',
      icon: 'card-outline',
      label: 'Payment Methods',
      sublabel: 'Manage payment options',
      onPress: () => {},
    },
    {
      id: 'favorites',
      icon: 'heart-outline',
      label: 'Saved Events',
      sublabel: 'Events you liked',
      onPress: () => {},
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      hasSwitch: true,
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: 'language',
      icon: 'language-outline',
      label: 'Language',
      value: 'English',
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help & Support',
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About PassAddis',
    },
    {
      id: 'terms',
      icon: 'document-text-outline',
      label: 'Terms & Privacy',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.card }]}>
            <Ionicons name="settings-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={[theme.primary, '#006644']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileInfo}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.name?.[0]?.toUpperCase() || user?.phone?.[0] || 'U'}
                  </Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user?.name || 'PassAddis User'}</Text>
                <Text style={styles.profilePhone}>{user?.phone}</Text>
                {user?.email && (
                  <Text style={styles.profileEmail}>{user.email}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Quick Stats */}
          <View style={[styles.statsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Events</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Orders</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Points</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ACCOUNT</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }
                ]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconWrapper, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name={item.icon as any} size={20} color={theme.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                  <Text style={[styles.menuSublabel, { color: theme.textSecondary }]}>{item.sublabel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.icon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SETTINGS</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {settingsItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.settingsItem,
                  index < settingsItems.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }
                ]}
              >
                <View style={[styles.menuIconWrapper, { backgroundColor: theme.backgroundSecondary }]}>
                  <Ionicons name={item.icon as any} size={20} color={theme.icon} />
                </View>
                <Text style={[styles.settingsLabel, { color: theme.text }]}>{item.label}</Text>
                {item.hasSwitch ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFFFFF"
                  />
                ) : item.value ? (
                  <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>{item.value}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={[styles.signOutButton, { borderColor: '#EF4444' }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>
            PassAddis v1.0.0
          </Text>
          <Text style={[styles.copyrightText, { color: theme.textSecondary }]}>
            Made with love in Ethiopia
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  notAuthText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  signInButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  createAccountButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  createAccountText: {
    fontSize: 17,
    fontWeight: '700',
  },
  profileSection: {
    padding: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSublabel: {
    fontSize: 13,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  settingsValue: {
    fontSize: 14,
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
  },
});
