import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { Event } from '@/types';

// Icons (same as AdminDashboard)
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const EventsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ShopIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const OrganizersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PromosIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { label: 'Users', path: '/admin/users', icon: <UsersIcon /> },
  { label: 'Events', path: '/admin/events', icon: <EventsIcon /> },
  { label: 'Organizers', path: '/admin/organizers', icon: <OrganizersIcon /> },
  { label: 'Shop Items', path: '/admin/shop', icon: <ShopIcon /> },
  { label: 'Promo Codes', path: '/admin/promos', icon: <PromosIcon /> },
];

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function AdminEvents() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllEvents({
        status: statusFilter || undefined,
      });
      if (response.data) {
        setEvents((response.data as any).data || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (event: Event, featured = false) => {
    try {
      await adminApi.approveEvent(event.id, featured);
      loadEvents();
    } catch (error) {
      console.error('Failed to approve event:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent || !rejectReason) return;
    try {
      await adminApi.rejectEvent(selectedEvent.id, rejectReason);
      setShowRejectModal(false);
      setSelectedEvent(null);
      setRejectReason('');
      loadEvents();
    } catch (error) {
      console.error('Failed to reject event:', error);
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    try {
      await adminApi.toggleEventFeatured(event.id);
      loadEvents();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'REJECTED': return 'error';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Admin Panel" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Panel" navItems={navItems}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Events</h1>
          <p className="text-gray-400 mt-1">Review and manage event submissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSearchParams(filter.value ? { status: filter.value } : {})}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No events found
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {events.map((event) => (
              <div key={event.id} className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Event Image */}
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full lg:w-48 h-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full lg:w-48 h-32 rounded-lg bg-gray-700 flex items-center justify-center">
                      <EventsIcon />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      <StatusBadge
                        status={event.status}
                        variant={getStatusVariant(event.status)}
                      />
                      {event.isFeatured && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {event.category}
                      </span>
                      {event.organizer && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {event.organizer.businessName}
                        </span>
                      )}
                    </div>

                    {/* Ticket Types */}
                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.ticketTypes.map((tt) => (
                          <span
                            key={tt.id}
                            className="px-3 py-1 text-xs bg-gray-700 rounded-full text-gray-300"
                          >
                            {tt.name}: {tt.price} ETB ({tt.quantity} tickets)
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {event.status === 'PENDING' && (
                        <>
                          <DashboardButton
                            onClick={() => handleApprove(event, false)}
                            variant="primary"
                            size="sm"
                          >
                            Approve
                          </DashboardButton>
                          <DashboardButton
                            onClick={() => handleApprove(event, true)}
                            variant="secondary"
                            size="sm"
                          >
                            Approve & Feature
                          </DashboardButton>
                          <DashboardButton
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowRejectModal(true);
                            }}
                            variant="danger"
                            size="sm"
                          >
                            Reject
                          </DashboardButton>
                        </>
                      )}
                      {(event.status === 'APPROVED' || event.status === 'PUBLISHED') && (
                        <DashboardButton
                          onClick={() => handleToggleFeatured(event)}
                          variant="secondary"
                          size="sm"
                        >
                          {event.isFeatured ? 'Remove Featured' : 'Make Featured'}
                        </DashboardButton>
                      )}
                      <DashboardButton
                        onClick={() => navigate(`/events/${event.id}`)}
                        variant="ghost"
                        size="sm"
                      >
                        View Details
                      </DashboardButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Reject Event
            </h3>
            <p className="text-gray-400 mb-4">
              Please provide a reason for rejecting "{selectedEvent.title}"
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <DashboardButton
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedEvent(null);
                  setRejectReason('');
                }}
                variant="secondary"
              >
                Cancel
              </DashboardButton>
              <DashboardButton
                onClick={handleReject}
                variant="danger"
                disabled={!rejectReason.trim()}
              >
                Reject Event
              </DashboardButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
