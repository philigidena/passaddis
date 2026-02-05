import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { organizerApi, whatsappApi } from '@/lib/api';
import {
  DashboardLayout,
  StatusBadge,
  DashboardButton,
} from '@/components/layout/DashboardLayout';
import type { Event } from '@/types';

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const EventsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', path: '/organizer', icon: <DashboardIcon /> },
  { label: 'My Events', path: '/organizer/events', icon: <EventsIcon /> },
  { label: 'Wallet', path: '/organizer/wallet', icon: <WalletIcon /> },
  { label: 'Settings', path: '/organizer/settings', icon: <SettingsIcon /> },
];

const categories = [
  'MUSIC', 'SPORTS', 'ARTS', 'COMEDY', 'FESTIVAL', 'CONFERENCE', 'NIGHTLIFE', 'OTHER'
];

export function OrganizerEvents() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    address: '',
    city: 'Addis Ababa',
    date: '',
    endDate: '',
    category: 'MUSIC',
    imageUrl: '',
    ticketTypes: [{ name: 'General Admission', price: 0, quantity: 100 }],
  });

  useEffect(() => {
    if (!authLoading && !['ORGANIZER', 'ADMIN'].includes(user?.role || '')) {
      navigate('/organizer');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await organizerApi.getMyEvents();
      if (response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.venue || !formData.date || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.ticketTypes.length === 0 || formData.ticketTypes.some(t => !t.name || t.price < 0 || t.quantity < 1)) {
      setError('Please add at least one valid ticket type');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await organizerApi.createEvent({
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        address: formData.address,
        city: formData.city,
        date: new Date(formData.date).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        ticketTypes: formData.ticketTypes,
      });

      if (response.data) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          venue: '',
          address: '',
          city: 'Addis Ababa',
          date: '',
          endDate: '',
          category: 'MUSIC',
          imageUrl: '',
          ticketTypes: [{ name: 'General Admission', price: 0, quantity: 100 }],
        });
        loadEvents();
      } else {
        setError(response.error || 'Failed to create event');
      }
    } catch (error) {
      setError('Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitForApproval = async (eventId: string) => {
    try {
      await organizerApi.submitForApproval(eventId);
      loadEvents();
    } catch (error) {
      console.error('Failed to submit for approval:', error);
    }
  };

  const handlePublish = async (eventId: string) => {
    try {
      await organizerApi.publishEvent(eventId);
      loadEvents();
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const handleCloneEvent = async (eventId: string) => {
    try {
      const response = await organizerApi.cloneEvent(eventId);
      if (response.data) {
        loadEvents();
      }
    } catch (error) {
      console.error('Failed to clone event:', error);
    }
  };

  const handleExportAttendees = async (eventId: string, eventTitle: string) => {
    try {
      const response = await organizerApi.exportAttendees(eventId);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendees-${eventTitle.replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export attendees:', error);
    }
  };

  const handleWhatsAppShare = async (eventId: string) => {
    try {
      const response = await whatsappApi.getEventShareLink(eventId);
      if (response.data?.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to get WhatsApp share link:', error);
    }
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [...formData.ticketTypes, { name: '', price: 0, quantity: 100 }],
    });
  };

  const removeTicketType = (index: number) => {
    setFormData({
      ...formData,
      ticketTypes: formData.ticketTypes.filter((_, i) => i !== index),
    });
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    const updated = [...formData.ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ticketTypes: updated });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'REJECTED': return 'error';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout title="Organizer Portal" navItems={navItems} accentColor="purple">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Organizer Portal" navItems={navItems} accentColor="purple">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Events</h1>
          <p className="text-gray-400 mt-1">Create and manage your events</p>
        </div>
        <DashboardButton onClick={() => setShowCreateModal(true)} variant="primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </DashboardButton>
      </div>

      {/* Events List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <EventsIcon />
            </div>
            <p className="text-gray-400 mb-4">No events yet</p>
            <DashboardButton onClick={() => setShowCreateModal(true)} variant="primary">
              Create Your First Event
            </DashboardButton>
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
                      className="w-full lg:w-40 h-28 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full lg:w-40 h-28 rounded-lg bg-gray-700 flex items-center justify-center">
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
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.venue}
                      </span>
                    </div>

                    {/* Ticket Stats */}
                    {event.ticketTypes && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.ticketTypes.map((tt: any) => (
                          <span
                            key={tt.id}
                            className="px-3 py-1 text-xs bg-gray-700 rounded-full text-gray-300"
                          >
                            {tt.name}: {tt.sold || 0}/{tt.quantity} sold
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {event.status === 'DRAFT' && (
                        <>
                          <DashboardButton
                            onClick={() => handleSubmitForApproval(event.id)}
                            variant="primary"
                            size="sm"
                          >
                            Submit for Approval
                          </DashboardButton>
                          <DashboardButton
                            onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                            variant="secondary"
                            size="sm"
                          >
                            Edit
                          </DashboardButton>
                        </>
                      )}
                      {event.status === 'APPROVED' && (
                        <DashboardButton
                          onClick={() => handlePublish(event.id)}
                          variant="primary"
                          size="sm"
                        >
                          Publish Event
                        </DashboardButton>
                      )}
                      {event.status === 'PUBLISHED' && (
                        <>
                          <DashboardButton
                            onClick={() => navigate(`/organizer/events/${event.id}/attendees`)}
                            variant="secondary"
                            size="sm"
                          >
                            View Attendees
                          </DashboardButton>
                          <DashboardButton
                            onClick={() => handleExportAttendees(event.id, event.title)}
                            variant="ghost"
                            size="sm"
                            title="Export Attendees CSV"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export
                          </DashboardButton>
                          <DashboardButton
                            onClick={() => handleWhatsAppShare(event.id)}
                            variant="ghost"
                            size="sm"
                            title="Share on WhatsApp"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Share
                          </DashboardButton>
                        </>
                      )}
                      <DashboardButton
                        onClick={() => handleCloneEvent(event.id)}
                        variant="ghost"
                        size="sm"
                        title="Clone Event"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Clone
                      </DashboardButton>
                      <DashboardButton
                        onClick={() => navigate(`/events/${event.id}`)}
                        variant="ghost"
                        size="sm"
                      >
                        Preview
                      </DashboardButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Create New Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Event Details */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  rows={4}
                  placeholder="Describe your event"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Venue name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Ticket Types */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Ticket Types *
                  </label>
                  <button
                    type="button"
                    onClick={addTicketType}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    + Add Ticket Type
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.ticketTypes.map((tt, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input
                        type="text"
                        value={tt.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        placeholder="Ticket name"
                      />
                      <input
                        type="number"
                        value={tt.price}
                        onChange={(e) => updateTicketType(index, 'price', Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        placeholder="Price"
                        min="0"
                      />
                      <input
                        type="number"
                        value={tt.quantity}
                        onChange={(e) => updateTicketType(index, 'quantity', Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        placeholder="Qty"
                        min="1"
                      />
                      {formData.ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700">
              <DashboardButton
                onClick={() => setShowCreateModal(false)}
                variant="secondary"
              >
                Cancel
              </DashboardButton>
              <DashboardButton
                onClick={handleCreateEvent}
                variant="primary"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Event'}
              </DashboardButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
