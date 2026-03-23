import { useState, useEffect } from 'react';
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
  Gift,
  CreditCard,
  Smartphone,
  ArrowLeft,
  Loader2,
  Zap,
  Timer,
  ArrowRight,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useEvent } from '@/hooks/useEvents';
import { useAuth } from '@/context/AuthContext';
import { useSavedEvents } from '@/hooks/useSavedEvents';
import { ticketsApi, paymentsApi, waitlistApi, eventsApi, promoApi } from '@/lib/api';
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

  const { isEventSaved, toggleSave } = useSavedEvents();
  const [ticketSelection, setTicketSelection] = useState<TicketSelection>({});
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>({});
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'STRIPE'>('TELEBIRR');
  const [isGift, setIsGift] = useState(false);
  const [giftRecipientPhone, setGiftRecipientPhone] = useState('');
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [calendarLinks, setCalendarLinks] = useState<{
    googleCalendarUrl: string;
    outlookUrl: string;
    yahooUrl: string;
    icsUrl: string;
  } | null>(null);

  const handleAddToCalendar = async () => {
    if (!calendarLinks && id) {
      const response = await eventsApi.getCalendarLinks(id);
      if (response.data) {
        setCalendarLinks(response.data);
      }
    }
    setShowCalendarMenu(!showCalendarMenu);
  };

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
    const effectivePrice = tt.currentPrice ?? tt.price;
    return sum + effectivePrice * (ticketSelection[tt.id] || 0);
  }, 0) || 0;
  const promoDiscount = promoApplied?.discountAmount || 0;
  const subtotalAfterDiscount = Math.max(0, totalAmount - promoDiscount);
  const serviceFee = Math.round(subtotalAfterDiscount * 0.05);
  const grandTotal = subtotalAfterDiscount + serviceFee;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoApplied(null);

    const result = await promoApi.validate(promoCode.trim(), totalAmount, id);

    if (result.data?.valid) {
      setPromoApplied({
        code: result.data.code,
        discountType: result.data.discountType,
        discountValue: result.data.discountValue,
        discountAmount: result.data.discountAmount,
      });
      setPromoError('');
    } else {
      setPromoError(result.data?.message || result.error || 'Invalid promo code');
    }
    setPromoLoading(false);
  };

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

      const giftData = isGift
        ? { isGift: true, recipientPhone: giftRecipientPhone, recipientName: giftRecipientName || undefined, giftMessage: giftMessage || undefined }
        : undefined;

      const orderResponse = await ticketsApi.purchase(id!, tickets, giftData);

      if (orderResponse.error) {
        setPurchaseError(orderResponse.error);
        setIsPurchasing(false);
        return;
      }

      const order = orderResponse.data!.order;

      // Initiate payment with selected method
      const paymentResponse = await paymentsApi.initiate(order.id, paymentMethod);

      if (paymentResponse.error) {
        setPurchaseError(paymentResponse.error);
        setIsPurchasing(false);
        return;
      }

      // Open Telebirr checkout URL via GET (the approach that worked in v38-v40)
      // Note: POST form approach was broken because URLSearchParams corrupts
      // base64 signature characters (+ decoded as space)
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
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/signin');
                return;
              }
              if (id) toggleSave(id);
            }}
            className={clsx(
              'glass p-3 rounded-full transition-colors',
              id && isEventSaved(id)
                ? 'bg-red-500/80 text-white hover:bg-red-600'
                : 'text-white hover:bg-white/20'
            )}
          >
            <Heart className={clsx('w-5 h-5', id && isEventSaved(id) && 'fill-current')} />
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

              {/* Add to Calendar */}
              <div className="mb-8 relative">
                <button
                  onClick={handleAddToCalendar}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors text-sm font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Add to Calendar
                </button>
                {showCalendarMenu && calendarLinks && (
                  <div className="absolute top-12 left-0 z-20 bg-dark-card border border-white/10 rounded-xl shadow-lg py-2 min-w-[200px]">
                    <a
                      href={calendarLinks.googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-white/80 hover:bg-white/5 hover:text-white transition-colors text-sm"
                    >
                      Google Calendar
                    </a>
                    <a
                      href={calendarLinks.outlookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-white/80 hover:bg-white/5 hover:text-white transition-colors text-sm"
                    >
                      Outlook
                    </a>
                    <a
                      href={calendarLinks.yahooUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-white/80 hover:bg-white/5 hover:text-white transition-colors text-sm"
                    >
                      Yahoo Calendar
                    </a>
                    <a
                      href={calendarLinks.icsUrl}
                      download
                      className="block px-4 py-2.5 text-white/80 hover:bg-white/5 hover:text-white transition-colors text-sm"
                    >
                      Download .ics File
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">About This Event</h2>
                <p className="text-white/70 leading-relaxed">{event.description}</p>
              </div>

              {/* Organizer */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Organizer</h2>
                <Link
                  to={`/organizers/${event.organizer.id}`}
                  className="flex items-center gap-4 group"
                >
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
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-primary transition-colors">{event.organizer.businessName}</p>
                    <p className="text-white/40 text-sm">View profile</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors" />
                </Link>
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
                <div className="border-t border-white/10 pt-4 mb-4 space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal ({totalTickets} tickets)</span>
                    <span>{totalAmount.toLocaleString()} ETB</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-1">
                        Promo: {promoApplied.code}
                        <button
                          onClick={() => { setPromoApplied(null); setPromoCode(''); }}
                          className="text-white/30 hover:text-red-400 ml-1"
                        >
                          &times;
                        </button>
                      </span>
                      <span>-{promoDiscount.toLocaleString()} ETB</span>
                    </div>
                  )}
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

              {/* Promo Code */}
              {totalTickets > 0 && !promoApplied && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary placeholder-white/30"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      isLoading={promoLoading}
                      disabled={!promoCode.trim()}
                      variant="outline"
                      className="text-sm"
                    >
                      Apply
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-red-400 text-xs mt-1">{promoError}</p>
                  )}
                </div>
              )}

              {/* Error */}
              {purchaseError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="text-danger text-sm">{purchaseError}</p>
                </div>
              )}

              {/* Payment Method Selector */}
              {isAuthenticated && totalTickets > 0 && (
                <div className="mb-4">
                  <p className="text-white/40 text-xs mb-2">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('TELEBIRR')}
                      className={clsx(
                        'flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium',
                        paymentMethod === 'TELEBIRR'
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      )}
                    >
                      <Smartphone className="w-4 h-4" />
                      Telebirr
                    </button>
                    <button
                      onClick={() => setPaymentMethod('STRIPE')}
                      className={clsx(
                        'flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium',
                        paymentMethod === 'STRIPE'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      )}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card (Visa/MC)
                    </button>
                  </div>
                </div>
              )}

              {/* Gift Toggle */}
              {isAuthenticated && totalTickets > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setIsGift(!isGift)}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-medium',
                      isGift
                        ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    )}
                  >
                    <Gift className="w-4 h-4" />
                    {isGift ? 'Sending as Gift' : 'Buy as Gift'}
                  </button>

                  {isGift && (
                    <div className="mt-3 space-y-3 p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl">
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">Recipient Phone *</label>
                        <input
                          type="tel"
                          value={giftRecipientPhone}
                          onChange={(e) => setGiftRecipientPhone(e.target.value)}
                          placeholder="+251..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">Recipient Name</label>
                        <input
                          type="text"
                          value={giftRecipientName}
                          onChange={(e) => setGiftRecipientName(e.target.value)}
                          placeholder="Their name"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs mb-1 block">Gift Message</label>
                        <textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Add a personal message..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Purchase Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                isLoading={isPurchasing}
                disabled={totalTickets === 0 || (isGift && !giftRecipientPhone)}
                leftIcon={isGift ? <Gift className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
              >
                {!isAuthenticated
                  ? 'Sign In to Purchase'
                  : isGift
                    ? 'Send as Gift'
                    : 'Purchase Tickets'}
              </Button>

              {/* Payment Info */}
              <p className="text-center text-white/40 text-xs mt-4">
                {paymentMethod === 'STRIPE'
                  ? 'Secure payment powered by Stripe (Visa, Mastercard, Amex)'
                  : 'Secure payment powered by Telebirr'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Countdown hook for pricing tier expiry
function useCountdown(targetDate: string | undefined) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
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
  const countdown = useCountdown(ticketType.tierEndsAt);

  // Determine effective price and if there's a discount
  const effectivePrice = ticketType.currentPrice ?? ticketType.price;
  const hasDiscount = ticketType.currentPrice !== undefined && ticketType.currentPrice < ticketType.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - ticketType.currentPrice! / ticketType.price) * 100)
    : 0;
  const isEarlyBird = ticketType.currentTier && ticketType.currentTier.toLowerCase() !== 'standard';

  return (
    <div
      className={clsx(
        'p-4 rounded-xl border transition-colors',
        quantity > 0
          ? 'bg-primary/5 border-primary/30'
          : waitlistStatus?.joined
          ? 'bg-warning/5 border-warning/30'
          : isEarlyBird
          ? 'bg-green-500/5 border-green-500/30'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      )}
    >
      {/* Early Bird Badge & Countdown */}
      {isEarlyBird && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              {ticketType.currentTier}
            </span>
            {hasDiscount && (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                Save {discountPercent}%
              </span>
            )}
          </div>
          {countdown && (
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Timer className="w-3 h-3" />
              <span>
                {countdown.days > 0 && `${countdown.days}d `}
                {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-white font-medium">{ticketType.name}</h3>
          {ticketType.description && (
            <p className="text-white/40 text-sm">{ticketType.description}</p>
          )}
        </div>
        <div className="text-right">
          {hasDiscount && (
            <p className="text-white/40 text-sm line-through">
              {ticketType.price.toLocaleString()} ETB
            </p>
          )}
          <p className={clsx('font-bold', hasDiscount ? 'text-green-400' : 'text-primary')}>
            {effectivePrice === 0 ? 'Free' : `${effectivePrice.toLocaleString()} ETB`}
          </p>
        </div>
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
