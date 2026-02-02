import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  Minus,
  Plus,
  Ticket,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/context/AuthContext';
import { ticketsApi, paymentsApi, waitlistApi } from '@/lib/api';
import type { TicketType } from '@/types';
import clsx from 'clsx';

interface WaitlistStatus {
  [ticketTypeId: string]: {
    joined: boolean;
    position?: number;
    loading?: boolean;
  };
}

interface TicketSelection {
  [ticketTypeId: string]: number;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { event, isLoading, error } = useEvent(id);

  const [ticketSelection, setTicketSelection] = useState<TicketSelection>({});
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>({});

  const handleJoinWaitlist = async (ticketTypeId: string) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    setWaitlistStatus((prev) => ({
      ...prev,
      [ticketTypeId]: { ...prev[ticketTypeId], loading: true },
    }));

    const result = await waitlistApi.join(id!, ticketTypeId);

    if (result.data) {
      setWaitlistStatus((prev) => ({
        ...prev,
        [ticketTypeId]: {
          joined: true,
          position: result.data?.position,
          loading: false,
        },
      }));
    } else {
      setWaitlistStatus((prev) => ({
        ...prev,
        [ticketTypeId]: { ...prev[ticketTypeId], loading: false },
      }));
    }
  };

  const updateQuantity = (ticketTypeId: string, delta: number, max: number) => {
    setTicketSelection((prev) => {
      const current = prev[ticketTypeId] || 0;
      const newValue = Math.max(0, Math.min(max, current + delta));
      if (newValue === 0) {
        const { [ticketTypeId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketTypeId]: newValue };
    });
  };

  const totalTickets = Object.values(ticketSelection).reduce((sum, qty) => sum + qty, 0);
  const totalAmount = event?.ticketTypes.reduce((sum, tt) => {
    return sum + tt.price * (ticketSelection[tt.id] || 0);
  }, 0) || 0;
  const serviceFee = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + serviceFee;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (totalTickets === 0) {
      setPurchaseError('Please select at least one ticket');
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      // Create ticket order
      const tickets = Object.entries(ticketSelection)
        .filter(([_, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

      const orderResponse = await ticketsApi.purchase(id!, tickets);

      if (orderResponse.error) {
        setPurchaseError(orderResponse.error);
        setIsPurchasing(false);
        return;
      }

      const order = orderResponse.data!.order;

      // Initiate payment
      const paymentResponse = await paymentsApi.initiate(order.id, 'TELEBIRR');

      if (paymentResponse.error) {
        setPurchaseError(paymentResponse.error);
        setIsPurchasing(false);
        return;
      }

      // Use Telebirr startPay POST method
      const rawRequest = paymentResponse.data?.raw_request;
      const webBaseUrl = paymentResponse.data?.web_base_url;

      if (rawRequest && webBaseUrl) {
        // Parse rawRequest parameters and create POST form
        const params = new URLSearchParams(rawRequest);

        // Add version and trade_type
        params.set('version', '1.0');
        params.set('trade_type', 'Checkout');

        // Create form and submit via POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = webBaseUrl;
        form.style.display = 'none';

        // Add all parameters as hidden inputs
        params.forEach((value, key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        // Fallback to checkout URL redirect using anchor element (per Telebirr support)
        const checkoutUrl = paymentResponse.data?.checkout_url;
        if (checkoutUrl) {
          const anchorEle = document.createElement('a');
          anchorEle.setAttribute('href', checkoutUrl.trim());
          anchorEle.setAttribute('target', '_blank');
          anchorEle.setAttribute('rel', 'external');
          anchorEle.style.display = 'none';
          document.body.appendChild(anchorEle);
          anchorEle.click();
          document.body.removeChild(anchorEle);
        } else {
          setPurchaseError('Payment service temporarily unavailable. Please try again later.');
          setIsPurchasing(false);
        }
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setPurchaseError('An error occurred. Please try again.');
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-white/60 mb-4">{error || 'Event not found'}</p>
          <Link to="/events">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Events
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const eventDate = new Date(event.date);
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

  return (
    <Layout>
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />

        {/* Back Button */}
        <Link
          to="/events"
          className="absolute top-24 left-4 sm:left-8 glass px-4 py-2 rounded-full flex items-center gap-2 text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Actions */}
        <div className="absolute top-24 right-4 sm:right-8 flex gap-2">
          <button className="glass p-3 rounded-full text-white hover:bg-white/20 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="glass p-3 rounded-full text-white hover:bg-white/20 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card rounded-2xl p-6 sm:p-8 border border-white/5">
              {/* Category Badge */}
              <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-md uppercase mb-4">
                {event.category}
              </span>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">{event.title}</h1>

              {/* Event Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Date</p>
                    <p className="text-white font-medium">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Time</p>
                    <p className="text-white font-medium">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl sm:col-span-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/40 text-sm">Location</p>
                    <p className="text-white font-medium">{event.venue}</p>
                    <p className="text-white/60 text-sm">{event.address}, {event.city}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">About This Event</h2>
                <p className="text-white/70 leading-relaxed">{event.description}</p>
              </div>

              {/* Organizer */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Organizer</h2>
                <div className="flex items-center gap-4">
                  {event.organizer.logo ? (
                    <img
                      src={event.organizer.logo}
                      alt={event.organizer.businessName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{event.organizer.businessName}</p>
                    <p className="text-white/40 text-sm">Event Organizer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card rounded-2xl p-6 border border-white/5 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Select Tickets</h2>

              {/* Ticket Types */}
              <div className="space-y-4 mb-6">
                {event.ticketTypes.map((ticketType) => (
                  <TicketTypeRow
                    key={ticketType.id}
                    ticketType={ticketType}
                    quantity={ticketSelection[ticketType.id] || 0}
                    onIncrease={() =>
                      updateQuantity(ticketType.id, 1, Math.min(ticketType.available, ticketType.maxPerOrder))
                    }
                    onDecrease={() => updateQuantity(ticketType.id, -1, ticketType.maxPerOrder)}
                    waitlistStatus={waitlistStatus[ticketType.id]}
                    onJoinWaitlist={() => handleJoinWaitlist(ticketType.id)}
                  />
                ))}
              </div>

              {/* Summary */}
              {totalTickets > 0 && (
                <div className="border-t border-white/10 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal ({totalTickets} tickets)</span>
                    <span>{totalAmount.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Service Fee (5%)</span>
                    <span>{serviceFee.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-primary">{grandTotal.toLocaleString()} ETB</span>
                  </div>
                </div>
              )}

              {/* Error */}
              {purchaseError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="text-danger text-sm">{purchaseError}</p>
                </div>
              )}

              {/* Purchase Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                isLoading={isPurchasing}
                disabled={totalTickets === 0}
                leftIcon={<Ticket className="w-5 h-5" />}
              >
                {isAuthenticated ? 'Purchase Tickets' : 'Sign In to Purchase'}
              </Button>

              {/* Payment Info */}
              <p className="text-center text-white/40 text-xs mt-4">
                Secure payment powered by Telebirr
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Ticket Type Row Component
function TicketTypeRow({
  ticketType,
  quantity,
  onIncrease,
  onDecrease,
  waitlistStatus,
  onJoinWaitlist,
}: {
  ticketType: TicketType;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  waitlistStatus?: { joined: boolean; position?: number; loading?: boolean };
  onJoinWaitlist: () => void;
}) {
  const isAvailable = ticketType.available > 0;
  const isSoldOut = ticketType.available === 0;

  return (
    <div
      className={clsx(
        'p-4 rounded-xl border transition-colors',
        quantity > 0
          ? 'bg-primary/5 border-primary/30'
          : waitlistStatus?.joined
          ? 'bg-warning/5 border-warning/30'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-white font-medium">{ticketType.name}</h3>
          {ticketType.description && (
            <p className="text-white/40 text-sm">{ticketType.description}</p>
          )}
        </div>
        <p className="text-primary font-bold">
          {ticketType.price === 0 ? 'Free' : `${ticketType.price.toLocaleString()} ETB`}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">
          {isSoldOut ? (
            waitlistStatus?.joined ? (
              <span className="text-warning">
                Position #{waitlistStatus.position} on waitlist
              </span>
            ) : (
              <span className="text-danger">Sold Out</span>
            )
          ) : (
            `${ticketType.available} available`
          )}
        </p>

        {isAvailable ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onDecrease}
              disabled={quantity === 0}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-white font-medium w-6 text-center">{quantity}</span>
            <button
              onClick={onIncrease}
              disabled={quantity >= Math.min(ticketType.available, ticketType.maxPerOrder)}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          !waitlistStatus?.joined && (
            <button
              onClick={onJoinWaitlist}
              disabled={waitlistStatus?.loading}
              className="px-3 py-1.5 text-sm font-medium bg-warning/10 text-warning border border-warning/30 rounded-lg hover:bg-warning/20 disabled:opacity-50 transition-colors"
            >
              {waitlistStatus?.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Join Waitlist'
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}
