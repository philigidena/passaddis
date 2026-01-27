import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, Shield, Smartphone, Calendar, Loader2, Sparkles, Play, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { useEvents } from '@/hooks/useEvents';

// Hero carousel slides configuration
const heroSlides = [
  {
    id: 1,
    tag: 'Live Concerts',
    title: 'Feel the',
    highlight: 'Rhythm',
    subtitle: 'of Ethiopia',
    description: 'Experience electrifying performances from top Ethiopian and international artists.',
    image: '/hero/concert.jpeg',
    gradient: 'from-purple-900/80 via-dark-bg/60 to-dark-bg',
  },
  {
    id: 2,
    tag: 'Cultural Events',
    title: 'Celebrate',
    highlight: 'Heritage',
    subtitle: '& Tradition',
    description: 'Connect with Ethiopia\'s rich cultural tapestry through festivals and celebrations.',
    image: '/hero/culture.jpeg',
    gradient: 'from-amber-900/80 via-dark-bg/60 to-dark-bg',
  },
  {
    id: 3,
    tag: 'Sports Events',
    title: 'Witness',
    highlight: 'Champions',
    subtitle: 'Rise',
    description: 'Cheer for your favorite teams and athletes in thrilling sporting events.',
    image: '/hero/sports.jpeg',
    gradient: 'from-green-900/80 via-dark-bg/60 to-dark-bg',
  },
  {
    id: 4,
    tag: 'Conferences',
    title: 'Ideas That',
    highlight: 'Inspire',
    subtitle: 'Change',
    description: 'Join thought leaders and innovators shaping Africa\'s future.',
    image: '/hero/conference.jpeg',
    gradient: 'from-blue-900/80 via-dark-bg/60 to-dark-bg',
  },
];

export function HomePage() {
  const { events, isLoading, error } = useEvents({ featured: true });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);

  return (
    <Layout>
      {/* Hero Carousel Section - AWWWARDS Inspired */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Carousel Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/30 to-transparent" />
            </div>
          </div>
        ))}

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 border border-white/5 rounded-2xl rotate-12 animate-float" />
          <div className="absolute top-40 right-20 w-16 h-16 border border-primary/10 rounded-full animate-float animation-delay-1000" />
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-accent/5 rounded-lg rotate-45 animate-float animation-delay-2000" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Tag */}
              <div
                key={`tag-${currentSlide}`}
                className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 mb-8 animate-fade-in-up"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm text-white/80 font-medium">{heroSlides[currentSlide].tag}</span>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>

              {/* Main Heading */}
              <h1
                key={`title-${currentSlide}`}
                className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[0.95] tracking-tight"
              >
                <span className="block animate-fade-in-up">
                  {heroSlides[currentSlide].title}
                </span>
                <span className="block text-gradient animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  {heroSlides[currentSlide].highlight}
                </span>
                <span className="block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {heroSlides[currentSlide].subtitle}
                </span>
              </h1>

              {/* Description */}
              <p
                key={`desc-${currentSlide}`}
                className="text-lg text-white/50 max-w-md mb-10 animate-fade-in-up font-light"
                style={{ animationDelay: '0.3s' }}
              >
                {heroSlides[currentSlide].description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link to="/events">
                  <button className="group relative px-8 py-4 bg-primary text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,184,148,0.4)] hover:scale-105">
                    <span className="relative z-10 flex items-center gap-2">
                      Explore Events
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
                <Link to="/organizer">
                  <button className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105 flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Host Your Event
                  </button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 flex items-center gap-8">
                <div>
                  <p className="text-3xl font-black text-white">50<span className="text-primary">+</span></p>
                  <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Events</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-3xl font-black text-white">10K<span className="text-primary">+</span></p>
                  <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Tickets Sold</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-3xl font-black text-white">5K<span className="text-primary">+</span></p>
                  <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Happy Users</p>
                </div>
              </div>
            </div>

            {/* Right Side - Carousel Indicators & Navigation */}
            <div className="hidden lg:flex flex-col items-end justify-center gap-8">
              {/* Slide Number */}
              <div className="text-right">
                <span className="text-7xl font-black text-white/10">
                  0{currentSlide + 1}
                </span>
                <span className="text-2xl text-white/30">/0{heroSlides.length}</span>
              </div>

              {/* Navigation Arrows */}
              <div className="flex gap-3">
                <button
                  onClick={prevSlide}
                  className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? 'w-12 bg-primary'
                    : 'w-6 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Marquee Text */}
          <div className="py-4 border-t border-white/5 bg-dark-bg/50 backdrop-blur-sm overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="mx-8 text-white/20 text-sm uppercase tracking-[0.3em] font-medium">
                  Concerts <span className="text-primary">•</span> Festivals <span className="text-primary">•</span> Conferences <span className="text-primary">•</span> Sports <span className="text-primary">•</span> Theater <span className="text-primary">•</span> Comedy
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Location Tag */}
        <div className="absolute bottom-24 left-8 hidden md:flex items-center gap-2 text-white/40 text-sm">
          <MapPin className="w-4 h-4" />
          <span>Addis Ababa, Ethiopia</span>
        </div>

        {/* Mobile Navigation */}
        <div className="absolute bottom-24 right-4 flex gap-2 lg:hidden">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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
