import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Star } from 'lucide-react';
import type { Event } from '@/types';
import clsx from 'clsx';

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const priceRange =
    event.minPrice === 0
      ? 'Free'
      : event.minPrice === event.maxPrice
        ? `${event.minPrice} ETB`
        : `${event.minPrice} - ${event.maxPrice} ETB`;

  return (
    <Link
      to={`/events/${event.id}`}
      className={clsx(
        'group bg-dark-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-md uppercase">
          {event.category}
        </span>

        {/* Featured Badge */}
        {event.isFeatured && (
          <span className="absolute top-3 right-3 bg-accent text-dark-bg text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3" />
            Featured
          </span>
        )}

        {/* Event Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-accent text-xs mb-1">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <h3 className="text-white font-bold text-lg line-clamp-2">{event.title}</h3>
          <div className="flex items-center gap-1 text-white/60 text-xs mt-1">
            <MapPin className="w-3 h-3" />
            <span>{event.venue}, {event.city}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs">From</p>
          <p className="text-primary font-bold">{priceRange}</p>
        </div>
        <button className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
          <Ticket className="w-4 h-4" />
          Tickets
        </button>
      </div>
    </Link>
  );
}
