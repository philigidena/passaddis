import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, useColorScheme } from 'react-native';
import { Colors, Brand } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface FooterLink {
    label: string;
    href: string;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
    {
        title: 'Platform',
        links: [
            { label: 'Browse Events', href: '/events' },
            { label: 'Shop', href: '/shop' },
            { label: 'My Orders', href: '/orders' },
            { label: 'My Tickets', href: '/tickets' },
        ],
    },
    {
        title: 'For Organizers',
        links: [
            { label: 'Create Event', href: '/organizers/create' },
            { label: 'Dashboard', href: '/organizers/dashboard' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Payouts', href: '/organizers/payouts' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Careers', href: '/careers' },
            { label: 'Blog', href: '/blog' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Refund Policy', href: '/refunds' },
            { label: 'Cookie Policy', href: '/cookies' },
        ],
    },
];

interface SocialLink {
    icon: IconName;
    href: string;
    label: string;
}

const SOCIAL_LINKS: SocialLink[] = [
    { icon: 'logo-facebook', href: '#', label: 'Facebook' },
    { icon: 'logo-instagram', href: '#', label: 'Instagram' },
    { icon: 'logo-twitter', href: '#', label: 'Twitter' },
    { icon: 'logo-linkedin', href: '#', label: 'LinkedIn' },
];

export const Footer: React.FC = () => {
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDesktop = width > 1024;
    const isTablet = width > 768;

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.content}>
                {/* Top Section */}
                <View style={[
                    styles.topSection,
                    isDesktop && styles.topSectionDesktop,
                ]}>
                    {/* Brand Column */}
                    <View style={styles.brandColumn}>
                        <Image
                            source={require('@/assets/images/PassAddis_Logo_white.png')}
                            style={styles.footerLogo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.brandDescription, { color: theme.textSecondary }]}>
                            {Brand.description}
                        </Text>

                        {/* Social Links */}
                        <View style={styles.socialLinks}>
                            {SOCIAL_LINKS.map((social) => (
                                <TouchableOpacity
                                    key={social.label}
                                    style={[styles.socialButton, { backgroundColor: theme.card }]}
                                >
                                    <Ionicons name={social.icon} size={18} color={theme.text} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Links Columns */}
                    <View style={[
                        styles.linksContainer,
                        isDesktop && styles.linksContainerDesktop,
                        isTablet && !isDesktop && styles.linksContainerTablet,
                    ]}>
                        {FOOTER_SECTIONS.map((section) => (
                            <View key={section.title} style={styles.linkColumn}>
                                <Text style={[styles.columnTitle, { color: theme.text }]}>
                                    {section.title}
                                </Text>
                                {section.links.map((link) => (
                                    <TouchableOpacity key={link.label}>
                                        <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                                            {link.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                {/* Bottom Section */}
                <View style={[
                    styles.bottomSection,
                    isDesktop && styles.bottomSectionDesktop,
                ]}>
                    <Text style={[styles.copyright, { color: theme.textSecondary }]}>
                        © 2025 PassAddis. All rights reserved.
                    </Text>

                    <View style={styles.bottomLinks}>
                        <View style={styles.locationBadge}>
                            <Ionicons name="location" size={14} color={theme.textSecondary} />
                            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                                Addis Ababa, Ethiopia
                            </Text>
                        </View>
                        <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                        <Text style={[styles.regText, { color: theme.textSecondary }]}>
                            Payment Facilitator
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
    },
    topSection: {
        gap: 48,
    },
    topSectionDesktop: {
        flexDirection: 'row',
        gap: 80,
    },
    brandColumn: {
        maxWidth: 300,
    },
    footerLogo: {
        width: 140,
        height: 40,
        marginBottom: 16,
    },
    brandDescription: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
    },
    socialLinks: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linksContainer: {
        flex: 1,
        gap: 32,
    },
    linksContainerDesktop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    linksContainerTablet: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    linkColumn: {
        minWidth: 140,
        gap: 14,
    },
    columnTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    linkText: {
        fontSize: 14,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        marginVertical: 40,
    },
    bottomSection: {
        gap: 16,
        alignItems: 'center',
    },
    bottomSectionDesktop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    copyright: {
        fontSize: 13,
    },
    bottomLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    regText: {
        fontSize: 13,
    },
});
