import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, useWindowDimensions, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ShopItem {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    eventBundle?: string;
}

const SHOP_ITEMS: ShopItem[] = [
    {
        id: '1',
        name: 'Ambo Water Pack (6)',
        price: '180 ETB',
        image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=300&fit=crop&q=80',
        category: 'Drinks',
    },
    {
        id: '2',
        name: 'Event Snack Box',
        price: '250 ETB',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop&q=80',
        category: 'Snacks',
        eventBundle: 'Popular at Jazz Festival',
    },
    {
        id: '3',
        name: 'PassAddis Cap',
        price: '350 ETB',
        image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=300&fit=crop&q=80',
        category: 'Merch',
    },
    {
        id: '4',
        name: 'Coffee Bundle',
        price: '420 ETB',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&q=80',
        category: 'Drinks',
        eventBundle: 'Great for morning events',
    },
];

interface ShopItemCardProps {
    item: ShopItem;
    onPress: () => void;
}

const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, onPress }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.image} />
                {item.eventBundle && (
                    <View style={[styles.bundleBadge, { backgroundColor: theme.gold }]}>
                        <Ionicons name="gift-outline" size={10} color="#1A1A2E" />
                        <Text style={styles.bundleText}>Bundle</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>
                    {item.category}
                </Text>
                <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: theme.primary }]}>{item.price}</Text>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="add" size={18} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const ShopPreview: React.FC = () => {
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDesktop = width > 1024;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconWrapper, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="storefront" size={24} color={theme.primary} />
                    </View>
                    <View>
                        <Text style={[styles.label, { color: theme.primary }]}>CURATED SHOP</Text>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Grab & go at the venue
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={[styles.seeAllText, { color: theme.primary }]}>Browse Shop</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                Order drinks, snacks, and merch with your tickets. Pick up at the venue—no lines, no waiting.
            </Text>

            {/* Pickup Badge */}
            <View style={[styles.pickupBadge, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Ionicons name="location" size={18} color={theme.primary} />
                <Text style={[styles.pickupText, { color: theme.text }]}>
                    Pickup Only • Show QR at venue counter
                </Text>
            </View>

            {/* Shop Items Grid */}
            {isDesktop ? (
                <View style={styles.gridDesktop}>
                    {SHOP_ITEMS.map((item) => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onPress={() => console.log('Item pressed:', item.name)}
                        />
                    ))}
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {SHOP_ITEMS.map((item) => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onPress={() => console.log('Item pressed:', item.name)}
                        />
                    ))}
                </ScrollView>
            )}

            {/* Bundle CTA */}
            <View style={[styles.bundleCta, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.bundleCtaContent}>
                    <Ionicons name="ticket" size={24} color={theme.gold} />
                    <View style={styles.bundleCtaText}>
                        <Text style={[styles.bundleCtaTitle, { color: theme.text }]}>
                            Ticket + Shop Bundles
                        </Text>
                        <Text style={[styles.bundleCtaDesc, { color: theme.textSecondary }]}>
                            Save up to 15% when you bundle tickets with refreshments
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.bundleCtaButton, { backgroundColor: theme.primary }]}>
                    <Text style={styles.bundleCtaButtonText}>View Bundles</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        marginBottom: 20,
    },
    pickupBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        borderWidth: 1,
        marginBottom: 32,
        maxWidth: 1200,
    },
    pickupText: {
        fontSize: 14,
        fontWeight: '500',
    },
    gridDesktop: {
        flexDirection: 'row',
        gap: 20,
        maxWidth: 1000,
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    scrollContainer: {
        gap: 16,
        paddingRight: 24,
    },
    card: {
        width: 220,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    imageWrapper: {
        height: 140,
        position: 'relative',
        backgroundColor: '#F0F0F0',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bundleBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    bundleText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    cardContent: {
        padding: 14,
    },
    categoryLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bundleCta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 32,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    bundleCtaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    bundleCtaText: {
        flex: 1,
    },
    bundleCtaTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    bundleCtaDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    bundleCtaButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    bundleCtaButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
