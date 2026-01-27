import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, Shield, Smartphone, Calendar, Sparkles, Play, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
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
                className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
              >
                <span className="block animate-fade-in-up overflow-visible pb-1">
                  {heroSlides[currentSlide].title}
                </span>
                <span className="block text-gradient animate-fade-in-up overflow-visible py-1" style={{ animationDelay: '0.1s' }}>
                  {heroSlides[currentSlide].highlight}
                </span>
                <span className="block animate-fade-in-up overflow-visible pt-1" style={{ animationDelay: '0.2s' }}>
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

      {/* How It Works - Modern Design */}
      <section className="py-32 bg-dark-card relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6">
              Simple Process
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Three Steps to
              <span className="block text-gradient">Your Experience</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              Getting your tickets is simple, secure, and instant
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                icon: Calendar,
                title: 'Discover Events',
                description: 'Browse our curated collection of concerts, festivals, sports, and conferences happening across Ethiopia.',
                gradient: 'from-purple-500/20 to-purple-500/0',
              },
              {
                step: '02',
                icon: Smartphone,
                title: 'Pay with Telebirr',
                description: 'Complete your purchase securely using Telebirr mobile money - fast, safe, and convenient.',
                gradient: 'from-primary/20 to-primary/0',
              },
              {
                step: '03',
                icon: Ticket,
                title: 'Get Your Ticket',
                description: 'Receive your QR code ticket instantly. Just show it at the entrance and enjoy the event.',
                gradient: 'from-accent/20 to-accent/0',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="relative p-8 lg:p-10 rounded-3xl bg-dark-bg border border-white/5 h-full transition-all duration-500 hover:border-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50">
                  {/* Step Number */}
                  <span className="absolute -top-4 -left-2 text-8xl font-black text-white/[0.03] select-none">
                    {item.step}
                  </span>

                  {/* Gradient Glow */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                      <item.icon className="w-7 h-7 text-white/60 group-hover:text-primary transition-colors duration-300" />
                    </div>

                    {/* Step Label */}
                    <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-3 block">
                      Step {item.step}
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/50 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-6 w-8 lg:w-12 h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events - Modern Design */}
      <section className="py-32 bg-dark-bg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Live & Upcoming
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                Featured
                <span className="block text-gradient">Events</span>
              </h2>
            </div>
            <Link to="/events" className="group">
              <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                View All Events
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-red-400" />
              </div>
              <p className="text-white/60 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/10"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-white/30" />
              </div>
              <p className="text-white/40 text-lg">No events available at the moment</p>
              <p className="text-white/30 text-sm mt-2">Check back soon for upcoming events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section - Modern Design */}
      <section className="py-32 bg-dark-card relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] -translate-y-1/2 -translate-x-1/2 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 translate-x-1/2 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6">
                Why PassAddis?
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                Trusted by
                <span className="block text-gradient">Thousands</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8">
                We've built the most secure and reliable ticketing platform in Ethiopia. Your experience and security are our top priorities.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-4xl font-black text-white">99<span className="text-primary">%</span></p>
                  <p className="text-white/40 text-sm mt-1">Uptime</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white">5K<span className="text-primary">+</span></p>
                  <p className="text-white/40 text-sm mt-1">Users</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white">24<span className="text-primary">/7</span></p>
                  <p className="text-white/40 text-sm mt-1">Support</p>
                </div>
              </div>
            </div>

            {/* Right - Feature Cards */}
            <div className="grid gap-4">
              {[
                {
                  icon: Shield,
                  title: 'Secure Payments',
                  description: 'All transactions are encrypted and processed securely through Telebirr mobile money.',
                  gradient: 'from-green-500/20',
                },
                {
                  icon: Ticket,
                  title: 'Verified Tickets',
                  description: 'Every ticket comes with a unique QR code that guarantees authentic entry.',
                  gradient: 'from-purple-500/20',
                },
                {
                  icon: Smartphone,
                  title: 'Instant Delivery',
                  description: 'Receive your digital tickets instantly after payment - no waiting, no hassle.',
                  gradient: 'from-blue-500/20',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl bg-dark-bg border border-white/5 transition-all duration-300 hover:border-white/10 hover:bg-dark-bg/80"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-white/60 group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="py-32 bg-dark-bg relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-dark-bg to-accent/10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-20 h-20 border border-white/5 rounded-2xl rotate-12 animate-float" />
          <div className="absolute bottom-20 right-20 w-16 h-16 border border-primary/10 rounded-full animate-float animation-delay-1000" />
          <div className="absolute top-1/2 left-10 w-12 h-12 bg-accent/5 rounded-lg rotate-45 animate-float animation-delay-2000" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Start Your Journey
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Experience
            <span className="block text-gradient">Amazing Events?</span>
          </h2>

          <p className="text-white/50 text-lg sm:text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of Ethiopians who use PassAddis for their event ticketing needs. Discover, book, and enjoy unforgettable experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/events">
              <button className="group relative px-10 py-5 bg-white text-dark-bg font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105">
                <span className="relative z-10 flex items-center gap-3 text-lg">
                  Browse Events
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute inset-0 flex items-center justify-center gap-3 text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Browse Events
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </Link>
            <Link to="/organizer">
              <button className="px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105 text-lg">
                Host an Event
              </button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
