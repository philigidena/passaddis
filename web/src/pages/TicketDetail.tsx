import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Loader2, Download } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useTicket } from '@/hooks/useTickets';
import clsx from 'clsx';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ticket, isLoading, error } = useTicket(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-white/60 mb-4">{error || 'Ticket not found'}</p>
          <Link to="/tickets">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Tickets
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const eventDate = new Date(ticket.event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const statusColors = {
    VALID: 'bg-success text-white',
    USED: 'bg-white/20 text-white/60',
    CANCELLED: 'bg-danger text-white',
    EXPIRED: 'bg-warning text-dark-bg',
  };

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg py-8">
        <div className="max-w-lg mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </Link>

          {/* Ticket Card */}
          <div className="bg-dark-card rounded-3xl overflow-hidden border border-white/5">
            {/* Event Image */}
            <div className="relative h-48">
              <img
                src={ticket.event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                alt={ticket.event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />

              {/* Status Badge */}
              <span
                className={clsx(
                  'absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold',
                  statusColors[ticket.status]
                )}
              >
                {ticket.status}
              </span>
            </div>

            {/* Event Info */}
            <div className="p-6">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-md uppercase mb-3">
                {ticket.event.category}
              </span>
              <h1 className="text-2xl font-bold text-white mb-2">{ticket.event.title}</h1>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-3 text-white/60">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{ticket.event.venue}, {ticket.event.city}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative px-6">
              <div className="border-t border-dashed border-white/20" />
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark-bg rounded-full" />
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark-bg rounded-full" />
            </div>

            {/* Ticket Details */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-white/40 text-sm">Ticket Type</p>
                  <p className="text-white font-semibold">{ticket.ticketType.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-sm">Price</p>
                  <p className="text-primary font-bold">
                    {ticket.ticketType.price === 0 ? 'Free' : `${ticket.ticketType.price.toLocaleString()} ETB`}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              {ticket.status === 'VALID' && ticket.qrCodeImage && (
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-4">
                    Show this QR code at the entrance
                  </p>
                  <div className="bg-white p-4 rounded-2xl inline-block">
                    <img
                      src={ticket.qrCodeImage}
                      alt="Ticket QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-4 font-mono">{ticket.qrCode}</p>
                </div>
              )}

              {ticket.status === 'USED' && (
                <div className="text-center py-8">
                  <p className="text-white/40">This ticket has been used</p>
                  {ticket.usedAt && (
                    <p className="text-white/60 text-sm mt-2">
                      Used on {new Date(ticket.usedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {ticket.status === 'CANCELLED' && (
                <div className="text-center py-8">
                  <p className="text-danger">This ticket has been cancelled</p>
                </div>
              )}

              {ticket.status === 'EXPIRED' && (
                <div className="text-center py-8">
                  <p className="text-warning">This ticket has expired</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {ticket.status === 'VALID' && (
              <div className="p-6 pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download Ticket
                </Button>
              </div>
            )}
          </div>

          {/* View Event Link */}
          <div className="text-center mt-6">
            <Link
              to={`/events/${ticket.event.id}`}
              className="text-primary hover:underline text-sm"
            >
              View Event Details
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
