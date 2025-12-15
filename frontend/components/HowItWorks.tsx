import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Step {
    id: string;
    number: string;
    title: string;
    description: string;
    icon: IconName;
}

const STEPS: Step[] = [
    {
        id: '1',
        number: '01',
        title: 'Find Your Event',
        description: 'Browse concerts, expos, and local happenings. Add tickets and event bundles to your cart.',
        icon: 'search-outline',
    },
    {
        id: '2',
        number: '02',
        title: 'Pay Securely',
        description: 'Checkout with Telebirr, CBE Birr, or your bank. We route payments directly—no funds held.',
        icon: 'shield-checkmark-outline',
    },
    {
        id: '3',
        number: '03',
        title: 'Show & Pick Up',
        description: 'Get your QR ticket instantly. At the venue, scan to enter and pick up your shop items.',
        icon: 'qr-code-outline',
    },
];

export const HowItWorks: React.FC = () => {
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDesktop = width > 1024;
    const isTablet = width > 768 && width <= 1024;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: theme.primary }]}>HOW IT WORKS</Text>
                <Text style={[styles.title, { color: theme.text }]}>
                    3 taps to your ticket
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Simple, fast checkout designed for Ethiopia's mobile-first users
                </Text>
            </View>

            <View style={[
                styles.stepsContainer,
                isDesktop && styles.stepsRow,
                !isDesktop && styles.stepsColumn
            ]}>
                {STEPS.map((step, index) => (
                    <View key={step.id} style={styles.stepWrapper}>
                        <View style={[
                            styles.stepCard,
                            { backgroundColor: theme.card, borderColor: theme.border }
                        ]}>
                            {/* Step Number */}
                            <View style={[styles.stepNumber, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.stepNumberText, { color: theme.primary }]}>
                                    {step.number}
                                </Text>
                            </View>

                            {/* Icon */}
                            <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
                                <Ionicons name={step.icon} size={32} color={theme.primary} />
                            </View>

                            {/* Content */}
                            <Text style={[styles.stepTitle, { color: theme.text }]}>
                                {step.title}
                            </Text>
                            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                                {step.description}
                            </Text>
                        </View>

                        {/* Connector Line (not on last item) */}
                        {isDesktop && index < STEPS.length - 1 && (
                            <View style={styles.connectorWrapper}>
                                <View style={[styles.connector, { backgroundColor: theme.border }]} />
                                <Ionicons name="chevron-forward" size={16} color={theme.icon} />
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 80,
        paddingHorizontal: 24,
    },
    header: {
        maxWidth: 600,
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 26,
    },
    stepsContainer: {
        maxWidth: 900,
        width: '100%',
        alignSelf: 'center',
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 16,
    },
    stepsColumn: {
        gap: 24,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 280,
    },
    stepCard: {
        flex: 1,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        position: 'relative',
    },
    stepNumber: {
        position: 'absolute',
        top: -12,
        left: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '800',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    connectorWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    connector: {
        width: 40,
        height: 2,
    },
});
