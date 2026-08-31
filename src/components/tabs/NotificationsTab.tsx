import { useState, useMemo } from 'react';
import {
  Bell,
  BellRing,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  Info,
  MapPin,
  Megaphone,
  MessageCircle,
  Radio,
  Send,
  Sparkles,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import type { NotificationItem, NotificationType } from '../../services/notifications';
import {
  broadcastEventUpdate,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
  clearAllNotifications,
} from '../../services/notifications';
import type { EventItem } from '../../services/events';
import type { Booking } from '../../services/bookings';

import type { UserRole } from '../../services/auth';

interface NotificationsTabProps {
  currentUserId: string;
  currentRole?: UserRole;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  events: EventItem[];
  bookings: Booking[];
  saved: number[];
  onOpenEvent: (event: EventItem) => void;
  onViewTicket: (event: EventItem, booking: Booking) => void;
  onMessageHost: (event: EventItem) => void;
  onFindClass: () => void;
}

type FilterCategory = 'all' | 'unread' | 'updates' | 'bookings' | 'announcements';

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 45) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(
      new Date(isoString)
    );
  } catch {
    return 'Recently';
  }
}

export function NotificationsTab({
  currentUserId,
  currentRole,
  notifications,
  setNotifications,
  events,
  bookings,
  saved,
  onOpenEvent,
  onViewTicket,
  onMessageHost,
  onFindClass,
}: NotificationsTabProps) {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBroadcaster, setShowBroadcaster] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<{ count: number; title: string } | null>(
    null
  );

  const selectableEvents = useMemo(() => {
    if (currentRole === 'dancer') {
      const bookedEventIds = new Set(bookings.map((b) => b.event_id));
      const userBooked = events.filter((e) => bookedEventIds.has(e.id));
      return userBooked.length > 0 ? userBooked : events;
    }
    return events;
  }, [currentRole, bookings, events]);

  // Broadcaster form state
  const [selectedEventId, setSelectedEventId] = useState<number>(
    selectableEvents[0]?.id ?? events[0]?.id ?? 1
  );
  const [broadcastType, setBroadcastType] = useState<NotificationType>('location_change');
  const [customTitle, setCustomTitle] = useState('Studio Venue Update');
  const [customMessage, setCustomMessage] = useState(
    'Class location updated to Studio Hall B (2nd Floor). Please check in at main reception.'
  );
  const [oldValue, setOldValue] = useState('Main Floor Room 1');
  const [newValue, setNewValue] = useState('Studio Hall B (2nd Floor)');
  const [broadcasting, setBroadcasting] = useState(false);

  const selectedTargetEvent = useMemo(
    () => selectableEvents.find((e) => e.id === Number(selectedEventId)) || selectableEvents[0] || events[0],
    [selectableEvents, selectedEventId, events]
  );

  // Sync default form values when changing broadcast type
  const handleTypeSelect = (type: NotificationType) => {
    setBroadcastType(type);
    if (type === 'location_change') {
      setCustomTitle('Studio Venue & Hall Update');
      setOldValue(selectedTargetEvent?.location || 'Studio Hall A');
      setNewValue('Studio Hall B (Main Floor, 2nd Wing)');
      setCustomMessage(
        `Venue for "${selectedTargetEvent?.title || 'Workshop'}" has been updated. Please arrive 10 minutes early.`
      );
    } else if (type === 'time_change') {
      setCustomTitle('Schedule & Timing Adjusted');
      setOldValue(selectedTargetEvent?.time || '6:30 PM - 8:00 PM');
      setNewValue('6:15 PM Warmup / 6:30 PM Class');
      setCustomMessage(
        `Class session starts with guided warmup at ${newValue || '6:15 PM'}. Don't miss it!`
      );
    } else {
      setCustomTitle('Instructor Announcement');
      setOldValue('');
      setNewValue('');
      setCustomMessage(
        `Special notice for "${selectedTargetEvent?.title || 'Class'}": bring clean footwear and water bottles.`
      );
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetEvent) return;
    setBroadcasting(true);

    const metadata: Record<string, any> = {};
    if (broadcastType === 'location_change') {
      metadata.oldLocation = oldValue;
      metadata.newLocation = newValue;
    } else if (broadcastType === 'time_change') {
      metadata.oldTime = oldValue;
      metadata.newTime = newValue;
    }

    const res = await broadcastEventUpdate(selectedTargetEvent.id, {
      type: broadcastType,
      title: customTitle,
      message: customMessage,
      metadata,
      targetEvent: selectedTargetEvent,
      currentUserId,
    });

    setBroadcasting(false);
    setShowBroadcaster(false);
    setBroadcastSuccess({
      count: res.recipientCount,
      title: customTitle,
    });

    // Refresh notifications list locally
    const newNotifItem: NotificationItem = {
      id: `live-${Date.now()}`,
      userId: currentUserId,
      eventId: selectedTargetEvent.id,
      eventTitle: selectedTargetEvent.title,
      eventStudio: selectedTargetEvent.studio,
      eventDate: selectedTargetEvent.date,
      eventHost: selectedTargetEvent.host,
      type: broadcastType,
      title: customTitle,
      message: customMessage,
      metadata,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotifItem, ...prev]);

    setTimeout(() => {
      setBroadcastSuccess(null);
    }, 6000);
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationAsRead(id);
  };

  const handleMarkAsUnread = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
    await markNotificationAsUnread(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead(currentUserId);
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
  };

  const handleClearAll = async () => {
    setNotifications([]);
    await clearAllNotifications(currentUserId);
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.eventTitle && n.eventTitle.toLowerCase().includes(q)) ||
          (n.eventStudio && n.eventStudio.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Tab Category filter
      if (filter === 'unread') return !n.read;
      if (filter === 'updates')
        return n.type === 'location_change' || n.type === 'time_change' || n.type === 'event_update';
      if (filter === 'bookings') return n.type === 'booking_confirmed';
      if (filter === 'announcements')
        return n.type === 'announcement' || n.type === 'reminder';
      return true;
    });
  }, [notifications, filter, searchQuery]);

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'location_change':
        return {
          label: 'Venue Changed',
          icon: MapPin,
          className: 'badge-location',
        };
      case 'time_change':
        return {
          label: 'Time Shift',
          icon: Clock,
          className: 'badge-time',
        };
      case 'booking_confirmed':
        return {
          label: 'Booking Confirmed',
          icon: Ticket,
          className: 'badge-booking',
        };
      case 'announcement':
        return {
          label: 'Announcement',
          icon: Megaphone,
          className: 'badge-announcement',
        };
      case 'reminder':
        return {
          label: 'Class Reminder',
          icon: BellRing,
          className: 'badge-reminder',
        };
      default:
        return {
          label: 'Event Update',
          icon: Info,
          className: 'badge-default',
        };
    }
  };

  return (
    <div className="tab-view notifications-view">
      <div className="notifications-header-wrapper">
        <div className="tab-heading">
          <div className="eyebrow">
            <span className="eyebrow-dot pulse" />
            Your space / Activity Feed
          </div>
          <h2>
            Stay in the <em>loop</em>
          </h2>
          <p>
            Real-time notifications for your booked classes, saved choreographies, venue changes, and instructor broadcasts.
          </p>
        </div>

        <div className="notif-header-actions">
          <button
            type="button"
            className={`broadcast-toggle-btn ${showBroadcaster ? 'active' : ''}`}
            onClick={() => setShowBroadcaster(!showBroadcaster)}
            title="Simulate broadcasting an event change to all registered & saved dancers"
          >
            <Radio size={15} />
            <span>{showBroadcaster ? 'Close Broadcaster' : 'Broadcast Event Change'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-btn"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={15} />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              className="clear-all-btn"
              onClick={handleClearAll}
              title="Clear notification feed"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Simulator Panel */}
      {showBroadcaster && (
        <div className="broadcast-panel">
          <div className="broadcast-header">
            <div className="broadcast-title-group">
              <span className="broadcast-tag">
                <Sparkles size={13} /> Organizer / Host Tool
              </span>
              <h3>Broadcast Event Change to Audience</h3>
              <p>
                Simulate updating an event. A live notification is automatically dispatched to all users who <strong>booked</strong>, <strong>saved</strong>, or <strong>inquired</strong> about this event.
              </p>
            </div>
            <button
              type="button"
              className="broadcast-close-btn"
              onClick={() => setShowBroadcaster(false)}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSendBroadcast} className="broadcast-form">
            <div className="broadcast-grid">
              <div className="broadcast-field">
                <label>Target Event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedEventId(id);
                    const target = selectableEvents.find((ev) => ev.id === id);
                    if (target && broadcastType === 'location_change') {
                      setOldValue(target.location);
                    } else if (target && broadcastType === 'time_change') {
                      setOldValue(target.time);
                    }
                  }}
                >
                  {selectableEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} • {ev.studio} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="broadcast-field">
                <label>Update Type</label>
                <div className="type-buttons">
                  <button
                    type="button"
                    className={`type-btn ${broadcastType === 'location_change' ? 'active' : ''}`}
                    onClick={() => handleTypeSelect('location_change')}
                  >
                    <MapPin size={14} /> Location Change
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${broadcastType === 'time_change' ? 'active' : ''}`}
                    onClick={() => handleTypeSelect('time_change')}
                  >
                    <Clock size={14} /> Time Shift
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${broadcastType === 'announcement' ? 'active' : ''}`}
                    onClick={() => handleTypeSelect('announcement')}
                  >
                    <Megaphone size={14} /> Announcement
                  </button>
                </div>
              </div>
            </div>

            {(broadcastType === 'location_change' || broadcastType === 'time_change') && (
              <div className="broadcast-diff-inputs">
                <div className="broadcast-field">
                  <label>{broadcastType === 'location_change' ? 'Previous Venue / Room' : 'Previous Time'}</label>
                  <input
                    type="text"
                    value={oldValue}
                    onChange={(e) => setOldValue(e.target.value)}
                    placeholder="e.g. Studio Hall A"
                    required
                  />
                </div>
                <div className="broadcast-field">
                  <label>{broadcastType === 'location_change' ? 'New Venue / Room' : 'New Time'}</label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. Studio Hall B (2nd Floor)"
                    required
                  />
                </div>
              </div>
            )}

            <div className="broadcast-field">
              <label>Notification Headline</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Notification Title"
                required
              />
            </div>

            <div className="broadcast-field">
              <label>Detailed Message for Dancers</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={2}
                placeholder="Explain the update, parking instructions, or footwear guidelines..."
                required
              />
            </div>

            <div className="broadcast-actions">
              <div className="broadcast-summary-note">
                <Info size={14} />
                <span>
                  Will notify attendees of <strong>{selectedTargetEvent?.title}</strong> in real-time.
                </span>
              </div>
              <button
                type="submit"
                className="primary-btn broadcast-submit-btn"
                disabled={broadcasting}
              >
                <Send size={15} />
                {broadcasting ? 'Broadcasting...' : 'Broadcast to All Related Dancers'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast Success Banner */}
      {broadcastSuccess && (
        <div className="broadcast-alert-banner">
          <div className="alert-badge">
            <Check size={16} />
          </div>
          <div>
            <strong>Broadcast Dispatched!</strong>
            <span>
              "{broadcastSuccess.title}" sent to <strong>{broadcastSuccess.count}</strong> enrolled, saved, and inquiring dancer(s).
            </span>
          </div>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={() => setBroadcastSuccess(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="notif-controls-bar">
        <div className="notif-filter-chips">
          <button
            type="button"
            className={`notif-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span>All</span>
            <em>{notifications.length}</em>
          </button>

          <button
            type="button"
            className={`notif-chip ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            <span>Unread</span>
            {unreadCount > 0 && <i className="unread-pill">{unreadCount}</i>}
          </button>

          <button
            type="button"
            className={`notif-chip ${filter === 'updates' ? 'active' : ''}`}
            onClick={() => setFilter('updates')}
          >
            <MapPin size={13} />
            <span>Venue & Schedule</span>
          </button>

          <button
            type="button"
            className={`notif-chip ${filter === 'bookings' ? 'active' : ''}`}
            onClick={() => setFilter('bookings')}
          >
            <Ticket size={13} />
            <span>Bookings</span>
          </button>

          <button
            type="button"
            className={`notif-chip ${filter === 'announcements' ? 'active' : ''}`}
            onClick={() => setFilter('announcements')}
          >
            <Megaphone size={13} />
            <span>Announcements</span>
          </button>
        </div>

        <div className="notif-search-box">
          <input
            type="text"
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Notification Cards Feed */}
      <div className="notifications-feed">
        {filteredNotifications.length === 0 ? (
          <div className="tab-empty">
            <div className="tab-empty-icon">
              <Bell size={28} />
            </div>
            <h3>No notifications found</h3>
            <p>
              {filter === 'unread'
                ? "You're all caught up! No unread updates at the moment."
                : filter === 'updates'
                ? 'No venue or schedule changes have been posted yet.'
                : 'Whenever your instructors or studios change a class detail, you will see it here.'}
            </p>
            <button type="button" className="primary-btn" onClick={onFindClass}>
              Explore upcoming classes
            </button>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getTypeBadge(notif.type);
            const BadgeIcon = badge.icon;
            const matchedEvent = events.find((e) => e.id === notif.eventId);
            const targetEvent: EventItem | undefined =
              matchedEvent ||
              (notif.eventTitle && notif.eventHost
                ? {
                    id: notif.eventId || 0,
                    title: notif.eventTitle,
                    style: 'Open Style',
                    dateKey: '',
                    date: notif.eventDate || 'Upcoming',
                    time: '',
                    location: notif.eventStudio || '',
                    studio: notif.eventStudio || 'Studio Partner',
                    host: notif.eventHost,
                    price: '₹0',
                    spots: 25,
                    image: '',
                    featured: false,
                  }
                : undefined);
            const userBooking = bookings.find((b) => b.event_id === notif.eventId);
            const isSaved = notif.eventId ? saved.includes(notif.eventId) : false;

            return (
              <div
                key={notif.id}
                className={`notif-card ${!notif.read ? 'unread' : 'read'}`}
              >
                {!notif.read && <div className="notif-dot-indicator" />}

                <div className="notif-card-header">
                  <div className="notif-badge-group">
                    <span className={`notif-badge ${badge.className}`}>
                      <BadgeIcon size={12} />
                      {badge.label}
                    </span>

                    {notif.eventTitle && (
                      <span
                        className="notif-event-tag"
                        onClick={() => targetEvent && onOpenEvent(targetEvent)}
                        title="Click to view event"
                      >
                        <Calendar size={11} />
                        {notif.eventTitle}
                      </span>
                    )}
                  </div>

                  <div className="notif-header-right">
                    <span className="notif-timestamp">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                    <button
                      type="button"
                      className="notif-delete-btn"
                      onClick={() => handleDelete(notif.id)}
                      title="Dismiss notification"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="notif-card-body">
                  <h4 className="notif-title">{notif.title}</h4>
                  <p className="notif-message">{notif.message}</p>

                  {/* Visual Diff Box for Location/Time Changes */}
                  {notif.metadata &&
                    (notif.metadata.oldLocation ||
                      notif.metadata.newLocation ||
                      notif.metadata.oldTime ||
                      notif.metadata.newTime) && (
                      <div className="notif-diff-box">
                        <div className="diff-col old-val">
                          <span className="diff-label">PREVIOUS</span>
                          <strong>
                            {notif.metadata.oldLocation || notif.metadata.oldTime}
                          </strong>
                        </div>
                        <div className="diff-arrow">➔</div>
                        <div className="diff-col new-val">
                          <span className="diff-label">UPDATED</span>
                          <strong>
                            {notif.metadata.newLocation || notif.metadata.newTime}
                          </strong>
                        </div>
                      </div>
                    )}
                </div>

                {/* Card Actions Footer */}
                <div className="notif-card-footer">
                  <div className="notif-actions-left">
                    {targetEvent && (
                      <button
                        type="button"
                        className="notif-action-btn primary-action"
                        onClick={() => onOpenEvent(targetEvent)}
                      >
                        <span>View Class Details</span>
                        <ExternalLink size={12} />
                      </button>
                    )}

                    {userBooking && targetEvent && (
                      <button
                        type="button"
                        className="notif-action-btn ticket-action"
                        onClick={() => onViewTicket(targetEvent, userBooking)}
                      >
                        <Ticket size={12} />
                        <span>View Pass</span>
                      </button>
                    )}

                    {targetEvent && (
                      <button
                        type="button"
                        className="notif-action-btn chat-action"
                        onClick={() => onMessageHost(targetEvent)}
                      >
                        <MessageCircle size={12} />
                        <span>Message Host</span>
                      </button>
                    )}
                  </div>

                  <div className="notif-actions-right">
                    {!notif.read ? (
                      <button
                        type="button"
                        className="notif-read-toggle"
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Mark as read"
                      >
                        <Check size={13} />
                        <span>Mark read</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="notif-read-toggle is-read"
                        onClick={() => handleMarkAsUnread(notif.id)}
                        title="Mark as unread"
                      >
                        <Bell size={13} />
                        <span>Mark unread</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
