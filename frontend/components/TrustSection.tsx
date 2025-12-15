import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TrustPoint {
    id: string;
    icon: IconName;
    title: string;
    description: string;
}

const TRUST_POINTS: TrustPoint[] = [
    {
        id: '1',
        icon: 'shield-checkmark',
        title: 'Secure Payments',
        description: 'Payments routed directly to licensed wallets—Telebirr, CBE Birr, and banks. We never hold your funds.',
    },
    {
        id: '2',
        icon: 'receipt-outline',
        title: 'Instant QR Tickets',
        description: 'Get your tickets immediately via app and SMS. Works offline at venue entry.',
    },
    {
        id: '3',
        icon: 'cash-outline',
        title: 'Fast Settlements',
        description: 'Organizers receive funds within T+1/T+2 through our banking partners. No waiting weeks.',
    },
    {
        id: '4',
        icon: 'document-text-outline',
        title: 'NBE Compliant',
        description: 'Architected for National Bank of Ethiopia regulations. Payment facilitation today, PSO-ready tomorrow.',
    },
];

interface PaymentPartner {
    id: string;
    name: string;
}

const PAYMENT_PARTNERS: PaymentPartner[] = [
    { id: '1', name: 'Telebirr' },
    { id: '2', name: 'CBE Birr' },
    { id: '3', name: 'CBE' },
    { id: '4', name: 'Awash Bank' },
    { id: '5', name: 'Dashen Bank' },
];

export const TrustSection: React.FC = () => {
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDesktop = width > 1024;
    const isTablet = width > 768;

    return (
        <LinearGradient
            colors={colorScheme === 'dark' ? ['#1A1A2E', '#0F0F1A'] : ['#F8F9FA', '#FFFFFF']}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.securityBadge, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="lock-closed" size={16} color={theme.primary} />
                    <Text style={[styles.securityBadgeText, { color: theme.primary }]}>
                        Payment Facilitator
                    </Text>
                </View>
                <Text style={[styles.title, { color: theme.text }]}>
                    Trust-first payments
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    We don't hold your money. Payments go directly to licensed financial institutions.
                </Text>
            </View>

            {/* Trust Points Grid */}
            <View style={[
                styles.trustGrid,
                isDesktop && styles.trustGridDesktop,
                isTablet && !isDesktop && styles.trustGridTablet,
            ]}>
                {TRUST_POINTS.map((point) => (
                    <View
                        key={point.id}
                        style={[
                            styles.trustCard,
                            { backgroundColor: theme.card, borderColor: theme.border }
                        ]}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                            <Ionicons name={point.icon} size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.trustTitle, { color: theme.text }]}>
                            {point.title}
                        </Text>
                        <Text style={[styles.trustDescription, { color: theme.textSecondary }]}>
                            {point.description}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Payment Partners */}
            <View style={styles.partnersSection}>
                <Text style={[styles.partnersLabel, { color: theme.textSecondary }]}>
                    PAYMENT PARTNERS
                </Text>
                <View style={styles.partnersRow}>
                    {PAYMENT_PARTNERS.map((partner) => (
                        <View
                            key={partner.id}
                            style={[styles.partnerBadge, { backgroundColor: theme.card, borderColor: theme.border }]}
                        >
                            <Text style={[styles.partnerName, { color: theme.text }]}>
                                {partner.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Regulatory Note */}
            <View style={[styles.regulatoryNote, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Ionicons name="information-circle" size={20} color={theme.textSecondary} />
                <Text style={[styles.regulatoryText, { color: theme.textSecondary }]}>
                    PassAddis operates as a payment facilitator under Ethiopian financial regulations.
                    Customer funds are processed through licensed banks and mobile money providers.
                    We do not hold, store, or manage customer funds.
                </Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 80,
        paddingHorizontal: 24,
    },
    header: {
        maxWidth: 700,
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        marginBottom: 20,
    },
    securityBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
    },
    trustGrid: {
        maxWidth: 900,
        width: '100%',
        alignSelf: 'center',
        gap: 20,
    },
    trustGridDesktop: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    trustGridTablet: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    trustCard: {
        width: 280,
        maxWidth: '100%',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    trustTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    trustDescription: {
        fontSize: 15,
        lineHeight: 23,
    },
    partnersSection: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        marginTop: 60,
        alignItems: 'center',
    },
    partnersLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 20,
    },
    partnersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    partnerBadge: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    partnerName: {
        fontSize: 14,
        fontWeight: '600',
    },
    regulatoryNote: {
        maxWidth: 900,
        width: '100%',
        alignSelf: 'center',
        marginTop: 48,
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
    },
    regulatoryText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
});
