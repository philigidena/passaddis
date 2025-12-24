import { useState, useEffect, useCallback } from 'react';
import { ticketsApi } from '@/lib/api';
import type { Ticket } from '@/types';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ticketsApi.getMyTickets();
      if (response.data) {
        setTickets(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    isLoading,
    error,
    refetch: fetchTickets,
  };
}

export function useTicket(ticketId: string | undefined) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ticketsApi.getTicket(ticketId);
      if (response.data) {
        setTicket(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    isLoading,
    error,
    refetch: fetchTicket,
  };
}
