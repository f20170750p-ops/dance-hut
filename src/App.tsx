import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Heart,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { Session, User } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import {
  getDisplayName,
  getInitials,
  getProfile,
  getRoleBadge,
  getSession,
  onAuthStateChange,
  saveProfile,
  signInWithEmailPassword,
  signOut,
  signUpWithEmailPassword,
  updateProfile,
  type UserProfile,
  type UserRole,
} from './services/auth';
import { createBooking, getUserBookings, type Booking } from './services/bookings';
import { getEvents, type EventItem } from './services/events';
import { getSavedEventIds, saveEvent, unsaveEvent } from './services/savedEvents';
import { isSupabaseConfigured } from './services/supabase';

type Role = UserRole;
const roles: { id: Role; label: string; detail: string; icon: typeof UserRound }[] = [
  { id: 'dancer', label: 'I’m a dancer', detail: 'Discover classes & book your next session', icon: UserRound },
  { id: 'choreographer', label: 'I’m a choreographer', detail: 'Find studios & manage your schedule', icon: Sparkles },
  { id: 'studio', label: 'I run a studio', detail: 'Fill classes & grow your community', icon: Users },
];

function App() {
  const [role, setRole] = useState<Role>('dancer');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [activeTab, setActiveTab] = useState('Discover');
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('All styles');
  const [locationFilter, setLocationFilter] = useState('All locations');
  const [dateFilter, setDateFilter] = useState('Any date');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [bookedEvent, setBookedEvent] = useState<EventItem | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingError, setBookingError] = useState('');
  const [showBookingToast, setShowBookingToast] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    getSession().then(({ session: currentSession }) => {
      setSession(currentSession);
      setAuthLoading(false);
    });

    const { data: listener } = onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    const syncUserProfile = async () => {
      const pendingRole = localStorage.getItem('dancehut.pendingRole') as Role | null;
      const pendingName = localStorage.getItem('dancehut.pendingDisplayName');
      const { data: existingProfile } = await getProfile(session.user.id);

      const effectiveRole = (pendingRole || existingProfile?.role || (session.user.user_metadata?.role as Role | undefined) || role) as Role;
      const effectiveName = pendingName || existingProfile?.display_name || (session.user.user_metadata?.display_name as string | undefined) || null;

      if (!existingProfile || pendingRole || pendingName) {
        await saveProfile(session.user.id, effectiveRole, session.user.email ?? '', effectiveName);
        if (pendingRole) localStorage.removeItem('dancehut.pendingRole');
        if (pendingName) localStorage.removeItem('dancehut.pendingDisplayName');
        setProfile({
          id: session.user.id,
          role: effectiveRole,
          display_name: effectiveName,
          email: session.user.email ?? null,
        });
      } else {
        setProfile(existingProfile);
      }
    };

    syncUserProfile();
  }, [session, role]);

  useEffect(() => {
    if (!session?.user) return;

    setEventsLoading(true);
    Promise.all([getEvents(), getSavedEventIds(session.user.id), getUserBookings(session.user.id)])
      .then(([eventResult, savedResult, bookingResult]) => {
        if (eventResult.error) setEventsError(eventResult.error.message);
        setEvents(eventResult.data);
        if (!savedResult.error) setSaved(savedResult.data);
        if (!bookingResult.error) {
          const latestBooking = bookingResult.data[0] ?? null;
          setBookings(bookingResult.data);
          setActiveBooking(latestBooking);
          setBookedEvent(latestBooking ? eventResult.data.find((event) => event.id === latestBooking.event_id) ?? null : null);
        }
      })
      .catch((error: Error) => setEventsError(error.message))
      .finally(() => setEventsLoading(false));
  }, [session]);

  const visibleEvents = useMemo(() => events.filter((event) => {
    const matchesQuery = [event.title, event.style, event.location, event.studio, event.host].join(' ').toLowerCase().includes(query.toLowerCase());
    const matchesStyle = styleFilter === 'All styles' || event.style === styleFilter;
    const matchesLocation = locationFilter === 'All locations' || event.location === locationFilter;
    const matchesDate = dateFilter === 'Any date' || event.date === dateFilter;
    return matchesQuery && matchesStyle && matchesLocation && matchesDate;
  }), [dateFilter, events, locationFilter, query, styleFilter]);

  const styles = [...new Set(events.map((event) => event.style))];
  const locations = [...new Set(events.map((event) => event.location))];
  const totalSpots = useMemo(() => events.reduce((sum, event) => sum + event.spots, 0), [events]);
  const uniqueStudiosCount = useMemo(() => new Set(events.map((event) => event.studio)).size, [events]);

  const uniqueNeighborhoods = useMemo(() => {
    const locs = [...new Set(events.map((e) => e.location))];
    if (locs.length <= 2) return locs.join(' & ');
    return `${locs.slice(0, 2).join(', ')} & more`;
  }, [events]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const spotlightEvent = useMemo(() => {
    if (!events.length) return null;
    return events.find((e) => e.featured) || events.find((e) => e.spots > 0) || events[0];
  }, [events]);

  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const sparklineHeights = useMemo(() => {
    if (!events.length) return [30, 45, 35, 60, 40, 75, 55];
    return [35, 55, 40, 80, 60, 95, 70];
  }, [events]);

  const book = async (event: EventItem) => {
    if (!session?.user) return;
    setBookingError('');
    if (bookings.some((booking) => booking.event_id === event.id)) {
      setBookingError('You have already booked this class. You can find it in My bookings.');
      return;
    }
    if (event.spots <= 0) {
      setBookingError('This class is sold out. Please choose another session.');
      return;
    }

    const { data, error } = await createBooking(session.user.id, event.id);
    if (error) {
      setBookingError(error.message.includes('already') ? 'You have already booked this class. You can find it in My bookings.' : error.message.includes('sold out') ? 'This class is sold out. Please choose another session.' : error.message);
      return;
    }

    setBookings((currentBookings) => data ? [data, ...currentBookings] : currentBookings);
    setActiveBooking(data);
    setBookedEvent(event);
    setShowBookingToast(true);
    setSelectedEvent(null);
    setEvents((currentEvents) => currentEvents.map((item) => item.id === event.id ? { ...item, spots: Math.max(0, item.spots - 1) } : item));
  };

  const toggleSaved = async (eventId: number) => {
    if (!session?.user) return;
    const wasSaved = saved.includes(eventId);
    setSaved((currentSaved) => wasSaved ? currentSaved.filter((id) => id !== eventId) : [...currentSaved, eventId]);
    const result = wasSaved ? await unsaveEvent(session.user.id, eventId) : await saveEvent(session.user.id, eventId);
    if (result.error) {
      setSaved((currentSaved) => wasSaved ? [...currentSaved, eventId] : currentSaved.filter((id) => id !== eventId));
      setEventsError(result.error.message);
    }
  };

  const currentUserName = useMemo(() => getDisplayName(profile, session?.user ?? null), [profile, session?.user]);
  const currentUserInitials = useMemo(() => getInitials(currentUserName), [currentUserName]);
  const currentUserRole = profile?.role ?? (session?.user?.user_metadata?.role as Role | undefined) ?? role;
  const currentUserRoleBadge = useMemo(() => getRoleBadge(currentUserRole), [currentUserRole]);
  const userFirstName = useMemo(() => {
    if (!currentUserName || currentUserName === 'Dancer') return '';
    return currentUserName.split(' ')[0];
  }, [currentUserName]);

  if (authLoading) {
    return <div className="auth-loading">Loading dancehut…</div>;
  }

  if (!session) {
    return (
      <div className="welcome-page">
        <div className="welcome-orb orb-one" />
        <div className="welcome-orb orb-two" />
        <nav className="welcome-nav"><div className="brand"><span className="brand-mark">D</span><span>dancehut</span></div><span className="nav-note">Made for movement</span></nav>
        <main className="welcome-main">
          <div className="welcome-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Bengaluru’s dance community</div>
            <h1>Find your<br /><em>next rhythm.</em></h1>
            <p>One place for every class, workshop, and dance floor in your city.</p>
            <div className="role-picker">
              <p className="picker-label">Tell us how you move</p>
              {roles.map(({ id, label, detail, icon: Icon }) => (
                <button className={`role-option ${role === id ? 'selected' : ''}`} key={id} onClick={() => setRole(id)}>
                  <span className="role-icon"><Icon size={18} /></span><span className="role-text"><strong>{label}</strong><small>{detail}</small></span><span className="role-check">{role === id && <Check size={15} strokeWidth={3} />}</span>
                </button>
              ))}
            </div>
            <button className="primary-btn welcome-btn" onClick={() => setAuthOpen(true)}>Enter dancehut <ArrowRight size={17} /></button>
            <div className="login-options"><button className="login-chip" onClick={() => setAuthOpen(true)}><UserRound size={15} /> Continue with email</button><button className="login-chip" disabled title="Instagram OAuth is not configured yet"><Instagram size={15} /> Instagram (coming soon)</button></div>
            <span className="login-note">Use your email and password to securely access your account.</span>
          </div>
          <div className="welcome-art">
            <div className="art-label label-top">01 — Discover</div>
            <div className="art-card card-back"><div className="art-card-top"><span>UP NEXT</span><span>18 AUG</span></div><div className="art-photo photo-back" /></div>
            <div className="art-card card-front"><div className="art-card-top"><span>THE MOVEMENT HOUSE</span><span>05:30 PM</span></div><div className="art-photo photo-front"><span className="photo-sticker">SUNDAY<br />GROOVE</span></div><div className="art-card-bottom"><strong>Sunday Groove Lab</strong><span>Hip-hop · 8 spots left</span></div></div>
            <div className="art-burst">move<br /><span>with us</span></div>
            <div className="art-label label-bottom">Your city is a stage.</div>
          </div>
        </main>
        <footer className="welcome-footer"><span>Dance classes, reimagined.</span><span>Scroll to explore <ArrowRight size={14} /></span></footer>
        {authOpen && <EmailAuthModal role={role} onClose={() => setAuthOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMenu ? 'open' : ''}`}>
        <div className="sidebar-head"><div className="brand"><span className="brand-mark">D</span><span>dancehut</span></div><button className="close-menu" onClick={() => setShowMenu(false)}><X size={20} /></button></div>
        <div className="profile-mini" onClick={() => setShowProfileModal(true)} role="button" tabIndex={0} title="Manage profile"><div className="avatar">{currentUserInitials}</div><div><strong>{currentUserName}</strong><span>{currentUserRoleBadge}</span></div><ChevronDown size={15} /></div>
        <div className="side-group"><span className="side-label">Workspace</span>{['Discover', 'Calendar', 'My bookings', 'Saved'].map((item, index) => { const icons = [Compass, CalendarDays, Ticket, Heart]; const Icon = icons[index]; return <button className={`side-item ${activeTab === item ? 'active' : ''}`} key={item} onClick={() => { setActiveTab(item); setShowMenu(false); }}><Icon size={19} /><span>{item}</span>{item === 'My bookings' && bookings.length > 0 && <i>{bookings.length}</i>}</button>; })}</div>
        <div className="side-group side-bottom"><span className="side-label">Your space</span><button className="side-item"><MessageCircle size={19} /><span>Messages</span><i className="message-dot" /></button><button className="side-item"><Bell size={19} /><span>Notifications</span></button><button className="side-item" onClick={() => setShowProfileModal(true)}><SlidersHorizontal size={19} /><span>Preferences</span></button><button className="side-item sign-out-item" onClick={() => signOut()}><X size={19} /><span>Sign out</span></button></div>
        <div className="side-footer"><div className="help-card"><span>Need a hand?</span><strong>Talk to our team <ArrowRight size={14} /></strong></div><span className="version">dancehut / 01</span></div>
      </aside>
      <div className="main-area">
        <header className="topbar"><button className="menu-trigger" onClick={() => setShowMenu(true)}><Menu size={22} /></button><div className="mobile-brand"><span className="brand-mark">D</span> dancehut</div><div className="topbar-right"><div className="city-pill"><MapPin size={15} /> Bengaluru <ChevronDown size={14} /></div><button className="icon-btn"><Bell size={19} /></button><div className="avatar avatar-small" onClick={() => setShowProfileModal(true)} role="button" tabIndex={0} title={`Logged in as ${currentUserName}. Click to manage profile.`}>{currentUserInitials}</div></div></header>
        <main className="content">
          {activeTab === 'Discover' ? <>
          <section className="hero-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot pulse" /> Live schedule · Bengaluru · {formattedToday}
              </div>
              <h2>
                {userFirstName ? (
                  <>
                    {greeting}, <em>{userFirstName}.</em><br />
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
                  <span><Clock3 size={14} /> {spotlightEvent.date} · {spotlightEvent.time}</span>
                  <span><MapPin size={14} /> {spotlightEvent.studio} · {spotlightEvent.location}</span>
                  <span>with <strong>{spotlightEvent.host}</strong></span>
                </div>
                <div className="sponsored-actions">
                  <button
                    type="button"
                    className="primary-btn sponsored-book-btn"
                    onClick={() => book(spotlightEvent)}
                    disabled={spotlightEvent.spots <= 0 || bookings.some((b) => b.event_id === spotlightEvent.id)}
                  >
                    {bookings.some((b) => b.event_id === spotlightEvent.id) ? (
                      <>Booked <Check size={16} /></>
                    ) : spotlightEvent.spots <= 0 ? (
                      'Sold out'
                    ) : (
                      <>Book this session · {spotlightEvent.price} <ArrowRight size={16} /></>
                    )}
                  </button>
                  <button
                    type="button"
                    className="sponsored-details-btn"
                    onClick={() => {
                      setBookingError('');
                      setSelectedEvent(spotlightEvent);
                    }}
                  >
                    View details
                  </button>
                </div>
              </div>
              <div
                className="sponsored-banner-right"
                onClick={() => {
                  setBookingError('');
                  setSelectedEvent(spotlightEvent);
                }}
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
            <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
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
          {showFilters && <div className="filters"><label>When<select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option>Any date</option>{events.map((event) => <option key={event.id} value={event.date}>{event.date}</option>)}</select></label><label>Style<select value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)}><option>All styles</option>{styles.map((style) => <option key={style}>{style}</option>)}</select></label><label>Location<select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}><option>All locations</option>{locations.map((location) => <option key={location}>{location}</option>)}</select></label><button className="clear-filter" onClick={() => { setDateFilter('Any date'); setStyleFilter('All styles'); setLocationFilter('All locations'); setShowFilters(false); }}>Clear filters</button></div>}
          <section className="section-head"><div><span className="section-kicker">Picked for you</span><h3>Happening this week</h3></div><button className="text-btn" onClick={() => setActiveTab('Calendar')}>View calendar <ArrowRight size={16} /></button></section>
          {eventsLoading && <div className="data-state"><span className="loader-dot" /> Loading classes from Supabase…</div>}
          {eventsError && <div className="data-error" role="alert">{eventsError}</div>}
            {!eventsLoading && <section className="event-grid">{visibleEvents.map((event) => <EventCard event={event} saved={saved.includes(event.id)} onSave={() => toggleSaved(event.id)} onOpen={() => { setBookingError(''); setSelectedEvent(event); }} key={event.id} />)}</section>}
          {visibleEvents.length === 0 && <div className="empty-state"><Search size={30} /><h3>No dances found</h3><p>Try a different style, studio, or neighbourhood.</p></div>}
          <section className="lower-grid"><div className="studio-banner"><div className="banner-copy"><span className="section-kicker">Meet the community</span><h3>Good energy<br /><em>lives here.</em></h3><p>From first steps to full-out freestyle. Find your people and your pace.</p><button className="light-btn">Explore studios <ArrowRight size={15} /></button></div><div className="banner-art"><div className="circle circle-one" /><div className="circle circle-two" /><div className="banner-figure">✦</div></div></div><div className="next-up"><div className="section-head compact"><div><span className="section-kicker">Your week</span><h3>Next up</h3></div><button className="dots-btn">•••</button></div>{bookedEvent ? <button className="upcoming-item" onClick={() => setShowTicket(true)}><div className="date-block"><strong>18</strong><span>AUG</span></div><div><strong>{bookedEvent.title}</strong><span>{bookedEvent.time} · {bookedEvent.location}</span></div><span className="upcoming-check"><Check size={14} /></span></button> : <div className="empty-upcoming"><CalendarDays size={20} /><span>No bookings yet</span><button onClick={() => setActiveTab('Discover')}>Find a class</button></div>}</div></section>
          </> : <DancerTabView activeTab={activeTab} events={events} saved={saved} bookings={bookings.map((booking) => ({ booking, event: events.find((event) => event.id === booking.event_id) })).filter((item): item is { booking: Booking; event: EventItem } => Boolean(item.event))} onOpenEvent={setSelectedEvent} onToggleSave={toggleSaved} onFindClass={() => setActiveTab('Discover')} onViewTicket={(event, booking) => { setBookedEvent(event); setActiveBooking(booking); setShowTicket(true); }} />}
        </main>
      </div>
      {selectedEvent && <EventModal event={selectedEvent} error={bookingError} alreadyBooked={bookings.some((booking) => booking.event_id === selectedEvent.id)} onClose={() => setSelectedEvent(null)} onBook={() => book(selectedEvent)} />}
      {bookedEvent && showBookingToast && !selectedEvent && <div className="toast"><span className="toast-icon"><Check size={17} /></span><div><strong>You're on the list.</strong><span>{bookedEvent.title} is booked for you.</span></div><button className="view-ticket-toast" onClick={() => setShowTicket(true)}>View ticket</button><button aria-label="Dismiss booking notification" onClick={() => setShowBookingToast(false)}><X size={16} /></button></div>}
      {bookedEvent && showTicket && <TicketModal event={bookedEvent} bookingId={activeBooking?.id ?? null} onClose={() => setShowTicket(false)} />}
      {showProfileModal && session?.user && (
        <ProfileModal
          user={session.user}
          profile={profile}
          activeBookingsCount={bookings.length}
          savedCount={saved.length}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updated) => {
            setProfile(updated);
            setRole(updated.role);
          }}
          onSignOut={() => {
            setShowProfileModal(false);
            signOut();
          }}
        />
      )}
    </div>
  );
}

function EventCard({ event, saved, onSave, onOpen }: { event: EventItem; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <article className="event-card" onClick={onOpen}><div className="event-image"><img src={event.image} alt="" /><div className="image-top"><span className="event-style">{event.style}</span><button onClick={(e) => { e.stopPropagation(); onSave(); }} className={saved ? 'saved' : ''}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div><span className="spots-badge">{event.spots} spots left</span></div><div className="event-info"><div className="event-date">{event.date} <span>·</span> {event.time}</div><h4>{event.title}</h4><p><MapPin size={14} /> {event.studio} · {event.location}</p><div className="event-meta"><span>with <strong>{event.host}</strong></span><strong>{event.price}</strong></div></div></article>;
}

function DancerTabView({ activeTab, events, saved, bookings, onOpenEvent, onToggleSave, onFindClass, onViewTicket }: {
  activeTab: string;
  events: EventItem[];
  saved: number[];
  bookings: { booking: Booking; event: EventItem }[];
  onOpenEvent: (event: EventItem) => void;
  onToggleSave: (id: number) => void;
  onFindClass: () => void;
  onViewTicket: (event: EventItem, booking: Booking) => void;
}) {
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<'AUG' | 'SEP'>('AUG');
  const title = activeTab === 'Calendar' ? 'Your calendar' : activeTab === 'My bookings' ? 'My bookings' : 'Saved events';
  const subtitle = activeTab === 'Calendar' ? 'Keep track of every session you plan to attend.' : activeTab === 'My bookings' ? 'Your upcoming dance sessions in one place.' : 'Classes and workshops you want to come back to.';
  const savedEvents = events.filter((event) => saved.includes(event.id));

  if (activeTab === 'My bookings') {
    return <section className="tab-view"><div className="tab-heading"><span className="section-kicker">Your workspace</span><h2>{title}</h2><p>{subtitle}</p></div>{bookings.length ? <div className="booking-list">{bookings.map(({ booking, event }) => <div className="booking-panel" key={booking.id}><div className="booking-date"><strong>{getDay(event.date)}</strong><span>{getMonth(event.date)}</span></div><div className="booking-copy"><span className="event-style dark-style">{event.style}</span><h3>{event.title}</h3><p>{event.date} · {event.time}</p><p>{event.studio} · {event.location}</p></div><button className="primary-btn" onClick={() => onViewTicket(event, booking)}>View ticket <Ticket size={16} /></button></div>)}</div> : <EmptyTab icon={<Ticket size={28} />} title="No bookings yet" message="Your confirmed classes will appear here." action="Discover classes" onAction={onFindClass} />}</section>;
  }

  if (activeTab === 'Calendar') {
    const selectedDateKey = selectedCalendarDay === null ? null : `${calendarMonth === 'AUG' ? '2026-08' : '2026-09'}-${String(selectedCalendarDay).padStart(2, '0')}`;
    const selectedEvents = selectedDateKey === null ? [] : events.filter((event) => event.dateKey === selectedDateKey);
    const selectedBookings = selectedDateKey === null ? [] : bookings.filter(({ event }) => event.dateKey === selectedDateKey);
    const monthLabel = calendarMonth === 'AUG' ? 'August 2026' : 'September 2026';
    const daysInMonth = calendarMonth === 'AUG' ? 31 : 30;
    return <section className="tab-view"><div className="tab-heading"><span className="section-kicker">Your workspace</span><h2>{title}</h2><p>Select a date to explore classes and your bookings.</p></div><div className="calendar-panel"><div className="calendar-header"><button aria-label="Previous month" onClick={() => { setCalendarMonth('AUG'); setSelectedCalendarDay(null); }}>‹</button><strong>{monthLabel}</strong><button aria-label="Next month" onClick={() => { setCalendarMonth('SEP'); setSelectedCalendarDay(null); }}>›</button></div><div className="calendar-week"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div><div className="calendar-grid">{Array.from({ length: daysInMonth }, (_, index) => { const day = index + 1; const dateKey = `${calendarMonth === 'AUG' ? '2026-08' : '2026-09'}-${String(day).padStart(2, '0')}`; const hasBooking = bookings.some(({ event }) => event.dateKey === dateKey); const hasEvents = events.some((event) => event.dateKey === dateKey); return <button className={`${hasBooking ? 'calendar-day booked' : 'calendar-day'} ${selectedCalendarDay === day ? 'selected' : ''}`} key={day} onClick={() => setSelectedCalendarDay(day)}>{day}{(hasBooking || hasEvents) && <i />}</button>; })}</div><div className="calendar-legend"><span className="legend-dot event-dot" /> Classes available <span className="legend-dot booking-dot" /> Your booking</div></div>{selectedCalendarDay !== null && <div className="calendar-events"><div className="section-head"><div><span className="section-kicker">{monthLabel} · {selectedCalendarDay}</span><h3>{selectedEvents.length ? 'Classes on this day' : 'No classes on this day'}</h3></div></div>{selectedBookings.length > 0 && <div className="date-bookings"><span className="section-kicker">Your bookings</span>{selectedBookings.map(({ event, booking }) => <div className="date-booking" key={booking.id}><div><strong>{event.title}</strong><span>{event.time} · {event.studio}</span></div><button className="text-btn" onClick={() => onViewTicket(event, booking)}>View ticket <Ticket size={15} /></button></div>)}</div>}{selectedEvents.length ? <><span className="section-kicker">Other classes</span><div className="event-grid">{selectedEvents.map((event) => <EventCard event={event} saved={saved.includes(event.id)} onSave={() => onToggleSave(event.id)} onOpen={() => onOpenEvent(event)} key={event.id} />)}</div></> : <EmptyTab icon={<CalendarDays size={28} />} title="No classes found" message="Try another date or return to Discover." action="Browse all classes" onAction={onFindClass} />}</div>}</section>;
  }

  return <section className="tab-view"><div className="tab-heading"><span className="section-kicker">Your workspace</span><h2>{title}</h2><p>{subtitle}</p></div>{savedEvents.length > 0 ? <div className="event-grid">{savedEvents.map((event) => <EventCard event={event} saved onSave={() => onToggleSave(event.id)} onOpen={() => onOpenEvent(event)} key={event.id} />)}</div> : <EmptyTab icon={<Heart size={28} />} title="Nothing saved yet" message="Tap the heart on a class to save it for later." action="Explore classes" onAction={onFindClass} />}</section>;
}

function EmptyTab({ icon, title, message, action, onAction }: { icon: ReactNode; title: string; message: string; action: string; onAction: () => void }) {
  return <div className="tab-empty"><span className="tab-empty-icon">{icon}</span><h3>{title}</h3><p>{message}</p><button className="primary-btn" onClick={onAction}>{action} <ArrowRight size={16} /></button></div>;
}

function getDay(date: string) {
  return Number(date.match(/\d+/)?.[0] ?? 0);
}

function getMonth(date: string) {
  const parts = date.trim().split(/\s+/);
  return parts[parts.length - 1]?.toUpperCase() ?? '';
}

function EmailAuthModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitPasswordAuth = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (authMode === 'sign-up') {
      localStorage.setItem('dancehut.pendingRole', role);
      if (trimmedName) {
        localStorage.setItem('dancehut.pendingDisplayName', trimmedName);
      }
    }

    const result = authMode === 'sign-up'
      ? await signUpWithEmailPassword(normalizedEmail, password, trimmedName, role)
      : await signInWithEmailPassword(normalizedEmail, password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (authMode === 'sign-up' && !result.data.session) {
      setSuccessMessage('Account created. Check your email to confirm your account, then sign in.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close sign in"><X size={18} /></button>
        <span className="auth-kicker">{authMode === 'sign-up' ? 'Create your account' : 'Welcome to dancehut'}</span>
        <h2>{authMode === 'sign-up' ? 'Let’s get you moving.' : 'Welcome back.'}</h2>
        <p>Continue as a {role} with your email address.</p>
        <div className="auth-tabs">
          <button className={authMode === 'sign-in' ? 'active' : ''} onClick={() => setAuthMode('sign-in')} type="button">Sign in</button>
          <button className={authMode === 'sign-up' ? 'active' : ''} onClick={() => setAuthMode('sign-up')} type="button">Sign up</button>
        </div>
        <form onSubmit={submitPasswordAuth}>
          {authMode === 'sign-up' && (
            <label className="auth-field">
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Maya Sharma"
                autoFocus
                required
              />
            </label>
          )}
          <label className="auth-field">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoFocus={authMode === 'sign-in'}
              required
            />
          </label>
          <label className="auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {successMessage && <p className="auth-success" role="status">{successMessage}</p>}
          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : authMode === 'sign-up' ? 'Create account' : 'Sign in'} <ArrowRight size={17} />
          </button>
        </form>
        <span className="auth-legal">Your email and password are securely managed by Supabase.</span>
      </div>
    </div>
  );
}

function TicketModal({ event, bookingId, onClose }: { event: EventItem; bookingId: number | null; onClose: () => void }) {
  const ticketValue = `dancehut:booking:${bookingId ?? event.id}`;
  return <div className="modal-backdrop" onClick={onClose}><div className="ticket-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="ticket-success"><span><Check size={18} /></span><small>BOOKING SUCCESSFUL</small></div><h2>Your spot is saved.</h2><p>Show this ticket at the venue entrance.</p><div className="qr-frame"><QRCodeSVG value={ticketValue} size={146} bgColor="#ffffff" fgColor="#2a2826" level="M" /><div className="qr-corner corner-a" /><div className="qr-corner corner-b" /><div className="qr-corner corner-c" /><div className="qr-corner corner-d" /></div><div className="ticket-details"><div><CalendarDays size={15} /><span><strong>{event.date}</strong>{event.time}</span></div><div><MapPin size={15} /><span><strong>{event.studio}</strong>{event.location}</span></div><div><Sparkles size={15} /><span><strong>{event.title}</strong>with {event.host}</span></div></div><button className="primary-btn book-btn" onClick={onClose}>Done <Check size={17} /></button></div></div>;
}

function EventModal({ event, error, alreadyBooked, onClose, onBook }: { event: EventItem; error: string; alreadyBooked: boolean; onClose: () => void; onBook: () => void }) {
  const soldOut = event.spots <= 0;
  const statusMessage = error || (alreadyBooked ? 'You have already booked this class. You can find it in My bookings.' : soldOut ? 'This class is sold out. Please choose another session.' : '');
  return <div className="modal-backdrop" onClick={onClose}><div className="event-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><img className="modal-image" src={event.image} alt={`${event.title} at ${event.studio}`} /><div className="modal-body"><div className="event-date">{event.date} <span>·</span> {event.time}</div><div className="modal-title-row"><div><span className="event-style dark-style">{event.style}</span><h2>{event.title}</h2></div><span className="modal-price">{event.price}</span></div><div className="details-list"><div><MapPin size={17} /><span><strong>{event.studio}</strong>{event.location}</span></div><div><UserRound size={17} /><span><strong>Hosted by {event.host}</strong>Professional choreographer</span></div><div><Clock3 size={17} /><span><strong>90 minutes</strong>All levels welcome</span></div></div><p className="modal-description">Come as you are. Leave with a new groove. This intimate session is built for good music, clear guidance, and the kind of energy that makes you want to stay for one more song.</p>{statusMessage && <p className="booking-error" role="alert">{statusMessage}</p>}<button className="primary-btn book-btn" onClick={onBook} disabled={soldOut || alreadyBooked}>{alreadyBooked ? 'Already booked' : soldOut ? 'Sold out' : 'Book this session'} {!soldOut && !alreadyBooked && <ArrowRight size={17} />}</button><span className="modal-note"><Ticket size={14} /> Instant confirmation with a QR ticket</span></div></div></div>;
}

function ProfileModal({
  user,
  profile,
  activeBookingsCount,
  savedCount,
  onClose,
  onUpdate,
  onSignOut,
}: {
  user: User;
  profile: UserProfile | null;
  activeBookingsCount: number;
  savedCount: number;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => void;
  onSignOut: () => void;
}) {
  const [displayName, setDisplayName] = useState(
    profile?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || ''
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    profile?.role || (user.user_metadata?.role as UserRole) || 'dancer'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const previewName = displayName.trim() || getDisplayName(profile, user);
  const previewInitials = getInitials(previewName);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    const trimmed = displayName.trim();
    const { data, error: updateErr } = await updateProfile(user.id, {
      display_name: trimmed,
      role: selectedRole,
    });

    setSaving(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    if (data) {
      onUpdate(data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const roleOptions: { id: UserRole; label: string; icon: typeof UserRound }[] = [
    { id: 'dancer', label: 'Dancer', icon: UserRound },
    { id: 'choreographer', label: 'Choreographer', icon: Sparkles },
    { id: 'studio', label: 'Studio', icon: Users },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close profile">
          <X size={18} />
        </button>

        <div className="profile-modal-head">
          <div className="profile-modal-avatar">{previewInitials}</div>
          <div className="profile-modal-meta">
            <h2>{previewName}</h2>
            <span>{user.email}</span>
          </div>
        </div>

        <div className="profile-stats-row">
          <div className="profile-stat-item">
            <strong>{activeBookingsCount}</strong>
            <span>Active Bookings</span>
          </div>
          <div className="profile-stat-item">
            <strong>{savedCount}</strong>
            <span>Saved Classes</span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <label className="auth-field" style={{ marginTop: '12px' }}>
            Full name / Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya Sharma"
              required
            />
          </label>

          <div className="profile-role-picker">
            <span className="profile-role-label">Account Role</span>
            <div className="profile-roles-grid">
              {roleOptions.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`profile-role-btn ${selectedRole === id ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(id)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="auth-field" style={{ marginTop: '16px' }}>
            Email address
            <input
              type="email"
              value={user.email ?? ''}
              disabled
              style={{ background: '#ebe8e1', color: '#6e6963', cursor: 'not-allowed' }}
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">Profile updated successfully!</p>}

          <div className="profile-actions">
            <button className="primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : success ? 'Saved!' : 'Save changes'} {!saving && !success && <Check size={16} />}
            </button>
            <button
              className="profile-signout-btn"
              type="button"
              onClick={onSignOut}
              title="Sign out of your account"
            >
              <X size={15} /> Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
