import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  QrCode,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  X,
} from 'lucide-react';

type Role = 'dancer' | 'choreographer' | 'studio';
type EventItem = {
  id: number;
  title: string;
  style: string;
  date: string;
  time: string;
  location: string;
  studio: string;
  host: string;
  price: string;
  spots: number;
  image: string;
  featured?: boolean;
};

const events: EventItem[] = [
  { id: 1, title: 'Sunday Groove Lab', style: 'Hip-hop', date: 'Sun, 18 Aug', time: '5:30 PM', location: 'Koramangala', studio: 'The Movement House', host: 'Maya Joseph', price: '₹850', spots: 8, image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=900', featured: true },
  { id: 2, title: 'Heels & Harmony', style: 'Heels', date: 'Sat, 24 Aug', time: '7:00 PM', location: 'Indiranagar', studio: 'Sway Studio', host: 'Rhea Kapoor', price: '₹1,200', spots: 4, image: 'https://images.pexels.com/photos/4667680/pexels-photo-4667680.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 3, title: 'Afro Beats Social', style: 'Afro', date: 'Sun, 25 Aug', time: '4:00 PM', location: 'HSR Layout', studio: 'Adaa Dance Co.', host: 'Kofi Mensah', price: '₹700', spots: 12, image: 'https://images.pexels.com/photos/1677710/pexels-photo-1677710.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 4, title: 'Contemporary Reset', style: 'Contemporary', date: 'Wed, 28 Aug', time: '6:30 PM', location: 'Whitefield', studio: 'The Attic Studio', host: 'Ishita Rao', price: '₹900', spots: 10, image: 'https://images.pexels.com/photos/3764150/pexels-photo-3764150.jpeg?auto=compress&cs=tinysrgb&w=900' },
];

const roles: { id: Role; label: string; detail: string; icon: typeof UserRound }[] = [
  { id: 'dancer', label: 'I’m a dancer', detail: 'Discover classes & book your next session', icon: UserRound },
  { id: 'choreographer', label: 'I’m a choreographer', detail: 'Find studios & manage your schedule', icon: Sparkles },
  { id: 'studio', label: 'I run a studio', detail: 'Fill classes & grow your community', icon: Users },
];

function App() {
  const [role, setRole] = useState<Role>('dancer');
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState('Discover');
  const [query, setQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [bookedEvent, setBookedEvent] = useState<EventItem | null>(null);
  const [saved, setSaved] = useState<number[]>([2]);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  const visibleEvents = useMemo(() => events.filter((event) =>
    [event.title, event.style, event.location, event.studio, event.host].join(' ').toLowerCase().includes(query.toLowerCase())
  ), [query]);

  const book = (event: EventItem) => {
    setBookedEvent(event);
    setSelectedEvent(null);
  };

  if (!onboarded) {
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
            <button className="primary-btn welcome-btn" onClick={() => setOnboarded(true)}>Enter dancehut <ArrowRight size={17} /></button>
            <div className="login-options"><button className="login-chip"><Instagram size={15} /> Continue with Instagram</button><button className="login-chip"><Phone size={15} /> Continue with phone</button></div>
            <span className="login-note">No password needed. We'll send a one-time code.</span>
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
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMenu ? 'open' : ''}`}>
        <div className="sidebar-head"><div className="brand"><span className="brand-mark">D</span><span>dancehut</span></div><button className="close-menu" onClick={() => setShowMenu(false)}><X size={20} /></button></div>
        <div className="profile-mini"><div className="avatar">AK</div><div><strong>Aria Kapoor</strong><span>Dance explorer</span></div><ChevronDown size={15} /></div>
        <div className="side-group"><span className="side-label">Workspace</span>{['Discover', 'Calendar', 'My bookings', 'Saved'].map((item, index) => { const icons = [Compass, CalendarDays, Ticket, Heart]; const Icon = icons[index]; return <button className={`side-item ${activeTab === item ? 'active' : ''}`} key={item} onClick={() => { setActiveTab(item); setShowMenu(false); }}><Icon size={19} /><span>{item}</span>{item === 'My bookings' && bookedEvent && <i>1</i>}</button>; })}</div>
        <div className="side-group side-bottom"><span className="side-label">Your space</span><button className="side-item"><MessageCircle size={19} /><span>Messages</span><i className="message-dot" /></button><button className="side-item"><Bell size={19} /><span>Notifications</span></button><button className="side-item"><SlidersHorizontal size={19} /><span>Preferences</span></button></div>
        <div className="side-footer"><div className="help-card"><span>Need a hand?</span><strong>Talk to our team <ArrowRight size={14} /></strong></div><span className="version">dancehut / 01</span></div>
      </aside>
      <div className="main-area">
        <header className="topbar"><button className="menu-trigger" onClick={() => setShowMenu(true)}><Menu size={22} /></button><div className="mobile-brand"><span className="brand-mark">D</span> dancehut</div><div className="topbar-right"><div className="city-pill"><MapPin size={15} /> Bengaluru <ChevronDown size={14} /></div><button className="icon-btn"><Bell size={19} /></button><div className="avatar avatar-small">AK</div></div></header>
        <main className="content">
          <section className="hero-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> Tuesday, 13 August 2024</div><h2>Make room for<br /><em>something new.</em></h2><p className="hero-sub">The best dance experiences in Bengaluru,<br className="desktop-only" /> curated for your kind of movement.</p></div><div className="hero-aside"><div className="stat-card"><strong>24</strong><span>sessions this week</span></div><div className="sparkline"><span /><span /><span /><span /><span /><span /><span /></div></div></section>
          <section className="search-row"><div className="search-box"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a style, class, studio or choreographer" /></div><button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={18} /> <span>Filters</span></button></section>
          {showFilters && <div className="filters"><span>When</span><button>Any day <ChevronDown size={14} /></button><span>Style</span><button>All styles <ChevronDown size={14} /></button><span>Level</span><button>Any level <ChevronDown size={14} /></button><button className="clear-filter" onClick={() => setShowFilters(false)}>Done</button></div>}
          <section className="section-head"><div><span className="section-kicker">Picked for you</span><h3>Happening this week</h3></div><button className="text-btn">View calendar <ArrowRight size={16} /></button></section>
          <section className="event-grid">{visibleEvents.slice(0, 3).map((event) => <EventCard event={event} saved={saved.includes(event.id)} onSave={() => setSaved(saved.includes(event.id) ? saved.filter((id) => id !== event.id) : [...saved, event.id])} onOpen={() => setSelectedEvent(event)} key={event.id} />)}</section>
          {visibleEvents.length === 0 && <div className="empty-state"><Search size={30} /><h3>No dances found</h3><p>Try a different style, studio, or neighbourhood.</p></div>}
          <section className="lower-grid"><div className="studio-banner"><div className="banner-copy"><span className="section-kicker">Meet the community</span><h3>Good energy<br /><em>lives here.</em></h3><p>From first steps to full-out freestyle. Find your people and your pace.</p><button className="light-btn">Explore studios <ArrowRight size={15} /></button></div><div className="banner-art"><div className="circle circle-one" /><div className="circle circle-two" /><div className="banner-figure">✦</div></div></div><div className="next-up"><div className="section-head compact"><div><span className="section-kicker">Your week</span><h3>Next up</h3></div><button className="dots-btn">•••</button></div>{bookedEvent ? <button className="upcoming-item" onClick={() => setShowTicket(true)}><div className="date-block"><strong>18</strong><span>AUG</span></div><div><strong>{bookedEvent.title}</strong><span>{bookedEvent.time} · {bookedEvent.location}</span></div><span className="upcoming-check"><Check size={14} /></span></button> : <div className="empty-upcoming"><CalendarDays size={20} /><span>No bookings yet</span><button onClick={() => setActiveTab('Discover')}>Find a class</button></div>}</div></section>
        </main>
      </div>
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onBook={() => book(selectedEvent)} />}
      {bookedEvent && !selectedEvent && <div className="toast"><span className="toast-icon"><Check size={17} /></span><div><strong>You're on the list.</strong><span>{bookedEvent.title} is booked for you.</span></div><button className="view-ticket-toast" onClick={() => setShowTicket(true)}>View ticket</button><button onClick={() => setBookedEvent(null)}><X size={16} /></button></div>}
      {bookedEvent && showTicket && <TicketModal event={bookedEvent} onClose={() => setShowTicket(false)} />}
    </div>
  );
}

function EventCard({ event, saved, onSave, onOpen }: { event: EventItem; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <article className="event-card" onClick={onOpen}><div className="event-image"><img src={event.image} alt="" /><div className="image-top"><span className="event-style">{event.style}</span><button onClick={(e) => { e.stopPropagation(); onSave(); }} className={saved ? 'saved' : ''}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button></div><span className="spots-badge">{event.spots} spots left</span></div><div className="event-info"><div className="event-date">{event.date} <span>·</span> {event.time}</div><h4>{event.title}</h4><p><MapPin size={14} /> {event.studio} · {event.location}</p><div className="event-meta"><span>with <strong>{event.host}</strong></span><strong>{event.price}</strong></div></div></article>;
}

function TicketModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="ticket-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="ticket-success"><span><Check size={18} /></span><small>BOOKING SUCCESSFUL</small></div><h2>Your spot is saved.</h2><p>Show this ticket at the venue entrance.</p><div className="qr-frame"><QrCode size={146} strokeWidth={1.4} /><div className="qr-corner corner-a" /><div className="qr-corner corner-b" /><div className="qr-corner corner-c" /><div className="qr-corner corner-d" /></div><div className="ticket-details"><div><CalendarDays size={15} /><span><strong>{event.date}</strong>{event.time}</span></div><div><MapPin size={15} /><span><strong>{event.studio}</strong>{event.location}</span></div><div><Sparkles size={15} /><span><strong>{event.title}</strong>with {event.host}</span></div></div><button className="primary-btn book-btn" onClick={onClose}>Done <Check size={17} /></button></div></div>;
}

function EventModal({ event, onClose, onBook }: { event: EventItem; onClose: () => void; onBook: () => void }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="event-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><img className="modal-image" src={event.image} alt="" /><div className="modal-body"><div className="event-date">{event.date} <span>·</span> {event.time}</div><div className="modal-title-row"><div><span className="event-style dark-style">{event.style}</span><h2>{event.title}</h2></div><span className="modal-price">{event.price}</span></div><div className="details-list"><div><MapPin size={17} /><span><strong>{event.studio}</strong>{event.location}</span></div><div><UserRound size={17} /><span><strong>Hosted by {event.host}</strong>Professional choreographer</span></div><div><Clock3 size={17} /><span><strong>90 minutes</strong>All levels welcome</span></div></div><p className="modal-description">Come as you are. Leave with a new groove. This intimate session is built for good music, clear guidance, and the kind of energy that makes you want to stay for one more song.</p><button className="primary-btn book-btn" onClick={onBook}>Book this session <ArrowRight size={17} /></button><span className="modal-note"><Ticket size={14} /> Instant confirmation with a QR ticket</span></div></div></div>;
}

export default App;
