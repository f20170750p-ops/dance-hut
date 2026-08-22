import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import type { Booking } from '../../services/bookings';
import type { EventItem } from '../../services/events';
import { EventCard } from '../common/EventCard';

interface DiscoverTabProps {
  events: EventItem[];
  eventsLoading: boolean;
  eventsError: string;
  saved: number[];
  bookings: Booking[];
  bookedEvent: EventItem | null;
  userFirstName: string;
  greeting: string;
  formattedToday: string;
  onBook: (event: EventItem) => void;
  onToggleSave: (eventId: number) => void;
  onOpenEvent: (event: EventItem) => void;
  onViewTicket: () => void;
  onNavigateTab: (tab: string) => void;
}

export function DiscoverTab({
  events,
  eventsLoading,
  eventsError,
  saved,
  bookings,
  bookedEvent,
  userFirstName,
  greeting,
  formattedToday,
  onBook,
  onToggleSave,
  onOpenEvent,
  onViewTicket,
  onNavigateTab,
}: DiscoverTabProps) {
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('All styles');
  const [locationFilter, setLocationFilter] = useState('All locations');
  const [dateFilter, setDateFilter] = useState('Any date');
  const [showFilters, setShowFilters] = useState(false);

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = [event.title, event.style, event.location, event.studio, event.host]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStyle = styleFilter === 'All styles' || event.style === styleFilter;
      const matchesLocation = locationFilter === 'All locations' || event.location === locationFilter;
      const matchesDate = dateFilter === 'Any date' || event.date === dateFilter;
      return matchesQuery && matchesStyle && matchesLocation && matchesDate;
    });
  }, [dateFilter, events, locationFilter, query, styleFilter]);

  const styles = useMemo(() => [...new Set(events.map((event) => event.style))], [events]);
  const locations = useMemo(() => [...new Set(events.map((event) => event.location))], [events]);
  const totalSpots = useMemo(() => events.reduce((sum, event) => sum + event.spots, 0), [events]);

  const uniqueNeighborhoods = useMemo(() => {
    const locs = [...new Set(events.map((e) => e.location))];
    if (locs.length <= 2) return locs.join(' & ');
    return `${locs.slice(0, 2).join(', ')} & more`;
  }, [events]);

  const spotlightEvent = useMemo(() => {
    if (!events.length) return null;
    return events.find((e) => e.featured) || events.find((e) => e.spots > 0) || events[0];
  }, [events]);

  const sparklineHeights = useMemo(() => {
    if (!events.length) return [30, 45, 35, 60, 40, 75, 55];
    return [35, 55, 40, 80, 60, 95, 70];
  }, [events]);

  return (
    <>
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot pulse" /> Live schedule · Bengaluru · {formattedToday}
          </div>
          <h2>
            {userFirstName ? (
              <>
                {greeting}, <em>{userFirstName}.</em>
                <br />
                What's your rhythm today?
              </>
            ) : (
              <>
                {greeting}.<br />
                Find your <em>next rhythm.</em>
              </>
            )}
          </h2>
          <p className="hero-sub">
            {events.length > 0
              ? `${events.length} workshops live across ${uniqueNeighborhoods} • ${totalSpots} open spots today`
              : 'Discover the best dance experiences in Bengaluru, curated for your kind of movement.'}
          </p>
        </div>
        <div className="hero-aside">
          <div className="stat-card">
            <div className="stat-value-group">
              <strong>{events.length}</strong>
              <span className="stat-badge">Live</span>
            </div>
            <span>upcoming sessions</span>
          </div>
          <div className="stat-card">
            <div className="stat-value-group">
              <strong>{totalSpots}</strong>
              <span className="stat-sub-label">spots</span>
            </div>
            <span>open for booking</span>
          </div>
          <div className="sparkline" title="Live session capacity trend">
            {sparklineHeights.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </section>

      {spotlightEvent && (
        <section className="sponsored-spotlight-banner">
          <div className="sponsored-banner-left">
            <div className="sponsored-tag-row">
              <span className="sponsored-tag">
                <Sparkles size={13} /> Featured Spotlight
              </span>
              <span className="sponsored-style-badge">{spotlightEvent.style}</span>
              <span className="sponsored-spots-badge">{spotlightEvent.spots} spots left</span>
            </div>
            <h3 className="sponsored-title">{spotlightEvent.title}</h3>
            <div className="sponsored-meta-row">
              <span>
                <Clock3 size={14} /> {spotlightEvent.date} · {spotlightEvent.time}
              </span>
              <span>
                <MapPin size={14} /> {spotlightEvent.studio} · {spotlightEvent.location}
              </span>
              <span>
                with <strong>{spotlightEvent.host}</strong>
              </span>
            </div>
            <div className="sponsored-actions">
              <button
                type="button"
                className="primary-btn sponsored-book-btn"
                onClick={() => onBook(spotlightEvent)}
                disabled={
                  spotlightEvent.spots <= 0 ||
                  bookings.some((b) => b.event_id === spotlightEvent.id)
                }
              >
                {bookings.some((b) => b.event_id === spotlightEvent.id) ? (
                  <>
                    Booked <Check size={16} />
                  </>
                ) : spotlightEvent.spots <= 0 ? (
                  'Sold out'
                ) : (
                  <>
                    Book this session · {spotlightEvent.price} <ArrowRight size={16} />
                  </>
                )}
              </button>
              <button
                type="button"
                className="sponsored-details-btn"
                onClick={() => onOpenEvent(spotlightEvent)}
              >
                View details
              </button>
            </div>
          </div>
          <div
            className="sponsored-banner-right"
            onClick={() => onOpenEvent(spotlightEvent)}
            role="button"
            tabIndex={0}
            title="Click to view workshop details"
          >
            <img src={spotlightEvent.image} alt={spotlightEvent.title} />
            <div className="sponsored-image-overlay">
              <span className="sponsored-price-pill">{spotlightEvent.price}</span>
            </div>
          </div>
        </section>
      )}

      <section className="search-row">
        <div className="search-box">
          <Search size={19} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a style, class, studio or choreographer"
          />
        </div>
        <button
          type="button"
          className={`filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} /> <span>Filters</span>
        </button>
      </section>

      <div className="quick-styles-row">
        <span className="quick-styles-label">Popular styles:</span>
        <div className="quick-styles-list">
          <button
            type="button"
            className={`style-chip ${styleFilter === 'All styles' ? 'active' : ''}`}
            onClick={() => setStyleFilter('All styles')}
          >
            All styles ({events.length})
          </button>
          {styles.map((style) => {
            const count = events.filter((e) => e.style === style).length;
            return (
              <button
                type="button"
                key={style}
                className={`style-chip ${styleFilter === style ? 'active' : ''}`}
                onClick={() => setStyleFilter(styleFilter === style ? 'All styles' : style)}
              >
                {style} <small>({count})</small>
              </button>
            );
          })}
        </div>
      </div>

      {showFilters && (
        <div className="filters">
          <label>
            When
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option>Any date</option>
              {events.map((event) => (
                <option key={event.id} value={event.date}>
                  {event.date}
                </option>
              ))}
            </select>
          </label>
          <label>
            Style
            <select
              value={styleFilter}
              onChange={(event) => setStyleFilter(event.target.value)}
            >
              <option>All styles</option>
              {styles.map((style) => (
                <option key={style}>{style}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
            >
              <option>All locations</option>
              {locations.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="clear-filter"
            onClick={() => {
              setDateFilter('Any date');
              setStyleFilter('All styles');
              setLocationFilter('All locations');
              setShowFilters(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <section className="section-head">
        <div>
          <span className="section-kicker">Picked for you</span>
          <h3>Happening this week</h3>
        </div>
        <button
          type="button"
          className="text-btn"
          onClick={() => onNavigateTab('Calendar')}
        >
          View calendar <ArrowRight size={16} />
        </button>
      </section>

      {eventsLoading && (
        <div className="data-state">
          <span className="loader-dot" /> Loading classes from Supabase…
        </div>
      )}
      {eventsError && (
        <div className="data-error" role="alert">
          {eventsError}
        </div>
      )}
      {!eventsLoading && (
        <section className="event-grid">
          {visibleEvents.map((event) => (
            <EventCard
              event={event}
              saved={saved.includes(event.id)}
              onSave={() => onToggleSave(event.id)}
              onOpen={() => onOpenEvent(event)}
              key={event.id}
            />
          ))}
        </section>
      )}
      {visibleEvents.length === 0 && (
        <div className="empty-state">
          <Search size={30} />
          <h3>No dances found</h3>
          <p>Try a different style, studio, or neighbourhood.</p>
        </div>
      )}

      <section className="lower-grid">
        <div className="studio-banner">
          <div className="banner-copy">
            <span className="section-kicker">Meet the community</span>
            <h3>
              Good energy<br />
              <em>lives here.</em>
            </h3>
            <p>From first steps to full-out freestyle. Find your people and your pace.</p>
            <button type="button" className="light-btn">
              Explore studios <ArrowRight size={15} />
            </button>
          </div>
          <div className="banner-art">
            <div className="circle circle-one" />
            <div className="circle circle-two" />
            <div className="banner-figure">✦</div>
          </div>
        </div>

        <div className="next-up">
          <div className="section-head compact">
            <div>
              <span className="section-kicker">Your week</span>
              <h3>Next up</h3>
            </div>
            <button type="button" className="dots-btn">•••</button>
          </div>
          {bookedEvent ? (
            <button
              type="button"
              className="upcoming-item"
              onClick={onViewTicket}
            >
              <div className="date-block">
                <strong>18</strong>
                <span>AUG</span>
              </div>
              <div>
                <strong>{bookedEvent.title}</strong>
                <span>
                  {bookedEvent.time} · {bookedEvent.location}
                </span>
              </div>
              <span className="upcoming-check">
                <Check size={14} />
              </span>
            </button>
          ) : (
            <div className="empty-upcoming">
              <CalendarDays size={20} />
              <span>No bookings yet</span>
              <button type="button" onClick={() => onNavigateTab('Discover')}>
                Find a class
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
