import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Ticket, QrCode, Loader2, ArrowRight, Gift, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/context/AuthContext';
import { ticketsApi, paymentsApi } from '@/lib/api';
import type { Ticket as TicketType } from '@/types';
import clsx from 'clsx';

export function TicketsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { tickets, isLoading, error, refetch } = useTickets();
  const [searchParams, setSearchParams] = useSearchParams();
  const [testPaymentProcessed, setTestPaymentProcessed] = useState(false);
  const [testPaymentMessage, setTestPaymentMessage] = useState('');

  // Handle test payment redirect
  useEffect(() => {
    const testPayment = searchParams.get('test_payment');
    const txRef = searchParams.get('tx_ref');

    if (testPayment === 'true' && txRef && !testPaymentProcessed) {
      setTestPaymentProcessed(true);
      // Clear the URL params
      setSearchParams({});

      // Complete the test payment
      const completePayment = async () => {
        setTestPaymentMessage('Processing test payment...');
        const result = await paymentsApi.completeTestPayment(txRef);
        if (result.data?.success) {
          setTestPaymentMessage('Test payment successful! Your tickets are ready.');
          // Refetch tickets to show the new ones
          setTimeout(() => {
            refetch();
            setTestPaymentMessage('');
          }, 2000);
        } else {
          setTestPaymentMessage(result.error || 'Payment processing failed');
        }
      };
      completePayment();
    }
  }, [searchParams, testPaymentProcessed, setSearchParams, refetch]);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleClaimTicket = async () => {
    if (!claimCode.trim()) return;

    setClaimLoading(true);
    setClaimError('');

    const result = await ticketsApi.claimTransfer(claimCode.trim().toUpperCase());

    if (result.error) {
      setClaimError(result.error);
    } else if (result.data) {
      setClaimSuccess(true);
      refetch();
    }

    setClaimLoading(false);
  };

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
        {/* Test Payment Message */}
        {testPaymentMessage && (
          <div className="bg-primary/20 border-b border-primary/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3 text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{testPaymentMessage}</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-dark-card border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Tickets</h1>
                <p className="text-white/60">
                  View and manage your purchased tickets
                </p>
              </div>
              <Button
                variant="outline"
                leftIcon={<Gift className="w-4 h-4" />}
                onClick={() => setShowClaimModal(true)}
              >
                Claim Ticket
              </Button>
            </div>
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

      {/* Claim Ticket Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-dark-card rounded-2xl w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Claim Ticket</h3>
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setClaimSuccess(false);
                  setClaimCode('');
                  setClaimError('');
                }}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {claimSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-success" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Ticket Claimed!</h4>
                  <p className="text-white/60 mb-6">
                    The ticket has been added to your account.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowClaimModal(false);
                      setClaimSuccess(false);
                      setClaimCode('');
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-white/60 mb-4">
                    Enter the transfer code you received to claim your ticket.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      Transfer Code (12 characters)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., A1B2C3D4E5F6"
                      value={claimCode}
                      onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary text-center font-mono text-lg tracking-widest"
                      maxLength={12}
                      minLength={12}
                    />
                    <p className="mt-2 text-xs text-white/40 text-center">
                      Enter the 12-character code exactly as received
                    </p>
                  </div>

                  {claimError && (
                    <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mb-4">
                      <p className="text-danger text-sm">{claimError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowClaimModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleClaimTicket}
                      disabled={claimCode.trim().length !== 12 || claimLoading}
                    >
                      {claimLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Claim'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
