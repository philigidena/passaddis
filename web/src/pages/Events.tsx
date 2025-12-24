import { useState } from 'react';
import { Search, Filter, Calendar, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEvents } from '@/hooks/useEvents';
import clsx from 'clsx';

const CATEGORIES = [
  { value: 'all', label: 'All Events' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'ARTS', label: 'Arts' },
  { value: 'COMEDY', label: 'Comedy' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'NIGHTLIFE', label: 'Nightlife' },
];

export function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { events, isLoading, error, fetchByCategory, searchEvents } = useEvents();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEvents(searchQuery);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchByCategory(category);
  };

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg">
        {/* Header */}
        <div className="bg-dark-card border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Discover Events
            </h1>
            <p className="text-white/60 max-w-2xl">
              Find the best events happening in Addis Ababa and across Ethiopia
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-8 flex gap-4">
              <div className="flex-1 max-w-xl">
                <Input
                  placeholder="Search events, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>
              <Button type="submit" leftIcon={<Search className="w-4 h-4" />}>
                Search
              </Button>
            </form>

            {/* Category Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={clsx(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    selectedCategory === category.value
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-white/60 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
              <p className="text-white/60 mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for upcoming events'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    fetchByCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-white/60">
                  Showing <span className="text-white font-medium">{filteredEvents.length}</span>{' '}
                  events
                </p>
                <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}>
                  Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
