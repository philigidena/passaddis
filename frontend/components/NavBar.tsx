import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Image, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface NavBarProps {
    transparent?: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ transparent = false }) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    const NAV_LINKS = [
        { label: 'Events', href: '/(tabs)/events' },
        { label: 'Shop', href: '/(tabs)/shop' },
        ...(isAuthenticated ? [{ label: 'My Tickets', href: '/(tabs)/tickets' }] : []),
    ];

    const navBg = transparent ? 'transparent' : theme.background;
    const borderColor = transparent ? 'transparent' : theme.border;

    const handleNavigation = (href: string) => {
        setIsMenuOpen(false);
        router.push(href as any);
    };

    const handleSignIn = () => {
        setIsMenuOpen(false);
        router.push('/signin');
    };

    const handleLogoPress = () => {
        router.push('/');
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: navBg,
                borderBottomColor: borderColor
            }
        ]}>
            <View style={styles.content}>
                {/* Logo */}
                <TouchableOpacity style={styles.logoContainer} onPress={handleLogoPress}>
                    <Image
                        source={require('@/assets/images/PassAddis_Logo_white.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {/* Desktop Navigation */}
                {isDesktop ? (
                    <View style={styles.desktopNav}>
                        <View style={styles.links}>
                            {NAV_LINKS.map((link) => (
                                <TouchableOpacity
                                    key={link.label}
                                    style={styles.linkItem}
                                    onPress={() => handleNavigation(link.href)}
                                >
                                    <Text style={[
                                        styles.linkText,
                                        { color: transparent ? '#FFFFFF' : theme.text }
                                    ]}>
                                        {link.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.authActions}>
                            {isAuthenticated ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.userButton}
                                        onPress={() => router.push('/(tabs)/profile' as any)}
                                    >
                                        <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
                                            <Text style={styles.userAvatarText}>
                                                {user?.name?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.userName,
                                            { color: transparent ? '#FFFFFF' : theme.text }
                                        ]}>
                                            {user?.name || user?.phone || 'User'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.logoutButton, { borderColor: transparent ? 'rgba(255,255,255,0.3)' : theme.border }]}
                                        onPress={logout}
                                    >
                                        <Ionicons name="log-out-outline" size={18} color={transparent ? '#FFFFFF' : theme.text} />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
                                        <Text style={[
                                            styles.loginText,
                                            { color: transparent ? '#FFFFFF' : theme.text }
                                        ]}>
                                            Sign In
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                                        onPress={handleSignIn}
                                    >
                                        <Text style={styles.primaryButtonText}>Get Started</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                ) : (
                    /* Mobile Menu Button */
                    <TouchableOpacity
                        onPress={() => setIsMenuOpen(!isMenuOpen)}
                        style={styles.menuButton}
                    >
                        <Ionicons
                            name={isMenuOpen ? "close" : "menu"}
                            size={24}
                            color={transparent ? '#FFFFFF' : theme.text}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Mobile Menu Dropdown */}
            {!isDesktop && isMenuOpen && (
                <View style={[styles.mobileMenu, { backgroundColor: theme.background }]}>
                    {NAV_LINKS.map((link) => (
                        <TouchableOpacity
                            key={link.label}
                            style={styles.mobileLinkItem}
                            onPress={() => handleNavigation(link.href)}
                        >
                            <Text style={[styles.mobileLinkText, { color: theme.text }]}>
                                {link.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View style={[styles.mobileDivider, { backgroundColor: theme.border }]} />
                    {isAuthenticated ? (
                        <>
                            <TouchableOpacity
                                style={styles.mobileLinkItem}
                                onPress={() => { setIsMenuOpen(false); router.push('/(tabs)/profile' as any); }}
                            >
                                <View style={[styles.mobileUserAvatar, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.mobileUserAvatarText}>
                                        {user?.name?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
                                    </Text>
                                </View>
                                <Text style={[styles.mobileLinkText, { color: theme.text }]}>
                                    {user?.name || user?.phone || 'My Profile'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mobileLogoutButton, { borderColor: theme.border }]}
                                onPress={() => { setIsMenuOpen(false); logout(); }}
                            >
                                <Ionicons name="log-out-outline" size={20} color={theme.error || '#EF4444'} />
                                <Text style={[styles.mobileLogoutText, { color: theme.error || '#EF4444' }]}>
                                    Sign Out
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.mobileLinkItem} onPress={handleSignIn}>
                                <Ionicons name="person-outline" size={20} color={theme.text} />
                                <Text style={[styles.mobileLinkText, { color: theme.text }]}>Sign In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mobileGetStarted, { backgroundColor: theme.primary }]}
                                onPress={handleSignIn}
                            >
                                <Text style={styles.mobileGetStartedText}>Get Started</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderBottomWidth: 1,
        zIndex: 100,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 180,
        height: 50,
    },
    desktopNav: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 48,
    },
    links: {
        flexDirection: 'row',
        gap: 32,
    },
    linkItem: {
        paddingVertical: 8,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '500',
    },
    authActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    loginButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    loginText: {
        fontSize: 15,
        fontWeight: '600',
    },
    primaryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    menuButton: {
        padding: 8,
    },
    mobileMenu: {
        padding: 20,
        gap: 8,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    mobileLinkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 8,
    },
    mobileLinkText: {
        fontSize: 17,
        fontWeight: '500',
    },
    mobileDivider: {
        height: 1,
        marginVertical: 8,
    },
    mobileGetStarted: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    mobileGetStartedText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // User authenticated styles
    userButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
    },
    logoutButton: {
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    mobileUserAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mobileUserAvatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    mobileLogoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    mobileLogoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
