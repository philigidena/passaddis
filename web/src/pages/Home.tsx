import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, Shield, Smartphone, Calendar, Star, Loader2, Building2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { useEvents } from '@/hooks/useEvents';

export function HomePage() {
  const { events, isLoading, error } = useEvents({ featured: true });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background - Using local hero image */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm text-white/80">Ethiopia's #1 Event Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Discover Amazing
            <span className="text-gradient block">Events in Addis</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            From concerts to conferences, find and book tickets to the best events
            happening in Ethiopia. Secure, fast, and hassle-free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/events">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore Events
              </Button>
            </Link>
            <Link to="/organizer">
              <Button variant="outline" size="lg" leftIcon={<Building2 className="w-5 h-5" />}>
                Host Your Event
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-white/40 text-sm">Events</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-white/40 text-sm">Tickets Sold</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">5K+</p>
              <p className="text-white/40 text-sm">Happy Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Getting your tickets is simple and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-dark-bg border border-white/5">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Find Events</h3>
              <p className="text-white/60">
                Browse our curated collection of events happening in Ethiopia
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-dark-bg border border-white/5">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Pay Securely</h3>
              <p className="text-white/60">
                Pay securely with Telebirr mobile money
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-dark-bg border border-white/5">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Get Your Ticket</h3>
              <p className="text-white/60">
                Receive your QR code ticket instantly - just scan at entry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">
                Upcoming Events
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Don't Miss Out
              </h2>
            </div>
            <Link to="/events">
              <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-white/60">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No events available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Secure & Trusted
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Your security is our priority
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-xl bg-dark-bg border border-white/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Payments</h3>
                <p className="text-white/60 text-sm">
                  All payments processed securely through Telebirr
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl bg-dark-bg border border-white/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Verified Tickets</h3>
                <p className="text-white/60 text-sm">
                  Every ticket comes with a unique QR code for verified entry
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl bg-dark-bg border border-white/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Instant Delivery</h3>
                <p className="text-white/60 text-sm">
                  Receive your tickets instantly after payment confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Experience Amazing Events?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of Ethiopians who use PassAddis for their event ticketing needs
          </p>
          <Link to="/events">
            <Button size="lg" className="animate-pulse-glow">
              Browse Events
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
