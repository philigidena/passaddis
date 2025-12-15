/**
 * PassAddis Theme Configuration
 * Ethiopia-focused event, ticketing & shop platform
 */

import { Platform } from 'react-native';

// PassAddis Brand Colors
const primaryGreen = '#00A86B'; // Ethiopian Green - Trust & Growth
const primaryGold = '#FFD700'; // Gold accent - Premium feel
const secondaryBlue = '#1E3A5F'; // Deep blue - Professional
const accentOrange = '#FF6B35'; // Vibrant orange - CTAs

export const Colors = {
  light: {
    text: '#1A1A2E',
    textSecondary: '#4A4A68',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    tint: primaryGreen,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryGreen,
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',
    primary: primaryGreen,
    primaryLight: '#E6F7F0',
    secondary: secondaryBlue,
    accent: accentOrange,
    gold: primaryGold,
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    shadow: '#000000',
    // Status colors
    statusPaid: '#10B981',
    statusPending: '#F59E0B',
    statusReady: '#3B82F6',
    statusPickedUp: '#6B7280',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    background: '#0F0F1A',
    backgroundSecondary: '#1A1A2E',
    tint: '#4ADE80',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#4ADE80',
    card: '#1A1A2E',
    cardElevated: '#252540',
    border: 'rgba(255, 255, 255, 0.1)',
    primary: '#4ADE80',
    primaryLight: '#1A2E1A',
    secondary: '#60A5FA',
    accent: '#FB923C',
    gold: '#FBBF24',
    danger: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    shadow: '#000000',
    // Status colors
    statusPaid: '#34D399',
    statusPending: '#FBBF24',
    statusReady: '#60A5FA',
    statusPickedUp: '#9CA3AF',
  },
};

// Brand constants
export const Brand = {
  name: 'PassAddis',
  tagline: 'Events. Tickets. Shop.',
  description: 'Ethiopia\'s event-first platform for ticketing, booking & curated shopping',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
