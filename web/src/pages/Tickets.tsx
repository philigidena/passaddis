import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, QrCode, Loader2, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/context/AuthContext';
import type { Ticket as TicketType } from '@/types';
import clsx from 'clsx';

export function TicketsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { tickets, isLoading, error, refetch } = useTickets();

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Sign In to View Tickets</h1>
            <p className="text-white/60 mb-8">
              You need to be signed in to view your purchased tickets
            </p>
            <Link to="/signin">
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>Sign In</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const validTickets = tickets.filter((t) => t.status === 'VALID');
  const usedTickets = tickets.filter((t) => t.status === 'USED');
  const otherTickets = tickets.filter((t) => t.status !== 'VALID' && t.status !== 'USED');

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg">
        {/* Header */}
        <div className="bg-dark-card border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">My Tickets</h1>
            <p className="text-white/60">
              View and manage your purchased tickets
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-white/60 mb-4">{error}</p>
              <Button variant="outline" onClick={refetch}>
                Try Again
              </Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h2>
              <p className="text-white/60 mb-8">
                You haven't purchased any tickets yet. Browse events to find something you love!
              </p>
              <Link to="/events">
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Valid Tickets */}
              {validTickets.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    Active Tickets ({validTickets.length})
                  </h2>
                  <div className="space-y-4">
                    {validTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                </div>
              )}

              {/* Used Tickets */}
              {usedTickets.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/40 rounded-full" />
                    Used Tickets ({usedTickets.length})
                  </h2>
                  <div className="space-y-4">
                    {usedTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Tickets */}
              {otherTickets.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-danger rounded-full" />
                    Other Tickets ({otherTickets.length})
                  </h2>
                  <div className="space-y-4">
                    {otherTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TicketCard({ ticket }: { ticket: TicketType }) {
  const eventDate = new Date(ticket.event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusColors = {
    VALID: 'bg-success/10 text-success border-success/20',
    USED: 'bg-white/5 text-white/40 border-white/10',
    CANCELLED: 'bg-danger/10 text-danger border-danger/20',
    EXPIRED: 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-dark-card rounded-2xl border border-white/5 overflow-hidden hover:border-primary/30 transition-colors group"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        <div className="sm:w-48 h-32 sm:h-auto relative">
          <img
            src={ticket.event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
            alt={ticket.event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-card sm:block hidden" />
        </div>

        {/* Ticket Info */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                {ticket.event.title}
              </h3>
              <p className="text-primary text-sm font-medium">{ticket.ticketType.name}</p>
            </div>
            <span
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-medium border',
                statusColors[ticket.status]
              )}
            >
              {ticket.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {ticket.event.venue}
            </div>
          </div>

          {ticket.status === 'VALID' && (
            <div className="mt-4 flex items-center gap-2 text-primary text-sm">
              <QrCode className="w-4 h-4" />
              <span>Tap to view QR code</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
