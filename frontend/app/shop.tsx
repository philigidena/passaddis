import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ShopItem {
    id: string;
    name: string;
    price: number;
    priceDisplay: string;
    image: string;
    category: string;
    description: string;
    inStock: boolean;
    badge?: string;
}

const SHOP_ITEMS: ShopItem[] = [
    {
        id: '1',
        name: 'Ambo Water Pack (6)',
        price: 180,
        priceDisplay: '180 ETB',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop&q=80',
        category: 'Drinks',
        description: 'Pack of 6 Ambo mineral water bottles',
        inStock: true,
    },
    {
        id: '2',
        name: 'Event Snack Box',
        price: 250,
        priceDisplay: '250 ETB',
        image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop&q=80',
        category: 'Snacks',
        description: 'Assorted snacks perfect for events',
        inStock: true,
        badge: 'Popular',
    },
    {
        id: '3',
        name: 'PassAddis Cap',
        price: 350,
        priceDisplay: '350 ETB',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop&q=80',
        category: 'Merch',
        description: 'Official PassAddis branded cap',
        inStock: true,
    },
    {
        id: '4',
        name: 'Ethiopian Coffee Set',
        price: 420,
        priceDisplay: '420 ETB',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop&q=80',
        category: 'Drinks',
        description: 'Premium Ethiopian coffee set',
        inStock: true,
        badge: 'Best Seller',
    },
    {
        id: '5',
        name: 'Energy Drink Pack',
        price: 300,
        priceDisplay: '300 ETB',
        image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&h=400&fit=crop&q=80',
        category: 'Drinks',
        description: 'Pack of 4 energy drinks',
        inStock: false,
    },
    {
        id: '6',
        name: 'PassAddis T-Shirt',
        price: 500,
        priceDisplay: '500 ETB',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80',
        category: 'Merch',
        description: 'Comfortable cotton tee with logo',
        inStock: true,
        badge: 'New',
    },
    {
        id: '7',
        name: 'Mixed Nuts Pack',
        price: 200,
        priceDisplay: '200 ETB',
        image: 'https://images.unsplash.com/photo-1536591375657-fc29be29f3be?w=400&h=400&fit=crop&q=80',
        category: 'Snacks',
        description: 'Healthy mixed nuts for events',
        inStock: true,
    },
    {
        id: '8',
        name: 'PassAddis Tote Bag',
        price: 280,
        priceDisplay: '280 ETB',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop&q=80',
        category: 'Merch',
        description: 'Eco-friendly canvas tote bag',
        inStock: true,
    },
];

const CATEGORIES = [
    { id: 'All', label: 'All Items', icon: 'grid-outline' },
    { id: 'Drinks', label: 'Drinks', icon: 'cafe-outline' },
    { id: 'Snacks', label: 'Snacks', icon: 'fast-food-outline' },
    { id: 'Merch', label: 'Merch', icon: 'shirt-outline' },
];

export default function ShopScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const numColumns = isDesktop ? 4 : width > 500 ? 3 : 2;
    const maxContentWidth = 800;

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cartCount, setCartCount] = useState(0);

    const filteredItems = SHOP_ITEMS.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    );

    const addToCart = () => {
        setCartCount(prev => prev + 1);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with gradient */}
                <View style={styles.headerSection}>
                    <LinearGradient
                        colors={['#1A1A2E', '#2D2D44']}
                        style={styles.headerGradient}
                    >
                        <View style={[styles.headerContent, { maxWidth: maxContentWidth }]}>
                            <View style={styles.navRow}>
                                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <View style={styles.headerTitleGroup}>
                                    <Text style={styles.headerTitle}>Shop</Text>
                                    <Text style={styles.headerSubtitle}>Pickup at venue</Text>
                                </View>
                                <TouchableOpacity style={styles.cartButton}>
                                    <Ionicons name="bag-outline" size={24} color="#FFFFFF" />
                                    {cartCount > 0 && (
                                        <View style={[styles.cartBadge, { backgroundColor: theme.primary }]}>
                                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Promo Banner */}
                            <View style={[styles.promoBanner, { backgroundColor: theme.gold }]}>
                                <Ionicons name="flash" size={18} color="#1A1A2E" />
                                <Text style={styles.promoText}>
                                    Bundle with tickets & save up to 15%!
                                </Text>
                                <Ionicons name="arrow-forward" size={16} color="#1A1A2E" />
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Main Content Container */}
                <View style={[styles.mainContent, { maxWidth: maxContentWidth }]}>
                    {/* Pickup Notice */}
                    <View style={[styles.pickupNotice, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                        <View style={[styles.pickupIconWrapper, { backgroundColor: theme.primary }]}>
                            <Ionicons name="location" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.pickupTextWrapper}>
                            <Text style={[styles.pickupTitle, { color: theme.text }]}>Pickup Only</Text>
                            <Text style={[styles.pickupDesc, { color: theme.textSecondary }]}>
                                Show your QR code at venue counter to collect items
                            </Text>
                        </View>
                    </View>

                    {/* Categories */}
                    <View style={styles.categoriesSection}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesScroll}
                        >
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        { backgroundColor: selectedCategory === cat.id ? theme.primary : theme.backgroundSecondary }
                                    ]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                >
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={18}
                                        color={selectedCategory === cat.id ? '#FFFFFF' : theme.text}
                                    />
                                    <Text style={[
                                        styles.categoryChipText,
                                        { color: selectedCategory === cat.id ? '#FFFFFF' : theme.text }
                                    ]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Results count */}
                    <View style={styles.resultsHeader}>
                        <Text style={[styles.resultsTitle, { color: theme.text }]}>
                            {selectedCategory === 'All' ? 'All Items' : selectedCategory}
                        </Text>
                        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
                            {filteredItems.length} items
                        </Text>
                    </View>

                    {/* Products Grid */}
                    <View style={styles.productsGrid}>
                        {filteredItems.map((item) => (
                            <ProductCard
                                key={item.id}
                                item={item}
                                theme={theme}
                                numColumns={numColumns}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </View>

                    {/* Empty state */}
                    {filteredItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
                                <Ionicons name="storefront-outline" size={40} color={theme.icon} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No items found</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Try selecting a different category
                            </Text>
                        </View>
                    )}

                    {/* Bundle CTA */}
                    <View style={[styles.bundleCta, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.bundleCtaHeader}>
                            <View style={[styles.bundleIconWrapper, { backgroundColor: theme.gold }]}>
                                <Ionicons name="gift" size={24} color="#1A1A2E" />
                            </View>
                            <View style={styles.bundleCtaText}>
                                <Text style={[styles.bundleCtaTitle, { color: theme.text }]}>
                                    Event Bundles
                                </Text>
                                <Text style={[styles.bundleCtaDesc, { color: theme.textSecondary }]}>
                                    Get tickets + refreshments together and save!
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.bundleCtaButton, { backgroundColor: theme.primary }]}>
                            <Text style={styles.bundleCtaButtonText}>View Bundles</Text>
                            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

interface ProductCardProps {
    item: ShopItem;
    theme: typeof Colors.light;
    numColumns: number;
    onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, theme, numColumns, onAddToCart }) => {
    const cardWidth = numColumns === 2 ? '48%' : numColumns === 3 ? '31%' : '23%';

    return (
        <TouchableOpacity
            style={[
                styles.productCard,
                { backgroundColor: theme.card, borderColor: theme.border, width: cardWidth as any },
                !item.inStock && styles.productCardOutOfStock
            ]}
            disabled={!item.inStock}
            activeOpacity={0.9}
        >
            <View style={styles.productImageWrapper}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                {!item.inStock && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
                {item.badge && item.inStock && (
                    <View style={[
                        styles.productBadge,
                        { backgroundColor: item.badge === 'Best Seller' ? theme.gold : item.badge === 'New' ? theme.primary : '#EF4444' }
                    ]}>
                        <Text style={[
                            styles.productBadgeText,
                            { color: item.badge === 'Best Seller' ? '#1A1A2E' : '#FFFFFF' }
                        ]}>
                            {item.badge}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.productContent}>
                <Text style={[styles.productCategory, { color: theme.textSecondary }]}>
                    {item.category}
                </Text>
                <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.productFooter}>
                    <Text style={[styles.productPrice, { color: theme.primary }]}>
                        {item.priceDisplay}
                    </Text>
                    {item.inStock && (
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: theme.primary }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onAddToCart();
                            }}
                        >
                            <Ionicons name="add" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        overflow: 'hidden',
    },
    headerGradient: {
        paddingTop: 16,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerContent: {
        width: '100%',
        paddingHorizontal: 20,
        alignSelf: 'center',
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleGroup: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    cartButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    promoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    promoText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    mainContent: {
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    pickupNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginTop: 20,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
    },
    pickupIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupTextWrapper: {
        flex: 1,
    },
    pickupTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    pickupDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    categoriesSection: {
        paddingTop: 20,
    },
    categoriesScroll: {
        gap: 10,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 16,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    resultsCount: {
        fontSize: 13,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    productCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 4,
    },
    productCardOutOfStock: {
        opacity: 0.6,
    },
    productImageWrapper: {
        aspectRatio: 1,
        position: 'relative',
        backgroundColor: '#F5F5F5',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    productBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    productBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    productContent: {
        padding: 12,
    },
    productCategory: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 10,
        minHeight: 36,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    bundleCta: {
        marginTop: 32,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    bundleCtaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 16,
    },
    bundleIconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 13,
        lineHeight: 18,
    },
    bundleCtaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    bundleCtaButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
