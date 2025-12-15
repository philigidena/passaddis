import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, useColorScheme, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Hero image - Singer performing on stage with crowd
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=900&fit=crop&q=80';

export const Hero: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDesktop = width > 768;
    const isMobile = width <= 480;
    const heroHeight = isMobile ? 580 : isDesktop ? Math.min(height * 0.85, 650) : 600;

    return (
        <ImageBackground
            source={{ uri: HERO_IMAGE_URL }}
            style={[styles.container, { height: heroHeight }]}
            resizeMode="cover"
        >
            {/* Dark Overlay */}
            <LinearGradient
                colors={['rgba(15,15,26,0.7)', 'rgba(26,26,46,0.85)', 'rgba(15,15,26,0.95)']}
                style={styles.overlay}
            />

            {/* Content */}
            <View style={[
                styles.content,
                {
                    maxWidth: isDesktop ? 800 : '100%',
                    paddingHorizontal: isMobile ? 20 : 24,
                }
            ]}>
                {/* Badge */}
                <View style={styles.badge}>
                    <Ionicons name="shield-checkmark" size={14} color="#4ADE80" />
                    <Text style={styles.badgeText}>
                        Secure Payments via Telebirr & CBE Birr
                    </Text>
                </View>

                {/* Main Headline */}
                <Text style={[styles.headline, isMobile && styles.headlineMobile]}>
                    Events. Tickets.{'\n'}
                    <Text style={styles.headlineAccent}>Shop.</Text>
                </Text>

                {/* Subheadline */}
                <Text style={[styles.subheadline, isMobile && styles.subheadlineMobile]}>
                    Ethiopia's event-first platform. Book tickets, grab event bundles,
                    and pick up at the venue. No waiting, no hassle.
                </Text>

                {/* CTA Buttons */}
                <View style={[styles.ctaRow, isMobile && styles.ctaRowMobile]}>
                    <TouchableOpacity style={[styles.primaryCta, { backgroundColor: theme.primary }]}>
                        <Ionicons name="ticket-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.primaryCtaText}>Browse Events</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryCta}>
                        <Ionicons name="storefront-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.secondaryCtaText}>Visit Shop</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>50K+</Text>
                        <Text style={styles.statLabel}>Tickets Sold</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>200+</Text>
                        <Text style={styles.statLabel}>Events</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>T+1</Text>
                        <Text style={styles.statLabel}>Settlement</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        gap: 24,
        paddingTop: 80,
        zIndex: 1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        backgroundColor: 'rgba(0,168,107,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(74,222,128,0.3)',
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4ADE80',
    },
    headline: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -2,
        lineHeight: 54,
    },
    headlineMobile: {
        fontSize: 36,
        lineHeight: 42,
    },
    headlineAccent: {
        color: '#4ADE80',
    },
    subheadline: {
        fontSize: 17,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
        lineHeight: 26,
        maxWidth: 480,
    },
    subheadlineMobile: {
        fontSize: 15,
        lineHeight: 23,
    },
    ctaRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    ctaRowMobile: {
        flexDirection: 'column',
        width: '100%',
        gap: 10,
    },
    primaryCta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 12,
        minWidth: 170,
    },
    primaryCtaText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryCta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        minWidth: 170,
    },
    secondaryCtaText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 28,
        marginTop: 32,
        paddingTop: 28,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
    },
    statsRowMobile: {
        gap: 16,
        paddingTop: 24,
        marginTop: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
