/**
 * My Tickets Screen
 * Shows user's purchased tickets with QR codes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ticketsApi, Ticket } from '@/services/api';

export default function TicketsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const fetchTickets = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await ticketsApi.getMyTickets();
      if (response.data) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const now = new Date();
  const upcomingTickets = tickets.filter(t => new Date(t.event?.date || '') >= now && t.status === 'VALID');
  const pastTickets = tickets.filter(t => new Date(t.event?.date || '') < now || t.status !== 'VALID');

  const displayTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Tickets</Text>
        </View>
        <View style={styles.notAuthContainer}>
          <View style={[styles.notAuthIcon, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="ticket-outline" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.notAuthTitle, { color: theme.text }]}>Sign in to view tickets</Text>
          <Text style={[styles.notAuthText, { color: theme.textSecondary }]}>
            Your purchased tickets will appear here
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/signin')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Tickets</Text>
        {tickets.length > 0 && (
          <View style={[styles.ticketCount, { backgroundColor: theme.primary }]}>
            <Text style={styles.ticketCountText}>{upcomingTickets.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'upcoming' ? theme.primary : theme.textSecondary }]}>
            Upcoming ({upcomingTickets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'past' ? theme.primary : theme.textSecondary }]}>
            Past ({pastTickets.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading tickets...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ticketsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
        >
          {displayTickets.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <Ionicons
                  name={activeTab === 'upcoming' ? 'ticket-outline' : 'time-outline'}
                  size={48}
                  color={theme.icon}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {activeTab === 'upcoming' ? 'No upcoming tickets' : 'No past tickets'}
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {activeTab === 'upcoming'
                  ? 'Browse events and get your tickets!'
                  : 'Your attended events will appear here'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity
                  style={[styles.browseButton, { backgroundColor: theme.primary }]}
                  onPress={() => router.push('/(tabs)/events')}
                >
                  <Text style={styles.browseButtonText}>Browse Events</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            displayTickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={[styles.ticketCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => setSelectedTicket(ticket)}
              >
                <Image
                  source={{ uri: ticket.event?.imageUrl || 'https://via.placeholder.com/100' }}
                  style={styles.ticketImage}
                />
                <View style={styles.ticketInfo}>
                  <View style={[styles.ticketTypeBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.ticketTypeText, { color: theme.primary }]}>
                      {ticket.ticketType?.name || 'Standard'}
                    </Text>
                  </View>
                  <Text style={[styles.ticketEventTitle, { color: theme.text }]} numberOfLines={2}>
                    {ticket.event?.title || 'Event'}
                  </Text>
                  <View style={styles.ticketMeta}>
                    <Ionicons name="calendar-outline" size={14} color={theme.icon} />
                    <Text style={[styles.ticketMetaText, { color: theme.textSecondary }]}>
                      {ticket.event?.date
                        ? new Date(ticket.event.date).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })
                        : 'TBD'}
                    </Text>
                  </View>
                  <View style={styles.ticketMeta}>
                    <Ionicons name="location-outline" size={14} color={theme.icon} />
                    <Text style={[styles.ticketMetaText, { color: theme.textSecondary }]} numberOfLines={1}>
                      {ticket.event?.venue || 'Venue TBD'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ticketAction}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: ticket.status === 'VALID' ? '#10B98120' : '#EF444420' }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: ticket.status === 'VALID' ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: ticket.status === 'VALID' ? '#10B981' : '#EF4444' }
                    ]}>
                      {ticket.status === 'VALID' ? 'Valid' : ticket.status}
                    </Text>
                  </View>
                  <Ionicons name="qr-code-outline" size={24} color={theme.primary} />
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Ticket Detail Modal */}
      <Modal
        visible={!!selectedTicket}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTicket(null)}
      >
        {selectedTicket && (
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Ticket Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* QR Code Section */}
              <View style={[styles.qrSection, { backgroundColor: theme.card }]}>
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code" size={160} color={theme.text} />
                </View>
                <Text style={[styles.qrCodeText, { color: theme.textSecondary }]}>
                  {selectedTicket.qrCode}
                </Text>
                <Text style={[styles.qrInstruction, { color: theme.textSecondary }]}>
                  Show this QR code at the entrance
                </Text>
              </View>

              {/* Event Details */}
              <View style={[styles.eventDetailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Image
                  source={{ uri: selectedTicket.event?.imageUrl || 'https://via.placeholder.com/100' }}
                  style={styles.eventImage}
                />
                <Text style={[styles.eventTitle, { color: theme.text }]}>
                  {selectedTicket.event?.title}
                </Text>

                <View style={styles.detailRow}>
                  <Ionicons name="ticket-outline" size={18} color={theme.primary} />
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    {selectedTicket.ticketType?.name || 'Standard'} Ticket
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    {selectedTicket.event?.date
                      ? new Date(selectedTicket.event.date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })
                      : 'Date TBD'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={18} color={theme.primary} />
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    {selectedTicket.event?.venue}, {selectedTicket.event?.city}
                  </Text>
                </View>
              </View>

              {/* Status */}
              <View style={[styles.statusSection, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                <Text style={[styles.statusSectionText, { color: theme.primary }]}>
                  This ticket is valid for entry
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  ticketCount: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    paddingVertical: 14,
    marginRight: 24,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
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
  ticketsContainer: {
    padding: 20,
  },
  ticketCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ticketImage: {
    width: 100,
    height: '100%',
    minHeight: 120,
  },
  ticketInfo: {
    flex: 1,
    padding: 14,
  },
  ticketTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  ticketTypeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ticketEventTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 20,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ticketMetaText: {
    fontSize: 12,
    flex: 1,
  },
  ticketAction: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  notAuthTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  notAuthText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
  },
  qrSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  qrInstruction: {
    fontSize: 13,
  },
  eventDetailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    padding: 16,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  statusSectionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
