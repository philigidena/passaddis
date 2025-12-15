import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Feature {
    icon: IconName;
    title: string;
    description: string;
}

const FEATURES: Feature[] = [
    {
        icon: 'ticket-outline',
        title: 'Sell Tickets Anywhere',
        description: 'Create events in minutes. Sell via your website, social media, or PassAddis app.',
    },
    {
        icon: 'people-outline',
        title: 'Attendee Management',
        description: 'Track sales in real-time. Check in guests with QR scanning. Send updates to attendees.',
    },
    {
        icon: 'cash-outline',
        title: 'Fast Payouts',
        description: 'Get your money within T+1/T+2. No waiting for event end. Direct to your bank.',
    },
    {
        icon: 'analytics-outline',
        title: 'Event Analytics',
        description: 'Understand your audience. Track ticket sales, revenue, and attendee demographics.',
    },
    {
        icon: 'storefront-outline',
        title: 'Add-on Sales',
        description: 'Sell drinks, snacks, and merch alongside tickets. Increase revenue per attendee.',
    },
    {
        icon: 'shield-checkmark-outline',
        title: 'Secure & Compliant',
        description: 'Payments processed through licensed banks. Full audit trail for every transaction.',
    },
];

const PRICING_TIERS = [
    {
        name: 'Free Events',
        price: 'Free',
        description: 'For free events',
        features: ['Unlimited free tickets', 'Basic analytics', 'QR check-in', 'Email support'],
    },
    {
        name: 'Standard',
        price: '3%',
        description: 'Per paid ticket',
        features: ['All Free features', 'Paid ticket sales', 'Fast payouts (T+2)', 'Shop add-ons', 'Priority support'],
        highlighted: true,
    },
    {
        name: 'Premium',
        price: '2%',
        description: 'High volume events',
        features: ['All Standard features', 'Dedicated support', 'Same-day payouts', 'Custom branding', 'API access'],
    },
];

export default function OrganizersScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>For Organizers</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <LinearGradient
                    colors={[theme.primary, '#1E3A5F']}
                    style={styles.hero}
                >
                    <View style={[styles.heroContent, { maxWidth: isDesktop ? 600 : '100%' }]}>
                        <Text style={styles.heroTitle}>
                            Grow your events with PassAddis
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            Sell tickets, manage attendees, and get paid fast. Everything you need to run successful events in Ethiopia.
                        </Text>
                        <TouchableOpacity style={styles.heroCta}>
                            <Text style={[styles.heroCtaText, { color: theme.primary }]}>Create Your First Event</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: theme.primary }]}>FEATURES</Text>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Everything you need
                    </Text>

                    <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
                        {FEATURES.map((feature, index) => (
                            <View
                                key={index}
                                style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                            >
                                <View style={[styles.featureIcon, { backgroundColor: theme.primaryLight }]}>
                                    <Ionicons name={feature.icon} size={24} color={theme.primary} />
                                </View>
                                <Text style={[styles.featureTitle, { color: theme.text }]}>
                                    {feature.title}
                                </Text>
                                <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                                    {feature.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pricing */}
                <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={[styles.sectionLabel, { color: theme.primary }]}>PRICING</Text>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Simple, transparent pricing
                    </Text>

                    <View style={[styles.pricingGrid, isDesktop && styles.pricingGridDesktop]}>
                        {PRICING_TIERS.map((tier, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.pricingCard,
                                    { backgroundColor: theme.card, borderColor: tier.highlighted ? theme.primary : theme.border },
                                    tier.highlighted && styles.pricingCardHighlighted
                                ]}
                            >
                                {tier.highlighted && (
                                    <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.popularBadgeText}>Most Popular</Text>
                                    </View>
                                )}
                                <Text style={[styles.tierName, { color: theme.text }]}>{tier.name}</Text>
                                <Text style={[styles.tierPrice, { color: theme.primary }]}>{tier.price}</Text>
                                <Text style={[styles.tierDescription, { color: theme.textSecondary }]}>
                                    {tier.description}
                                </Text>
                                <View style={styles.tierFeatures}>
                                    {tier.features.map((feature, fIndex) => (
                                        <View key={fIndex} style={styles.tierFeatureRow}>
                                            <Ionicons name="checkmark" size={16} color={theme.primary} />
                                            <Text style={[styles.tierFeatureText, { color: theme.text }]}>
                                                {feature}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.tierButton,
                                        { backgroundColor: tier.highlighted ? theme.primary : 'transparent', borderColor: theme.primary }
                                    ]}
                                >
                                    <Text style={[styles.tierButtonText, { color: tier.highlighted ? '#FFFFFF' : theme.primary }]}>
                                        Get Started
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

                {/* CTA */}
                <View style={styles.ctaSection}>
                    <Text style={[styles.ctaTitle, { color: theme.text }]}>
                        Ready to start?
                    </Text>
                    <Text style={[styles.ctaSubtitle, { color: theme.textSecondary }]}>
                        Create your first event in minutes. No setup fees, no monthly charges.
                    </Text>
                    <TouchableOpacity style={[styles.ctaButton, { backgroundColor: theme.primary }]}>
                        <Text style={styles.ctaButtonText}>Create Event for Free</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    hero: {
        padding: 32,
        paddingTop: 48,
        paddingBottom: 48,
    },
    heroContent: {
        alignSelf: 'center',
        width: '100%',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 16,
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 24,
        marginBottom: 24,
    },
    heroCta: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    heroCtaText: {
        fontSize: 15,
        fontWeight: '700',
    },
    section: {
        padding: 32,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 32,
        letterSpacing: -0.5,
    },
    featuresGrid: {
        gap: 16,
    },
    featuresGridDesktop: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        flex: 1,
        minWidth: 280,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 8,
    },
    featureDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    pricingGrid: {
        gap: 16,
    },
    pricingGridDesktop: {
        flexDirection: 'row',
    },
    pricingCard: {
        padding: 24,
        borderRadius: 20,
        borderWidth: 2,
        flex: 1,
        position: 'relative',
    },
    pricingCardHighlighted: {
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
    },
    popularBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    tierName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    tierPrice: {
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 4,
    },
    tierDescription: {
        fontSize: 14,
        marginBottom: 20,
    },
    tierFeatures: {
        gap: 10,
        marginBottom: 24,
    },
    tierFeatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tierFeatureText: {
        fontSize: 14,
    },
    tierButton: {
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
    },
    tierButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    ctaSection: {
        padding: 32,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    ctaSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        maxWidth: 400,
    },
    ctaButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    ctaButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
