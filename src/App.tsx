import { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import {
  getDisplayName,
  getInitials,
  getProfile,
  getRoleBadge,
  getSession,
  onAuthStateChange,
  saveProfile,
  signOut,
  type UserProfile,
  type UserRole,
} from './services/auth';
import { createBooking, getUserBookings, type Booking } from './services/bookings';
import { getEvents, type EventItem } from './services/events';
import { getSavedEventIds, saveEvent, unsaveEvent } from './services/savedEvents';
import { startOrGetInstructorChat } from './services/messages';
import { isSupabaseConfigured } from './services/supabase';

import { WelcomeView } from './components/auth/WelcomeView';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DiscoverTab } from './components/tabs/DiscoverTab';
import { CalendarTab } from './components/tabs/CalendarTab';
import { BookingsTab } from './components/tabs/BookingsTab';
import { SavedTab } from './components/tabs/SavedTab';
import { MessagesTab } from './components/tabs/MessagesTab';
import { EventModal } from './components/modals/EventModal';
import { TicketModal } from './components/modals/TicketModal';
import { ProfileModal } from './components/modals/ProfileModal';

function App() {
  const [role, setRole] = useState<UserRole>('dancer');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [activeTab, setActiveTab] = useState('Discover');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [bookedEvent, setBookedEvent] = useState<EventItem | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingError, setBookingError] = useState('');
  const [showBookingToast, setShowBookingToast] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
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
      const pendingRole = localStorage.getItem('dancehut.pendingRole') as UserRole | null;
      const pendingName = localStorage.getItem('dancehut.pendingDisplayName');
      const { data: existingProfile } = await getProfile(session.user.id);

      const effectiveRole = (pendingRole ||
        existingProfile?.role ||
        (session.user.user_metadata?.role as UserRole | undefined) ||
        role) as UserRole;
      const effectiveName =
        pendingName ||
        existingProfile?.display_name ||
        (session.user.user_metadata?.display_name as string | undefined) ||
        null;

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
    Promise.all([
      getEvents(),
      getSavedEventIds(session.user.id),
      getUserBookings(session.user.id),
    ])
      .then(([eventResult, savedResult, bookingResult]) => {
        if (eventResult.error) setEventsError(eventResult.error.message);
        setEvents(eventResult.data);
        if (!savedResult.error) setSaved(savedResult.data);
        if (!bookingResult.error) {
          const latestBooking = bookingResult.data[0] ?? null;
          setBookings(bookingResult.data);
          setActiveBooking(latestBooking);
          setBookedEvent(
            latestBooking
              ? eventResult.data.find((event) => event.id === latestBooking.event_id) ?? null
              : null
          );
        }
      })
      .catch((error: Error) => setEventsError(error.message))
      .finally(() => setEventsLoading(false));
  }, [session]);

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
      setBookingError(
        error.message.includes('already')
          ? 'You have already booked this class. You can find it in My bookings.'
          : error.message.includes('sold out')
          ? 'This class is sold out. Please choose another session.'
          : error.message
      );
      return;
    }

    setBookings((currentBookings) => (data ? [data, ...currentBookings] : currentBookings));
    setActiveBooking(data);
    setBookedEvent(event);
    setShowBookingToast(true);
    setSelectedEvent(null);
    setEvents((currentEvents) =>
      currentEvents.map((item) =>
        item.id === event.id ? { ...item, spots: Math.max(0, item.spots - 1) } : item
      )
    );
  };

  const toggleSaved = async (eventId: number) => {
    if (!session?.user) return;
    const wasSaved = saved.includes(eventId);
    setSaved((currentSaved) =>
      wasSaved ? currentSaved.filter((id) => id !== eventId) : [...currentSaved, eventId]
    );
    const result = wasSaved
      ? await unsaveEvent(session.user.id, eventId)
      : await saveEvent(session.user.id, eventId);
    if (result.error) {
      setSaved((currentSaved) =>
        wasSaved ? [...currentSaved, eventId] : currentSaved.filter((id) => id !== eventId)
      );
      setEventsError(result.error.message);
    }
  };

  const handleMessageHost = async (event: EventItem) => {
    setSelectedEvent(null);
    if (session?.user) {
      const { conversation } = await startOrGetInstructorChat(
        session.user.id,
        event.host,
        event.id,
        event.title,
        event.studio
      );
      setActiveConversationId(conversation.id);
    }
    setActiveTab('Messages');
  };

  const currentUserName = useMemo(
    () => getDisplayName(profile, session?.user ?? null),
    [profile, session?.user]
  );
  const currentUserInitials = useMemo(() => getInitials(currentUserName), [currentUserName]);
  const currentUserRole =
    profile?.role ?? (session?.user?.user_metadata?.role as UserRole | undefined) ?? role;
  const currentUserRoleBadge = useMemo(() => getRoleBadge(currentUserRole), [currentUserRole]);
  const userFirstName = useMemo(() => {
    if (!currentUserName || currentUserName === 'Dancer') return '';
    return currentUserName.split(' ')[0];
  }, [currentUserName]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const bookingsWithEvents = useMemo(() => {
    return bookings
      .map((booking) => ({
        booking,
        event: events.find((event) => event.id === booking.event_id),
      }))
      .filter((item): item is { booking: Booking; event: EventItem } => Boolean(item.event));
  }, [bookings, events]);

  if (authLoading) {
    return <div className="auth-loading">Loading dancehut…</div>;
  }

  if (!session) {
    return <WelcomeView role={role} setRole={setRole} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUserName={currentUserName}
        currentUserInitials={currentUserInitials}
        currentUserRoleBadge={currentUserRoleBadge}
        bookingsCount={bookings.length}
        unreadMessagesCount={1}
        onOpenProfile={() => setShowProfileModal(true)}
        onSignOut={() => signOut()}
      />

      <div className="main-area">
        <Topbar
          setShowMenu={setShowMenu}
          currentUserName={currentUserName}
          currentUserInitials={currentUserInitials}
          onOpenProfile={() => setShowProfileModal(true)}
        />

        <main className="content">
          {activeTab === 'Discover' && (
            <DiscoverTab
              events={events}
              eventsLoading={eventsLoading}
              eventsError={eventsError}
              saved={saved}
              bookings={bookings}
              bookedEvent={bookedEvent}
              userFirstName={userFirstName}
              greeting={greeting}
              formattedToday={formattedToday}
              onBook={book}
              onToggleSave={toggleSaved}
              onOpenEvent={(event) => {
                setBookingError('');
                setSelectedEvent(event);
              }}
              onViewTicket={() => setShowTicket(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'Calendar' && (
            <CalendarTab
              events={events}
              saved={saved}
              bookings={bookingsWithEvents}
              onOpenEvent={(event) => {
                setBookingError('');
                setSelectedEvent(event);
              }}
              onToggleSave={toggleSaved}
              onFindClass={() => setActiveTab('Discover')}
              onViewTicket={(event, booking) => {
                setBookedEvent(event);
                setActiveBooking(booking);
                setShowTicket(true);
              }}
            />
          )}

          {activeTab === 'My bookings' && (
            <BookingsTab
              bookings={bookingsWithEvents}
              onViewTicket={(event, booking) => {
                setBookedEvent(event);
                setActiveBooking(booking);
                setShowTicket(true);
              }}
              onFindClass={() => setActiveTab('Discover')}
            />
          )}

          {activeTab === 'Saved' && (
            <SavedTab
              events={events}
              saved={saved}
              onOpenEvent={(event) => {
                setBookingError('');
                setSelectedEvent(event);
              }}
              onToggleSave={toggleSaved}
              onFindClass={() => setActiveTab('Discover')}
            />
          )}

          {activeTab === 'Messages' && (
            <MessagesTab
              currentUserId={session?.user?.id || 'current-user'}
              currentUserName={currentUserName}
              selectedConversationId={activeConversationId}
              onSelectConversation={(id) => setActiveConversationId(id)}
              onFindClass={() => setActiveTab('Discover')}
            />
          )}
        </main>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          error={bookingError}
          alreadyBooked={bookings.some((booking) => booking.event_id === selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
          onBook={() => book(selectedEvent)}
          onMessageHost={handleMessageHost}
        />
      )}

      {bookedEvent && showBookingToast && !selectedEvent && (
        <div className="toast">
          <span className="toast-icon">
            <Check size={17} />
          </span>
          <div>
            <strong>You're on the list.</strong>
            <span>{bookedEvent.title} is booked for you.</span>
          </div>
          <button
            type="button"
            className="view-ticket-toast"
            onClick={() => setShowTicket(true)}
          >
            View ticket
          </button>
          <button
            type="button"
            aria-label="Dismiss booking notification"
            onClick={() => setShowBookingToast(false)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {bookedEvent && showTicket && (
        <TicketModal
          event={bookedEvent}
          bookingId={activeBooking?.id ?? null}
          onClose={() => setShowTicket(false)}
        />
      )}

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

export default App;
