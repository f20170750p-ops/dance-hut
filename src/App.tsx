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
import type { Session } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { getSession, onAuthStateChange, saveProfile, signInWithEmailPassword, signOut, signUpWithEmailPassword } from './services/auth';
import { createBooking, getUserBookings, type Booking } from './services/bookings';
import { getEvents, type EventItem } from './services/events';
import { getSavedEventIds, saveEvent, unsaveEvent } from './services/savedEvents';
import { isSupabaseConfigured } from './services/supabase';

type Role = 'dancer' | 'choreographer' | 'studio';
const roles: { id: Role; label: string; detail: string; icon: typeof UserRound }[] = [
  { id: 'dancer', label: 'I’m a dancer', detail: 'Discover classes & book your next session', icon: UserRound },
  { id: 'choreographer', label: 'I’m a choreographer', detail: 'Find studios & manage your schedule', icon: Sparkles },
  { id: 'studio', label: 'I run a studio', detail: 'Fill classes & grow your community', icon: Users },
];

function App() {
  const [role, setRole] = useState<Role>('dancer');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
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
    if (!session?.user) return;

    const pendingRole = localStorage.getItem('dancehut.pendingRole') as Role | null;
    if (!pendingRole) return;

    saveProfile(session.user.id, pendingRole, session.user.email ?? '').then(({ error }) => {
      if (!error) localStorage.removeItem('dancehut.pendingRole');
    });
  }, [session]);

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
        <div className="profile-mini"><div className="avatar">AK</div><div><strong>Aria Kapoor</strong><span>Dance explorer</span></div><ChevronDown size={15} /></div>
        <div className="side-group"><span className="side-label">Workspace</span>{['Discover', 'Calendar', 'My bookings', 'Saved'].map((item, index) => { const icons = [Compass, CalendarDays, Ticket, Heart]; const Icon = icons[index]; return <button className={`side-item ${activeTab === item ? 'active' : ''}`} key={item} onClick={() => { setActiveTab(item); setShowMenu(false); }}><Icon size={19} /><span>{item}</span>{item === 'My bookings' && bookings.length > 0 && <i>{bookings.length}</i>}</button>; })}</div>
        <div className="side-group side-bottom"><span className="side-label">Your space</span><button className="side-item"><MessageCircle size={19} /><span>Messages</span><i className="message-dot" /></button><button className="side-item"><Bell size={19} /><span>Notifications</span></button><button className="side-item"><SlidersHorizontal size={19} /><span>Preferences</span></button><button className="side-item sign-out-item" onClick={() => signOut()}><X size={19} /><span>Sign out</span></button></div>
        <div className="side-footer"><div className="help-card"><span>Need a hand?</span><strong>Talk to our team <ArrowRight size={14} /></strong></div><span className="version">dancehut / 01</span></div>
      </aside>
      <div className="main-area">
        <header className="topbar"><button className="menu-trigger" onClick={() => setShowMenu(true)}><Menu size={22} /></button><div className="mobile-brand"><span className="brand-mark">D</span> dancehut</div><div className="topbar-right"><div className="city-pill"><MapPin size={15} /> Bengaluru <ChevronDown size={14} /></div><button className="icon-btn"><Bell size={19} /></button><div className="avatar avatar-small">AK</div></div></header>
        <main className="content">
          {activeTab === 'Discover' ? <>
          <section className="hero-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> Tuesday, 13 August 2024</div><h2>Make room for<br /><em>something new.</em></h2><p className="hero-sub">The best dance experiences in Bengaluru,<br className="desktop-only" /> curated for your kind of movement.</p></div><div className="hero-aside"><div className="stat-card"><strong>24</strong><span>sessions this week</span></div><div className="sparkline"><span /><span /><span /><span /><span /><span /><span /></div></div></section>
          <section className="search-row"><div className="search-box"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a style, class, studio or choreographer" /></div><button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={18} /> <span>Filters</span></button></section>
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
    localStorage.setItem('dancehut.pendingRole', role);
    const result = authMode === 'sign-up'
      ? await signUpWithEmailPassword(normalizedEmail, password)
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
        <div className="auth-tabs"><button className={authMode === 'sign-in' ? 'active' : ''} onClick={() => setAuthMode('sign-in')} type="button">Sign in</button><button className={authMode === 'sign-up' ? 'active' : ''} onClick={() => setAuthMode('sign-up')} type="button">Sign up</button></div>
        <form onSubmit={submitPasswordAuth}>
          <label className="auth-field">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoFocus required /></label>
          <label className="auth-field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {successMessage && <p className="auth-success" role="status">{successMessage}</p>}
          <button className="primary-btn auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : authMode === 'sign-up' ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button>
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

export default App;
