import { useMemo, useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Flame,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
} from 'lucide-react';
import type { Booking } from '../../services/bookings';
import type { EventItem } from '../../services/events';
import type { CountdownPhase } from '../../hooks/useClassCountdown';
import { EventCard } from '../common/EventCard';
import { CheckInCard } from '../common/CheckInCard';
import { StudioExplorerModal } from '../modals/StudioExplorerModal';
import { DatePickerPopover, type DateFilterValue } from '../common/DatePickerPopover';

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
  countdownPhase: CountdownPhase;
  countdownLabel: string;
  countdownEvent: EventItem | null;
  countdownBookingId: number | null;
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
  countdownPhase,
  countdownLabel,
  countdownEvent,
  countdownBookingId,
  onBook,
  onToggleSave,
  onOpenEvent,
  onViewTicket,
  onNavigateTab,
}: DiscoverTabProps) {
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('All styles');
  const [locationFilter, setLocationFilter] = useState('All locations');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    type: 'any',
    label: 'Any date',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showStudioExplorer, setShowStudioExplorer] = useState(false);
  const [showNextUpMenu, setShowNextUpMenu] = useState(false);
  const nextUpMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (nextUpMenuRef.current && !nextUpMenuRef.current.contains(e.target as Node)) {
        setShowNextUpMenu(false);
      }
    }
    if (showNextUpMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNextUpMenu]);

  const upcomingTarget = bookedEvent || countdownEvent;

  const bookedDateParts = useMemo(() => {
    if (!upcomingTarget) return { day: '18', month: 'AUG' };
    try {
      if (upcomingTarget.dateKey) {
        const d = new Date(`${upcomingTarget.dateKey}T00:00:00`);
        if (!isNaN(d.getTime())) {
          return {
            day: String(d.getDate()),
            month: d.toLocaleString('en-IN', { month: 'short' }).toUpperCase(),
          };
        }
      }
      const parts = upcomingTarget.date.split(/[\s,]+/);
      if (parts.length >= 3) {
        return { day: parts[1], month: parts[2].toUpperCase() };
      }
    } catch {}
    return { day: '18', month: 'AUG' };
  }, [upcomingTarget]);

  const handleSelectStudio = (studioName: string) => {
    setQuery(studioName);
    setStyleFilter('All styles');
    setLocationFilter('All locations');
    setDateFilter({ type: 'any', label: 'Any date' });
  };

  const searchMatchingEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = [event.title, event.style, event.location, event.studio, event.host]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesLocation = locationFilter === 'All locations' || event.location === locationFilter;

      let matchesDate = true;
      if (dateFilter.type === 'specific' && dateFilter.dateKey) {
        matchesDate = event.dateKey === dateFilter.dateKey || event.date === dateFilter.label;
      } else if (dateFilter.type === 'preset' && dateFilter.presetKey) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const evDate = event.dateKey ? new Date(event.dateKey) : new Date();

        if (dateFilter.presetKey === 'today') {
          matchesDate = event.dateKey === todayStr;
        } else if (dateFilter.presetKey === 'tomorrow') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          matchesDate = event.dateKey === tomorrowStr;
        } else if (dateFilter.presetKey === 'weekend') {
          const dayOfWeek = evDate.getDay();
          matchesDate = dayOfWeek === 0 || dayOfWeek === 6;
        } else if (dateFilter.presetKey === 'week') {
          const diffDays = (evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          matchesDate = diffDays >= 0 && diffDays <= 7;
        }
      }

      return matchesQuery && matchesLocation && matchesDate;
    });
  }, [dateFilter, events, locationFilter, query]);

  const visibleEvents = useMemo(() => {
    return searchMatchingEvents.filter((event) => {
      return styleFilter === 'All styles' || event.style === styleFilter;
    });
  }, [searchMatchingEvents, styleFilter]);

  const styles = useMemo(() => [...new Set(events.map((event) => event.style))], [events]);
  const locations = useMemo(() => [...new Set(events.map((event) => event.location))], [events]);
  const spotlightEvent = useMemo(() => {
    if (!events.length) return null;
    return events.find((e) => e.featured) || events.find((e) => e.spots > 0) || events[0];
  }, [events]);

  // Urgency: find the class with fewest spots (but > 0) for State B
  const urgentEvent = useMemo(() => {
    const available = events.filter((e) => e.spots > 0);
    if (!available.length) return null;
    return available.reduce((min, e) => (e.spots < min.spots ? e : min), available[0]);
  }, [events]);

  const isQRActive = countdownPhase === 'checkin' || countdownPhase === 'in-progress';

  return (
    <>
      {isQRActive && countdownEvent ? (
        <CheckInCard
          event={countdownEvent}
          bookingId={countdownBookingId}
          timeLabel={countdownLabel}
          phase={countdownPhase}
        />
      ) : (
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
            {countdownPhase === 'countdown' && countdownEvent ? (
              <div className="hero-countdown">
                <Clock3 size={15} />
                <span>
                  <strong>{countdownEvent.title}</strong> in{' '}
                  <span className="hero-countdown-time">{countdownLabel}</span>
                  {' — '}{countdownEvent.time} · {countdownEvent.studio}
                </span>
                <button type="button" className="text-btn" onClick={onViewTicket}>
                  View ticket <ArrowRight size={14} />
                </button>
              </div>
            ) : urgentEvent ? (
              <button
                type="button"
                className="hero-urgency"
                onClick={() => onOpenEvent(urgentEvent)}
              >
                <Flame size={15} />
                <span>
                  <strong>{urgentEvent.title}</strong> starts at {urgentEvent.time}
                  {' — only '}<strong>{urgentEvent.spots} spots left</strong>
                </span>
                <span className="hero-urgency-cta">Book now <ArrowRight size={13} /></span>
              </button>
            ) : (
              <p className="hero-sub">
                Discover the best dance experiences in Bengaluru, curated for your kind of movement.
              </p>
            )}
          </div>
        </section>
      )}

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
            All styles ({searchMatchingEvents.length})
          </button>
          {styles.map((style) => {
            const count = searchMatchingEvents.filter((e) => e.style === style).length;
            return (
              <button
                type="button"
                key={style}
                className={`style-chip ${styleFilter === style ? 'active' : ''} ${count === 0 ? 'zero-count' : ''}`}
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
          <div className="filter-group">
            <span className="filter-label">When</span>
            <DatePickerPopover
              value={dateFilter}
              onChange={setDateFilter}
              events={events}
            />
          </div>
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
              setDateFilter({ type: 'any', label: 'Any date' });
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
            <button
              type="button"
              className="light-btn"
              onClick={() => setShowStudioExplorer(true)}
            >
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
          <div className="section-head compact next-up-head">
            <div>
              <span className="section-kicker">Your week</span>
              <h3>Next up</h3>
            </div>
            <div className="next-up-action-wrap" ref={nextUpMenuRef}>
              <button
                type="button"
                className={`dots-btn ${showNextUpMenu ? 'active' : ''}`}
                onClick={() => setShowNextUpMenu(!showNextUpMenu)}
                aria-label="Upcoming class actions"
                aria-expanded={showNextUpMenu}
              >
                •••
              </button>

              {showNextUpMenu && (
                <div className="next-up-dropdown">
                  {upcomingTarget ? (
                    <>
                      <button
                        type="button"
                        className="next-up-menu-item"
                        onClick={() => {
                          setShowNextUpMenu(false);
                          onViewTicket();
                        }}
                      >
                        <Ticket size={14} />
                        <span>View Pass / Ticket</span>
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          upcomingTarget.studio + ', ' + upcomingTarget.location + ', Bengaluru'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="next-up-menu-item"
                        onClick={() => setShowNextUpMenu(false)}
                      >
                        <Navigation size={14} />
                        <span>Navigate to Studio</span>
                      </a>
                      <button
                        type="button"
                        className="next-up-menu-item"
                        onClick={() => {
                          setShowNextUpMenu(false);
                          onOpenEvent(upcomingTarget);
                        }}
                      >
                        <SlidersHorizontal size={14} />
                        <span>Manage Booking</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="next-up-menu-item"
                        onClick={() => {
                          setShowNextUpMenu(false);
                          onNavigateTab('Calendar');
                        }}
                      >
                        <CalendarDays size={14} />
                        <span>View Class Calendar</span>
                      </button>
                      <button
                        type="button"
                        className="next-up-menu-item"
                        onClick={() => {
                          setShowNextUpMenu(false);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                      >
                        <Sparkles size={14} />
                        <span>Find a Workshop</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {upcomingTarget ? (
            <button
              type="button"
              className="upcoming-item"
              onClick={onViewTicket}
            >
              <div className="date-block">
                <strong>{bookedDateParts.day}</strong>
                <span>{bookedDateParts.month}</span>
              </div>
              <div>
                <strong>{upcomingTarget.title}</strong>
                <span>
                  {upcomingTarget.time} · {upcomingTarget.studio}
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

      <StudioExplorerModal
        isOpen={showStudioExplorer}
        onClose={() => setShowStudioExplorer(false)}
        events={events}
        onSelectStudio={handleSelectStudio}
      />
    </>
  );
}
