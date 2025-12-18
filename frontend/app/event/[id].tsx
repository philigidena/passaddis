/**
 * Event Detail Screen
 * Shows event details and enables ticket purchase with PassAddis Pay
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/context/AuthContext';
import { ticketsApi, TicketType, Order } from '@/services/api';
import PassAddisPay from '@/components/passaddis-pay/PassAddisPay';

interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
  price: number;
  name: string;
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const { event, isLoading, error } = useEvent(id || '');
  const { isAuthenticated } = useAuth();

  const [selectedTickets, setSelectedTickets] = useState<Map<string, TicketSelection>>(new Map());
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const totalAmount = Array.from(selectedTickets.values()).reduce(
    (sum, ticket) => sum + ticket.price * ticket.quantity,
    0
  );

  const totalTickets = Array.from(selectedTickets.values()).reduce(
    (sum, ticket) => sum + ticket.quantity,
    0
  );

  const updateTicketQuantity = (ticketType: TicketType, delta: number) => {
    const current = selectedTickets.get(ticketType.id);
    const newQuantity = Math.max(0, Math.min((current?.quantity || 0) + delta, ticketType.available));

    if (newQuantity === 0) {
      const newMap = new Map(selectedTickets);
      newMap.delete(ticketType.id);
      setSelectedTickets(newMap);
    } else {
      setSelectedTickets(new Map(selectedTickets).set(ticketType.id, {
        ticketTypeId: ticketType.id,
        quantity: newQuantity,
        price: ticketType.price,
        name: ticketType.name,
      }));
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    if (totalTickets === 0) {
      Alert.alert('No Tickets Selected', 'Please select at least one ticket to continue.');
      return;
    }

    setIsPurchasing(true);

    try {
      const ticketItems = Array.from(selectedTickets.values()).map(t => ({
        ticketTypeId: t.ticketTypeId,
        quantity: t.quantity,
      }));

      const response = await ticketsApi.purchase(id!, ticketItems);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      if (response.data) {
        setCurrentOrder(response.data.order);
        setShowPayment(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setCurrentOrder(null);
    setSelectedTickets(new Map());
    Alert.alert(
      'Payment Successful!',
      'Your tickets have been purchased. Check your tickets in the My Tickets section.',
      [{ text: 'View Tickets', onPress: () => router.push('/(tabs)' as any) }]
    );
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Failed', error);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Event Not Found</Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {error || 'The event you are looking for does not exist.'}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{event.title}</Text>
          </View>
        </View>

        {/* Event Info */}
        <View style={[styles.infoSection, { maxWidth: isDesktop ? 800 : '100%', alignSelf: 'center' }]}>
          {/* Date & Time */}
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.infoIconWrapper, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="calendar" size={22} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Date & Time</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formattedDate}</Text>
              <Text style={[styles.infoSubvalue, { color: theme.textSecondary }]}>
                {event.startTime} - {event.endTime}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.infoIconWrapper, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="location" size={22} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Location</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{event.location}</Text>
              <Text style={[styles.infoSubvalue, { color: theme.textSecondary }]}>
                {event.address}, {event.city}
              </Text>
            </View>
            <TouchableOpacity style={[styles.mapButton, { borderColor: theme.border }]}>
              <Ionicons name="map-outline" size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Organizer */}
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.organizerAvatar, { backgroundColor: theme.primaryLight }]}>
              {event.organizer?.logo ? (
                <Image source={{ uri: event.organizer.logo }} style={styles.organizerLogo} />
              ) : (
                <Text style={[styles.organizerInitial, { color: theme.primary }]}>
                  {event.organizer?.name?.[0] || 'O'}
                </Text>
              )}
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Organized by</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {event.organizer?.name || 'Event Organizer'}
              </Text>
            </View>
            <TouchableOpacity style={[styles.followButton, { borderColor: theme.primary }]}>
              <Text style={[styles.followButtonText, { color: theme.primary }]}>Follow</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About Event</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {event.description}
            </Text>
          </View>

          {/* Ticket Types */}
          <View style={styles.ticketsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Tickets</Text>
            {event.ticketTypes?.map((ticketType) => {
              const selected = selectedTickets.get(ticketType.id);
              const quantity = selected?.quantity || 0;
              const isAvailable = ticketType.available > 0;

              return (
                <View
                  key={ticketType.id}
                  style={[
                    styles.ticketCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    !isAvailable && styles.ticketCardDisabled,
                  ]}
                >
                  <View style={styles.ticketInfo}>
                    <Text style={[styles.ticketName, { color: theme.text }]}>
                      {ticketType.name}
                    </Text>
                    {ticketType.description && (
                      <Text style={[styles.ticketDescription, { color: theme.textSecondary }]}>
                        {ticketType.description}
                      </Text>
                    )}
                    <View style={styles.ticketMeta}>
                      <Text style={[styles.ticketPrice, { color: theme.primary }]}>
                        {ticketType.price} ETB
                      </Text>
                      <Text style={[styles.ticketAvailable, { color: theme.textSecondary }]}>
                        {isAvailable ? `${ticketType.available} left` : 'Sold Out'}
                      </Text>
                    </View>
                  </View>
                  {isAvailable && (
                    <View style={styles.quantitySelector}>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          { backgroundColor: theme.backgroundSecondary },
                          quantity === 0 && styles.quantityButtonDisabled,
                        ]}
                        onPress={() => updateTicketQuantity(ticketType, -1)}
                        disabled={quantity === 0}
                      >
                        <Ionicons name="remove" size={20} color={quantity === 0 ? theme.icon : theme.text} />
                      </TouchableOpacity>
                      <Text style={[styles.quantityText, { color: theme.text }]}>{quantity}</Text>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          { backgroundColor: theme.primary },
                          quantity >= ticketType.available && styles.quantityButtonDisabled,
                        ]}
                        onPress={() => updateTicketQuantity(ticketType, 1)}
                        disabled={quantity >= ticketType.available}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Purchase Bar */}
      {totalTickets > 0 && (
        <View style={[styles.purchaseBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <View style={styles.purchaseSummary}>
            <Text style={[styles.purchaseTicketCount, { color: theme.textSecondary }]}>
              {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}
            </Text>
            <Text style={[styles.purchaseTotal, { color: theme.text }]}>
              {totalAmount.toLocaleString()} ETB
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.purchaseButton, { backgroundColor: theme.primary }]}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.purchaseButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Modal */}
      {showPayment && currentOrder && (
        <Modal
          visible={showPayment}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handlePaymentCancel}
        >
          <PassAddisPay
            amount={currentOrder.total}
            orderId={currentOrder.id}
            description={`Tickets for ${event.title}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
            displayMode="inline"
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerBackButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  infoSection: {
    padding: 20,
    width: '100%',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoSubvalue: {
    fontSize: 13,
    marginTop: 2,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  organizerLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  organizerInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  descriptionSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  ticketsSection: {
    marginBottom: 20,
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  ticketCardDisabled: {
    opacity: 0.5,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  ticketAvailable: {
    fontSize: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  purchaseBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  purchaseSummary: {},
  purchaseTicketCount: {
    fontSize: 12,
    marginBottom: 2,
  },
  purchaseTotal: {
    fontSize: 22,
    fontWeight: '800',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
