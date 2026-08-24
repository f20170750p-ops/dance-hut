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
import {
  getUserNotifications,
  subscribeToNotifications,
  type NotificationItem,
} from './services/notifications';
import { deleteStudioEvent } from './services/studio';
import { isSupabaseConfigured } from './services/supabase';
import { useClassCountdown } from './hooks/useClassCountdown';

import { WelcomeView } from './components/auth/WelcomeView';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DiscoverTab } from './components/tabs/DiscoverTab';
import { CalendarTab } from './components/tabs/CalendarTab';
import { BookingsTab } from './components/tabs/BookingsTab';
import { SavedTab } from './components/tabs/SavedTab';
import { MessagesTab } from './components/tabs/MessagesTab';
import { NotificationsTab } from './components/tabs/NotificationsTab';
import { StudioOverviewTab } from './components/tabs/StudioOverviewTab';
import { StudioWorkshopsTab } from './components/tabs/StudioWorkshopsTab';
import { StudioProfileTab } from './components/tabs/StudioProfileTab';
import { ChoreoOverviewTab } from './components/tabs/ChoreoOverviewTab';
import { ChoreoWorkshopsTab } from './components/tabs/ChoreoWorkshopsTab';
import { ChoreoProfileTab } from './components/tabs/ChoreoProfileTab';
import { EventModal } from './components/modals/EventModal';
import { TicketModal } from './components/modals/TicketModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { ContactModal } from './components/modals/ContactModal';
import { CreateWorkshopModal } from './components/modals/CreateWorkshopModal';
import { AttendeeRosterModal } from './components/modals/AttendeeRosterModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { StudioBroadcastModal } from './components/modals/StudioBroadcastModal';
import { CitySelectorModal } from './components/modals/CitySelectorModal';

function App() {
  const [role, setRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem('dancehut.activeRole') as UserRole) || 'dancer';
    } catch {
      return 'dancer';
    }
  });
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    try {
      return localStorage.getItem('dancehut.city') || 'Bengaluru';
    } catch {
      return 'Bengaluru';
    }
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const savedRole = localStorage.getItem('dancehut.activeRole');
      return savedRole === 'studio' || savedRole === 'choreographer' ? 'Dashboard' : 'Discover';
    } catch {
      return 'Discover';
    }
  });
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [bookedEvent, setBookedEvent] = useState<EventItem | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingError, setBookingError] = useState('');
  const [showBookingToast, setShowBookingToast] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [incomingToastNotif, setIncomingToastNotif] = useState<NotificationItem | null>(null);

  // Studio Flow Modals & States
  const [showCreateWorkshopModal, setShowCreateWorkshopModal] = useState(false);
  const [selectedRosterEvent, setSelectedRosterEvent] = useState<EventItem | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerTargetEvent, setScannerTargetEvent] = useState<EventItem | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTargetEvent, setBroadcastTargetEvent] = useState<EventItem | null>(null);
  const [studioToastMsg, setStudioToastMsg] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

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
        try {
          localStorage.setItem('dancehut.activeRole', effectiveRole);
        } catch {
          // ignore
        }
        setProfile({
          id: session.user.id,
          role: effectiveRole,
          display_name: effectiveName,
          email: session.user.email ?? null,
        });
      } else {
        setProfile(existingProfile);
        try {
          localStorage.setItem('dancehut.activeRole', existingProfile.role);
        } catch {
          // ignore
        }
      }
    };

    syncUserProfile();
  }, [session, role]);

  const currentUserRole =
    profile?.role ?? (session?.user?.user_metadata?.role as UserRole | undefined) ?? role;
  const currentUserName = useMemo(
    () => getDisplayName(profile, session?.user ?? null, currentUserRole),
    [profile, session?.user, currentUserRole]
  );
  const studioDisplayName = useMemo(
    () => profile?.studio_name || (session?.user?.user_metadata?.studio_name as string | undefined) || currentUserName || 'Dance Studio',
    [profile, session?.user, currentUserName]
  );
  const choreoDisplayName = useMemo(
    () => profile?.choreo_name || (session?.user?.user_metadata?.choreo_name as string | undefined) || currentUserName || 'Choreographer',
    [profile, session?.user, currentUserName]
  );
  const currentUserInitials = useMemo(() => getInitials(currentUserName), [currentUserName]);
  const currentUserRoleBadge = useMemo(() => getRoleBadge(currentUserRole), [currentUserRole]);
  const userFirstName = useMemo(() => {
    if (!currentUserName || currentUserName === 'Dancer') return '';
    return currentUserName.split(' ')[0];
  }, [currentUserName]);

  // Tab synchronization when switching roles
  useEffect(() => {
    try {
      localStorage.setItem('dancehut.activeRole', currentUserRole);
    } catch {
      // ignore
    }

    if (currentUserRole === 'studio') {
      if (['Discover', 'Calendar', 'My bookings', 'Saved', 'My Classes', 'My Portfolio'].includes(activeTab)) {
        setActiveTab('Dashboard');
      }
    } else if (currentUserRole === 'choreographer') {
      if (['Discover', 'Calendar', 'My bookings', 'Saved', 'My Workshops', 'Studio Profile'].includes(activeTab)) {
        setActiveTab('Dashboard');
      }
    } else {
      if (['Dashboard', 'My Workshops', 'Studio Profile', 'My Classes', 'My Portfolio'].includes(activeTab)) {
        setActiveTab('Discover');
      }
    }
  }, [currentUserRole]);

  useEffect(() => {
    if (!session?.user) return;

    setEventsLoading(true);
    Promise.all([
      getEvents(),
      getSavedEventIds(session.user.id),
      getUserBookings(session.user.id),
      getUserNotifications(session.user.id),
    ])
      .then(([eventResult, savedResult, bookingResult, notifResult]) => {
        if (eventResult.error) setEventsError(eventResult.error.message);
        setEvents(eventResult.data);
        if (!savedResult.error) setSaved(savedResult.data);
        if (!notifResult.error) setNotifications(notifResult.data);
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

    const unsubscribeNotifs = subscribeToNotifications(session.user.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setIncomingToastNotif(newNotif);
      setTimeout(() => {
        setIncomingToastNotif((current) => (current?.id === newNotif.id ? null : current));
      }, 5000);
    });

    return () => {
      unsubscribeNotifs();
    };
  }, [session]);

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    try {
      localStorage.setItem('dancehut.city', cityName);
    } catch {
      // ignore
    }
  };

  const handleNavigateHome = () => {
    setActiveTab('Discover');
    setShowMenu(false);
  };

  const handleOpenNotifications = () => {
    setActiveTab('Notifications');
    setShowMenu(false);
  };

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

  const handleEventCreated = (newEvent: EventItem) => {
    setEvents((prev) => [newEvent, ...prev]);
    setStudioToastMsg(`Workshop "${newEvent.title}" published successfully!`);
    setTimeout(() => setStudioToastMsg(null), 4000);
  };

  const handleDeleteWorkshop = async (eventId: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      await deleteStudioEvent(eventId);
    } catch (err) {
      console.warn('Error deleting studio event:', err);
    }
    setStudioToastMsg('Workshop has been cancelled and removed.');
    setTimeout(() => setStudioToastMsg(null), 4000);
  };

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

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const bookingsWithEvents = useMemo(() => {
    return bookings
      .map((booking) => ({
        booking,
        event: events.find((event) => event.id === booking.event_id),
      }))
      .filter((item): item is { booking: Booking; event: EventItem } => Boolean(item.event));
  }, [bookings, events]);

  const { nextEvent: countdownEvent, nextBooking, timeLabel: countdownLabel, phase: countdownPhase } = useClassCountdown(bookings, events);

  if (authLoading) {
    return <div className="auth-loading">Loading dancehut…</div>;
  }

  if (!session) {
    return <WelcomeView role={role} setRole={setRole} />;
  }

  const isStudio = currentUserRole === 'studio';
  const isChoreo = currentUserRole === 'choreographer';
  const isDancer = !isStudio && !isChoreo;

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
        currentUserRole={currentUserRole}
        bookingsCount={bookings.length}
        studioEventsCount={events.length}
        unreadMessagesCount={1}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenCreateWorkshop={() => setShowCreateWorkshopModal(true)}
        onOpenScanner={() => {
          setScannerTargetEvent(null);
          setShowQRScanner(true);
        }}
        onOpenBroadcast={() => {
          setBroadcastTargetEvent(null);
          setShowBroadcastModal(true);
        }}
        onNavigateHome={handleNavigateHome}
        onOpenContact={() => setShowContactModal(true)}
        onSignOut={() => signOut()}
      />

      <div className="main-area">
        <Topbar
          setShowMenu={setShowMenu}
          currentUserName={currentUserName}
          currentUserInitials={currentUserInitials}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenNotifications={handleOpenNotifications}
          unreadNotificationsCount={unreadNotificationsCount}
          onNavigateHome={handleNavigateHome}
          selectedCity={selectedCity}
          onOpenCitySelector={() => setShowCitySelector(true)}
        />

        <main className="content">
          {/* Universal Discover Tab (accessible to dancer, studio & choreographer) */}
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
              countdownPhase={countdownPhase}
              countdownLabel={countdownLabel}
              countdownEvent={countdownEvent}
              countdownBookingId={nextBooking?.id ?? null}
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

          {isDancer && activeTab === 'Calendar' && (
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

          {isDancer && activeTab === 'My bookings' && (
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

          {isDancer && activeTab === 'Saved' && (
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

          {/* Studio Tabs */}
          {isStudio && activeTab === 'Dashboard' && (
            <StudioOverviewTab
              studioName={studioDisplayName}
              events={events}
              bookings={bookings}
              onOpenCreateWorkshop={() => setShowCreateWorkshopModal(true)}
              onOpenRoster={(ev) => setSelectedRosterEvent(ev)}
              onOpenScanner={(ev) => {
                setScannerTargetEvent(ev || null);
                setShowQRScanner(true);
              }}
              onOpenBroadcast={(ev) => {
                setBroadcastTargetEvent(ev || null);
                setShowBroadcastModal(true);
              }}
              onNavigateTab={setActiveTab}
            />
          )}

          {isStudio && activeTab === 'My Workshops' && (
            <StudioWorkshopsTab
              events={events}
              onOpenCreateWorkshop={() => setShowCreateWorkshopModal(true)}
              onOpenRoster={(ev) => setSelectedRosterEvent(ev)}
              onOpenScanner={(ev) => {
                setScannerTargetEvent(ev);
                setShowQRScanner(true);
              }}
              onOpenBroadcast={(ev) => {
                setBroadcastTargetEvent(ev);
                setShowBroadcastModal(true);
              }}
              onDeleteWorkshop={handleDeleteWorkshop}
            />
          )}

          {isStudio && activeTab === 'Studio Profile' && (
            <StudioProfileTab
              profile={profile}
              onUpdateProfile={(updated) => {
                setProfile(updated);
                setRole(updated.role);
              }}
            />
          )}

          {/* Choreographer Tabs */}
          {isChoreo && activeTab === 'Dashboard' && (
            <ChoreoOverviewTab
              choreoName={choreoDisplayName}
              events={events}
              onOpenCreateWorkshop={() => setShowCreateWorkshopModal(true)}
              onOpenRoster={(ev) => setSelectedRosterEvent(ev)}
              onOpenBroadcast={(ev) => {
                setBroadcastTargetEvent(ev || null);
                setShowBroadcastModal(true);
              }}
              onNavigateTab={setActiveTab}
            />
          )}

          {isChoreo && activeTab === 'My Classes' && (
            <ChoreoWorkshopsTab
              events={events}
              onOpenCreateWorkshop={() => setShowCreateWorkshopModal(true)}
              onOpenRoster={(ev) => setSelectedRosterEvent(ev)}
              onOpenBroadcast={(ev) => {
                setBroadcastTargetEvent(ev);
                setShowBroadcastModal(true);
              }}
              onDeleteWorkshop={handleDeleteWorkshop}
            />
          )}

          {isChoreo && activeTab === 'My Portfolio' && (
            <ChoreoProfileTab
              userId={session?.user?.id || 'choreo-user'}
              currentUserName={choreoDisplayName}
              onProfileUpdated={(newName) => {
                if (profile) setProfile({ ...profile, choreo_name: newName, display_name: newName });
              }}
            />
          )}

          {/* Shared Space Tabs */}
          {activeTab === 'Messages' && (
            <MessagesTab
              currentUserId={session?.user?.id || 'current-user'}
              currentUserName={currentUserName}
              selectedConversationId={activeConversationId}
              onSelectConversation={(id) => setActiveConversationId(id)}
              onFindClass={() => setActiveTab(isStudio || isChoreo ? 'Dashboard' : 'Discover')}
            />
          )}

          {activeTab === 'Notifications' && (
            <NotificationsTab
              currentUserId={session?.user?.id || 'current-user'}
              notifications={notifications}
              setNotifications={setNotifications}
              events={events}
              bookings={bookings}
              saved={saved}
              onOpenEvent={(event) => {
                setBookingError('');
                setSelectedEvent(event);
              }}
              onViewTicket={(event, booking) => {
                setBookedEvent(event);
                setActiveBooking(booking);
                setShowTicket(true);
              }}
              onMessageHost={handleMessageHost}
              onFindClass={() => setActiveTab(isStudio || isChoreo ? 'Dashboard' : 'Discover')}
            />
          )}
        </main>
      </div>

      {/* Dancer Modals */}
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

      {bookedEvent && showTicket && (
        <TicketModal
          event={bookedEvent}
          bookingId={activeBooking?.id ?? null}
          onClose={() => setShowTicket(false)}
        />
      )}

      {/* Studio & Choreographer Flow Modals */}
      {showCreateWorkshopModal && (
        <CreateWorkshopModal
          studioName={isStudio ? studioDisplayName : choreoDisplayName}
          creatorRole={currentUserRole}
          onClose={() => setShowCreateWorkshopModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}

      {selectedRosterEvent && (
        <AttendeeRosterModal
          event={selectedRosterEvent}
          onClose={() => setSelectedRosterEvent(null)}
          onOpenScanner={(ev) => {
            setSelectedRosterEvent(null);
            setScannerTargetEvent(ev);
            setShowQRScanner(true);
          }}
          onOpenBroadcast={(ev) => {
            setSelectedRosterEvent(null);
            setBroadcastTargetEvent(ev);
            setShowBroadcastModal(true);
          }}
        />
      )}

      {showQRScanner && (
        <QRScannerModal
          activeEvent={scannerTargetEvent}
          onClose={() => setShowQRScanner(false)}
          onCheckInSuccess={(attendee) => {
            setStudioToastMsg(`Check-in verified for ${attendee.userName}!`);
            setTimeout(() => setStudioToastMsg(null), 4000);
          }}
        />
      )}

      {showBroadcastModal && (
        <StudioBroadcastModal
          events={events}
          creatorRole={currentUserRole}
          preselectedEvent={broadcastTargetEvent}
          onClose={() => setShowBroadcastModal(false)}
          onBroadcastSent={(_eventId, count) => {
            setStudioToastMsg(`Broadcast sent to ${count} dancers.`);
            setTimeout(() => setStudioToastMsg(null), 4000);
          }}
        />
      )}

      {/* Studio Toast Notification */}
      {studioToastMsg && (
        <div className="toast studio-toast">
          <span className="toast-icon">
            <Check size={17} />
          </span>
          <div>
            <strong>Studio Portal Alert</strong>
            <span>{studioToastMsg}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss toast"
            onClick={() => setStudioToastMsg(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Incoming Real-time Notification Toast */}
      {incomingToastNotif && (
        <div className="toast notif-toast">
          <span className="toast-icon notif-toast-icon">
            <Check size={17} />
          </span>
          <div>
            <strong>{incomingToastNotif.title}</strong>
            <span>{incomingToastNotif.message}</span>
          </div>
          <button
            type="button"
            className="view-ticket-toast"
            onClick={() => {
              setActiveTab('Notifications');
              setIncomingToastNotif(null);
            }}
          >
            View Feed
          </button>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setIncomingToastNotif(null)}
          >
            <X size={16} />
          </button>
        </div>
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
          onNavigateTab={setActiveTab}
          onSignOut={() => {
            setShowProfileModal(false);
            signOut();
          }}
        />
      )}

      {showCitySelector && (
        <CitySelectorModal
          currentCity={selectedCity}
          onSelectCity={handleSelectCity}
          onClose={() => setShowCitySelector(false)}
        />
      )}

      {showContactModal && (
        <ContactModal
          currentUserEmail={session?.user?.email ?? null}
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}

export default App;

