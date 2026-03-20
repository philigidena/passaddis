import { useState, useEffect, useCallback } from 'react';
import { savedEventsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types';

export function useSavedEvents() {
  const { isAuthenticated } = useAuth();
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedEventIds = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedEventIds(new Set());
      return;
    }

    try {
      const response = await savedEventsApi.getIds();
      if (response.data) {
        setSavedEventIds(new Set(response.data.eventIds));
      }
    } catch {
      // Silently fail — non-critical feature
    }
  }, [isAuthenticated]);

  const fetchSavedEvents = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await savedEventsApi.getAll();
      if (response.data) {
        setSavedEvents(response.data);
        setSavedEventIds(new Set(response.data.map((e) => e.id)));
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const toggleSave = useCallback(
    async (eventId: string) => {
      if (!isAuthenticated) return false;

      const isSaved = savedEventIds.has(eventId);

      // Optimistic update
      setSavedEventIds((prev) => {
        const next = new Set(prev);
        if (isSaved) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
        return next;
      });

      try {
        if (isSaved) {
          await savedEventsApi.unsave(eventId);
        } else {
          await savedEventsApi.save(eventId);
        }
        return true;
      } catch {
        // Revert on failure
        setSavedEventIds((prev) => {
          const next = new Set(prev);
          if (isSaved) {
            next.add(eventId);
          } else {
            next.delete(eventId);
          }
          return next;
        });
        return false;
      }
    },
    [isAuthenticated, savedEventIds],
  );

  const isEventSaved = useCallback(
    (eventId: string) => savedEventIds.has(eventId),
    [savedEventIds],
  );

  useEffect(() => {
    fetchSavedEventIds();
  }, [fetchSavedEventIds]);

  return {
    savedEvents,
    savedEventIds,
    isLoading,
    isEventSaved,
    toggleSave,
    fetchSavedEvents,
    fetchSavedEventIds,
  };
}
