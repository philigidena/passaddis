import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, useWindowDimensions, useColorScheme, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@/hooks/useEvents';
import { Event as ApiEvent } from '@/services/api';

interface FeaturedEventCardProps {
    event: ApiEvent;
    onPress: () => void;
    cardWidth: number;
}

const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event, onPress, cardWidth }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Format the date
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    // Format price range
    const priceRange = event.minPrice === 0
        ? 'Free'
        : event.minPrice === event.maxPrice
            ? `${event.minPrice} ETB`
            : `${event.minPrice} - ${event.maxPrice} ETB`;

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: theme.card, width: cardWidth }
            ]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: event.imageUrl }} style={styles.image} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                    style={styles.gradient}
                />

                {/* Category Badge */}
                <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.categoryText}>{event.category}</Text>
                </View>

                {/* Featured Badge */}
                {event.isFeatured && (
                    <View style={[styles.trendingBadge, { backgroundColor: theme.gold }]}>
                        <Ionicons name="star" size={12} color="#1A1A2E" />
                        <Text style={styles.trendingText}>Featured</Text>
                    </View>
                )}

                {/* Event Info Overlay */}
                <View style={styles.overlayContent}>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={12} color="#FFD700" />
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>
                    <Text style={styles.title} numberOfLines={2}>
                        {event.title}
                    </Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.locationText}>{event.venue}, {event.city}</Text>
                    </View>
                </View>
            </View>

            {/* Price & Action */}
            <View style={styles.footer}>
                <View>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>From</Text>
                    <Text style={[styles.price, { color: theme.primary }]}>{priceRange}</Text>
                </View>
                <TouchableOpacity style={[styles.ticketButton, { backgroundColor: theme.primary }]} onPress={onPress}>
                    <Ionicons name="ticket-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.ticketButtonText}>Tickets</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export const FeaturedEvents: React.FC = () => {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Fetch events from API with featured filter
    const { events, isLoading } = useEvents({ featured: true });

    // Calculate card width based on screen size
    const containerPadding = 24;
    const cardGap = 16;
    const maxContentWidth = Math.min(width, 900);

    // On mobile: show ~1.2 cards, on tablet: ~2.3 cards, on desktop: 3 cards
    let cardWidth: number;
    if (width <= 480) {
        cardWidth = width - (containerPadding * 2) - 40; // Show partial next card
    } else if (width <= 768) {
        cardWidth = (maxContentWidth - (containerPadding * 2) - cardGap) / 2.3;
    } else {
        cardWidth = (maxContentWidth - (containerPadding * 2) - (cardGap * 2)) / 3;
    }
    cardWidth = Math.max(260, Math.min(320, cardWidth));

    const featuredEvents = events.slice(0, 6);

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Centered Content Wrapper */}
            <View style={[styles.contentWrapper, { maxWidth: maxContentWidth }]}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.label, { color: theme.primary }]}>UPCOMING EVENTS</Text>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Don't miss out
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.seeAllButton, { backgroundColor: theme.primaryLight }]}
                        onPress={() => router.push('/events')}
                    >
                        <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
                        <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Cards ScrollView - Full width for scroll effect */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading events...</Text>
                </View>
            ) : featuredEvents.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={48} color={theme.icon} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No upcoming events</Text>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContainer,
                        { paddingHorizontal: Math.max(24, (width - maxContentWidth) / 2 + 24) }
                    ]}
                    snapToInterval={cardWidth + cardGap}
                    decelerationRate="fast"
                >
                    {featuredEvents.map((event) => (
                        <FeaturedEventCard
                            key={event.id}
                            event={event}
                            onPress={() => router.push(`/event/${event.id}`)}
                            cardWidth={cardWidth}
                        />
                    ))}
                </ScrollView>
            )}

            {/* Quick Stats */}
            <View style={[styles.contentWrapper, { maxWidth: maxContentWidth }]}>
                <View style={[styles.quickStats, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.quickStatItem}>
                        <Text style={[styles.quickStatNumber, { color: theme.primary }]}>
                            {featuredEvents.length}+
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>
                            Featured
                        </Text>
                    </View>
                    <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.quickStatItem}>
                        <Text style={[styles.quickStatNumber, { color: theme.primary }]}>
                            {events.length}+
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>
                            Total Events
                        </Text>
                    </View>
                    <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.quickStatItem}>
                        <Text style={[styles.quickStatNumber, { color: theme.primary }]}>1</Text>
                        <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>
                            City
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
    },
    contentWrapper: {
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 28,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
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
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContainer: {
        gap: 16,
        paddingBottom: 8,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    imageContainer: {
        height: 180,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '70%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#FFFFFF',
    },
    trendingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    trendingText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    overlayContent: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFD700',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 21,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    priceLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
    },
    ticketButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    ticketButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    quickStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
        borderWidth: 1,
    },
    quickStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    quickStatNumber: {
        fontSize: 22,
        fontWeight: '800',
    },
    quickStatLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    quickStatDivider: {
        width: 1,
        height: 32,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
    },
});
