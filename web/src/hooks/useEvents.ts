import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '@/lib/api';
import type { Event } from '@/types';

interface UseEventsOptions {
  category?: string;
  search?: string;
  city?: string;
  featured?: boolean;
  autoFetch?: boolean;
}

interface UseEventsReturn {
  events: Event[];
  featuredEvents: Event[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchByCategory: (category: string) => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const { autoFetch = true, featured } = options;

  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (params?: { category?: string; search?: string; city?: string; featured?: boolean }) => {
      setIsLoading(true);
      setError(null);

      try {
        // If featured filter is set, only fetch featured events
        if (params?.featured || featured) {
          const featuredResponse = await eventsApi.getFeatured();
          if (featuredResponse.data) {
            setEvents(featuredResponse.data);
            setFeaturedEvents(featuredResponse.data);
          } else if (featuredResponse.error) {
            setError(featuredResponse.error);
          }
          setIsLoading(false);
          return;
        }

        const [eventsResponse, featuredResponse, categoriesResponse] = await Promise.all([
          eventsApi.getAll(params),
          eventsApi.getFeatured(),
          eventsApi.getCategories(),
        ]);

        if (eventsResponse.data) {
          setEvents(eventsResponse.data);
        } else if (eventsResponse.error) {
          setError(eventsResponse.error);
        }

        if (featuredResponse.data) {
          setFeaturedEvents(featuredResponse.data);
        }

        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setIsLoading(false);
      }
    },
    [featured]
  );

  const fetchByCategory = useCallback(
    async (category: string) => {
      await fetchEvents({ category: category === 'all' ? undefined : category });
    },
    [fetchEvents]
  );

  const searchEvents = useCallback(
    async (query: string) => {
      await fetchEvents({ search: query || undefined });
    },
    [fetchEvents]
  );

  const refetch = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  return {
    events,
    featuredEvents,
    categories,
    isLoading,
    error,
    refetch,
    fetchByCategory,
    searchEvents,
  };
}

// Hook for fetching a single event
export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await eventsApi.getById(eventId);
      if (response.data) {
        setEvent(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    isLoading,
    error,
    refetch: fetchEvent,
  };
}
