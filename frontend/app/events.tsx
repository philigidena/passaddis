import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme, useWindowDimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_EVENTS, Event } from '@/data/events';

const CATEGORIES = [
    { id: 'all', label: 'All Events', icon: 'apps-outline' },
    { id: 'Music', label: 'Music', icon: 'musical-notes-outline' },
    { id: 'Business', label: 'Business', icon: 'briefcase-outline' },
    { id: 'Social', label: 'Social', icon: 'people-outline' },
    { id: 'Arts', label: 'Arts', icon: 'color-palette-outline' },
    { id: 'Food', label: 'Food', icon: 'restaurant-outline' },
    { id: 'Fashion', label: 'Fashion', icon: 'shirt-outline' },
];

export default function EventsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const isTablet = width > 500;

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = MOCK_EVENTS.filter(event => {
        const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredEvent = MOCK_EVENTS.find(e => e.isFeatured);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Header */}
                <View style={styles.heroHeader}>
                    <LinearGradient
                        colors={[theme.primary, '#006644']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        {/* Nav Row */}
                        <View style={styles.navRow}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={styles.heroTitle}>Discover Events</Text>
                            <TouchableOpacity style={styles.filterIconButton}>
                                <Ionicons name="options-outline" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchWrapper}>
                            <View style={styles.searchBar}>
                                <Ionicons name="search" size={20} color={theme.icon} />
                                <TextInput
                                    style={[styles.searchInput, { color: theme.text }]}
                                    placeholder="Search events, artists, venues..."
                                    placeholderTextColor={theme.icon}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={20} color={theme.icon} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{MOCK_EVENTS.length}+</Text>
                                <Text style={styles.statLabel}>Events</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>5+</Text>
                                <Text style={styles.statLabel}>Cities</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>10K+</Text>
                                <Text style={styles.statLabel}>Attendees</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Categories */}
                <View style={styles.categoriesSection}>
                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>BROWSE BY CATEGORY</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScroll}
                    >
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryCard,
                                    {
                                        backgroundColor: selectedCategory === cat.id ? theme.primary : theme.card,
                                        borderColor: selectedCategory === cat.id ? theme.primary : theme.border,
                                    }
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <View style={[
                                    styles.categoryIconWrapper,
                                    { backgroundColor: selectedCategory === cat.id ? 'rgba(255,255,255,0.2)' : theme.primaryLight }
                                ]}>
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={20}
                                        color={selectedCategory === cat.id ? '#FFFFFF' : theme.primary}
                                    />
                                </View>
                                <Text style={[
                                    styles.categoryLabel,
                                    { color: selectedCategory === cat.id ? '#FFFFFF' : theme.text }
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Featured Event */}
                {featuredEvent && selectedCategory === 'all' && (
                    <View style={styles.featuredSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Event</Text>
                            <View style={[styles.featuredBadge, { backgroundColor: theme.gold }]}>
                                <Ionicons name="star" size={12} color="#1A1A2E" />
                                <Text style={styles.featuredBadgeText}>Hot</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
                            <Image source={{ uri: featuredEvent.imageUrl }} style={styles.featuredImage} />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.9)']}
                                style={styles.featuredGradient}
                            />
                            <View style={styles.featuredContent}>
                                <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.categoryBadgeText}>{featuredEvent.category}</Text>
                                </View>
                                <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
                                <View style={styles.featuredMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar-outline" size={14} color="#FFD700" />
                                        <Text style={styles.metaText}>{featuredEvent.date}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                                        <Text style={styles.metaTextLight}>{featuredEvent.location}</Text>
                                    </View>
                                </View>
                                <View style={styles.featuredFooter}>
                                    <Text style={styles.featuredPrice}>{featuredEvent.priceRange}</Text>
                                    <TouchableOpacity style={[styles.getTicketsButton, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.getTicketsText}>Get Tickets</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Events List */}
                <View style={styles.eventsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            {selectedCategory === 'all' ? 'All Events' : `${selectedCategory} Events`}
                        </Text>
                        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
                            {filteredEvents.length} events
                        </Text>
                    </View>

                    <View style={[
                        styles.eventsGrid,
                        isDesktop && styles.eventsGridDesktop,
                        { maxWidth: isDesktop ? 1000 : 600, alignSelf: 'center', width: '100%' }
                    ]}>
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} event={event} theme={theme} isCompact={!isTablet} />
                        ))}
                    </View>

                    {filteredEvents.length === 0 && (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
                                <Ionicons name="calendar-outline" size={40} color={theme.icon} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No events found</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Try adjusting your filters or search query
                            </Text>
                            <TouchableOpacity
                                style={[styles.clearButton, { borderColor: theme.primary }]}
                                onPress={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                            >
                                <Text style={[styles.clearButtonText, { color: theme.primary }]}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

interface EventCardProps {
    event: Event;
    theme: typeof Colors.light;
    isCompact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, theme, isCompact }) => (
    <TouchableOpacity
        style={[
            styles.eventCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            isCompact && styles.eventCardCompact
        ]}
        activeOpacity={0.9}
    >
        <View style={[styles.eventImageWrapper, isCompact && styles.eventImageWrapperCompact]}>
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.eventImageGradient}
            />
            <View style={styles.eventDateBadge}>
                <Text style={styles.eventDateDay}>
                    {event.date.split(',')[0]?.split(' ')[1] || 'TBD'}
                </Text>
                <Text style={styles.eventDateMonth}>
                    {event.date.split(',')[0]?.split(' ')[0] || ''}
                </Text>
            </View>
            {event.isTrending && (
                <View style={[styles.trendingBadge, { backgroundColor: theme.gold }]}>
                    <Ionicons name="trending-up" size={10} color="#1A1A2E" />
                    <Text style={styles.trendingText}>Trending</Text>
                </View>
            )}
        </View>
        <View style={styles.eventInfo}>
            <View style={[styles.eventCategoryPill, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.eventCategoryText, { color: theme.primary }]}>{event.category}</Text>
            </View>
            <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={2}>
                {event.title}
            </Text>
            <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                    <Ionicons name="time-outline" size={13} color={theme.icon} />
                    <Text style={[styles.eventDetailText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {event.date.split('•')[1]?.trim() || event.date}
                    </Text>
                </View>
                <View style={styles.eventDetailRow}>
                    <Ionicons name="location-outline" size={13} color={theme.icon} />
                    <Text style={[styles.eventDetailText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {event.location}
                    </Text>
                </View>
            </View>
            <View style={styles.eventFooter}>
                <View>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>From</Text>
                    <Text style={[styles.eventPrice, { color: theme.primary }]}>{event.priceRange}</Text>
                </View>
                <TouchableOpacity style={[styles.bookButton, { backgroundColor: theme.primary }]}>
                    <Ionicons name="ticket-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heroHeader: {
        overflow: 'hidden',
    },
    heroGradient: {
        paddingTop: 16,
        paddingBottom: 28,
        paddingHorizontal: 20,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    filterIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchWrapper: {
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
    },
    categoriesSection: {
        paddingTop: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    categoriesScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    categoryIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    featuredSection: {
        paddingHorizontal: 20,
        paddingTop: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    featuredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    featuredBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    featuredCard: {
        borderRadius: 20,
        overflow: 'hidden',
        height: 280,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '75%',
    },
    featuredContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 10,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    featuredTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    featuredMeta: {
        gap: 6,
        marginBottom: 14,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFD700',
    },
    metaTextLight: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    featuredFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    featuredPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    getTicketsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10,
    },
    getTicketsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    eventsSection: {
        paddingHorizontal: 20,
        paddingTop: 28,
    },
    resultsCount: {
        fontSize: 13,
    },
    eventsGrid: {
        gap: 16,
    },
    eventsGridDesktop: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    eventCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    eventCardCompact: {
        flexDirection: 'row',
    },
    eventImageWrapper: {
        height: 160,
        position: 'relative',
    },
    eventImageWrapperCompact: {
        width: 120,
        height: 'auto',
        minHeight: 140,
    },
    eventImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    eventImageGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
    },
    eventDateBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    eventDateDay: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    eventDateMonth: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    trendingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    trendingText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#1A1A2E',
    },
    eventInfo: {
        padding: 14,
        flex: 1,
    },
    eventCategoryPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginBottom: 8,
    },
    eventCategoryText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 21,
        marginBottom: 10,
    },
    eventDetails: {
        gap: 5,
        marginBottom: 12,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventDetailText: {
        fontSize: 12,
        flex: 1,
    },
    eventFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    eventPrice: {
        fontSize: 15,
        fontWeight: '700',
    },
    bookButton: {
        width: 40,
        height: 40,
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
        marginBottom: 20,
    },
    clearButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
