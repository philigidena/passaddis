import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Star, Users, ExternalLink, Loader2, Heart,
  CheckCircle2, Globe,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { EventCard } from '@/components/events/EventCard';
import { followsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSavedEvents } from '@/hooks/useSavedEvents';
import clsx from 'clsx';

interface OrganizerProfileData {
  id: string;
  businessName: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  bannerImage: string | null;
  isVerified: boolean;
  createdAt: string;
  followerCount: number;
  eventCount: number;
  averageRating: number;
  totalRatings: number;
  upcomingEvents: any[];
  pastEvents: any[];
}

export function OrganizerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { isEventSaved, toggleSave } = useSavedEvents();

  const [profile, setProfile] = useState<OrganizerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      const [profileRes, followRes] = await Promise.all([
        followsApi.getPublicProfile(id),
        isAuthenticated ? followsApi.isFollowing(id) : Promise.resolve({ data: { following: false } }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }
      if (followRes.data) {
        setIsFollowing(followRes.data.following);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [id, isAuthenticated]);

  const handleFollow = async () => {
    if (!id || !isAuthenticated) return;
    setFollowLoading(true);

    if (isFollowing) {
      const result = await followsApi.unfollow(id);
      if (result.data) {
        setIsFollowing(false);
        setProfile((prev) => prev ? { ...prev, followerCount: prev.followerCount - 1 } : prev);
      }
    } else {
      const result = await followsApi.follow(id);
      if (result.data) {
        setIsFollowing(true);
        setProfile((prev) => prev ? { ...prev, followerCount: prev.followerCount + 1 } : prev);
      }
    }
    setFollowLoading(false);
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

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-white mb-2">Organizer Not Found</h1>
          <p className="text-white/50 mb-6">This organizer doesn't exist or has been removed.</p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const socialLinks = profile.socialLinks as Record<string, string> | null;

  return (
    <Layout>
      <div className="min-h-screen bg-dark-bg">
        {/* Banner */}
        <div className="relative h-48 sm:h-64 lg:h-80">
          {profile.bannerImage ? (
            <img
              src={profile.bannerImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-dark-bg to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-8">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl border-4 border-dark-bg bg-dark-card overflow-hidden flex-shrink-0">
              {profile.logo ? (
                <img src={profile.logo} alt={profile.businessName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {profile.businessName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                  {profile.businessName}
                </h1>
                {profile.isVerified && (
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                )}
              </div>
              {profile.description && (
                <p className="text-white/50 text-sm line-clamp-2 mb-3 max-w-lg">
                  {profile.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {profile.followerCount.toLocaleString()} followers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {profile.eventCount} events
                </span>
                {profile.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {profile.averageRating.toFixed(1)} ({profile.totalRatings} reviews)
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Follow Button */}
            <div className="flex-shrink-0">
              {isAuthenticated && (
                <Button
                  onClick={handleFollow}
                  isLoading={followLoading}
                  variant={isFollowing ? 'outline' : 'primary'}
                  leftIcon={<Heart className={clsx('w-4 h-4', isFollowing && 'fill-current')} />}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>

          {/* Social Links */}
          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-dark-card border border-white/10 rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={clsx(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === 'upcoming'
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
            >
              Upcoming ({profile.upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={clsx(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === 'past'
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
            >
              Past Events ({profile.pastEvents.length})
            </button>
          </div>

          {/* Upcoming Events */}
          {activeTab === 'upcoming' && (
            <div className="pb-20">
              {profile.upcomingEvents.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No upcoming events</p>
                  <p className="text-white/30 text-sm mt-1">Follow this organizer to get notified when new events are published.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.upcomingEvents.map((event: any) => (
                    <EventCard
                      key={event.id}
                      event={{
                        ...event,
                        organizer: { id: profile.id, businessName: profile.businessName, logo: profile.logo || undefined },
                      }}
                      isSaved={isEventSaved(event.id)}
                      onToggleSave={isAuthenticated ? toggleSave : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Past Events */}
          {activeTab === 'past' && (
            <div className="pb-20">
              {profile.pastEvents.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No past events yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.pastEvents.map((event: any) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="group bg-dark-card border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
                    >
                      <div className="aspect-[16/9] bg-white/5 overflow-hidden">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold truncate group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-2 text-white/40 text-sm mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <p className="text-white/30 text-xs mt-1">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
