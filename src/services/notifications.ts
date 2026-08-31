import { supabase, isSupabaseConfigured } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { EventItem } from './events';

export type NotificationType =
  | 'location_change'
  | 'time_change'
  | 'event_update'
  | 'booking_confirmed'
  | 'announcement'
  | 'reminder';

export interface NotificationItem {
  id: string;
  userId: string;
  eventId?: number | null;
  eventTitle?: string | null;
  eventStudio?: string | null;
  eventDate?: string | null;
  eventHost?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: {
    oldLocation?: string;
    newLocation?: string;
    oldTime?: string;
    newTime?: string;
    reason?: string;
    [key: string]: any;
  } | null;
  read: boolean;
  createdAt: string;
}

const LOCAL_NOTIFICATIONS_KEY = 'dancehut_local_notifications';

// Initial seed notifications showcasing event changes, confirmations, and announcements
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'seed-notif-1',
    userId: 'default-user',
    eventId: 1,
    eventTitle: 'Afro House Grooves',
    eventStudio: 'Studio 21, Indiranagar',
    eventDate: 'Sun, 24 Aug',
    eventHost: 'Aria Kapoor',
    type: 'location_change',
    title: 'Studio Room Change',
    message: 'Indiranagar studio room moved to Studio Hall B (2nd floor) due to larger attendance. Please check in at reception.',
    metadata: {
      oldLocation: 'Studio Hall A',
      newLocation: 'Studio Hall B (2nd Floor, Main Wing)',
      reason: 'Upgraded room for better floor space and air conditioning',
    },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20m ago
  },
  {
    id: 'seed-notif-2',
    userId: 'default-user',
    eventId: 2,
    eventTitle: 'Contemporary Flow & Floorwork',
    eventStudio: 'Attakkalari, Wilson Garden',
    eventDate: 'Mon, 25 Aug',
    eventHost: 'Rohan Verma',
    type: 'time_change',
    title: 'Warm-up Timing Shift',
    message: 'Instructor Rohan Verma will begin guided warm-ups 15 minutes early at 6:15 PM.',
    metadata: {
      oldTime: '6:30 PM - 8:00 PM',
      newTime: '6:15 PM Warmup / 6:30 PM Class',
    },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(), // ~2h ago
  },
  {
    id: 'seed-notif-3',
    userId: 'default-user',
    eventId: 1,
    eventTitle: 'Afro House Grooves',
    eventStudio: 'Studio 21, Indiranagar',
    eventDate: 'Sun, 24 Aug',
    eventHost: 'Aria Kapoor',
    type: 'booking_confirmed',
    title: 'Booking Confirmed 🎉',
    message: 'Your spot is locked in! Have your digital pass ready at the entry desk.',
    metadata: {},
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'seed-notif-4',
    userId: 'default-user',
    eventId: 3,
    eventTitle: 'Street Jazz Foundations',
    eventStudio: 'The Bohemian House, Richmond Road',
    eventDate: 'Wed, 27 Aug',
    eventHost: 'Maya & DanceHut Crew',
    type: 'announcement',
    title: 'Playlist & Prep Guide Released',
    message: 'The official pre-class vibe playlist and recommended attire guide are now live. Tap to review before class!',
    metadata: {},
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

function saveStoredNotifications(notifs: NotificationItem[]) {
  try {
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (err) {
    console.error('Error saving notifications to localStorage:', err);
  }
}

/**
 * Fetch all notifications for a given user
 */
export async function getUserNotifications(userId: string): Promise<{ data: NotificationItem[]; error: any }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          user_id,
          event_id,
          type,
          title,
          message,
          metadata,
          read,
          created_at,
          events (
            title,
            studio,
            date,
            host
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: NotificationItem[] = data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          eventId: item.event_id,
          eventTitle: item.events?.title ?? null,
          eventStudio: item.events?.studio ?? null,
          eventDate: item.events?.date ?? null,
          eventHost: item.events?.host ?? null,
          type: item.type as NotificationType,
          title: item.title,
          message: item.message,
          metadata: item.metadata ?? null,
          read: item.read,
          createdAt: item.created_at,
        }));
        return { data: formatted, error: null };
      }
    } catch (err) {
      console.warn('Supabase notifications fetch fallback to local:', err);
    }
  }

  const local = getStoredNotifications();
  // Filter for this user or default demo user
  const userNotifs = local.filter((n) => n.userId === userId || n.userId === 'default-user');
  return { data: userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), error: null };
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<{ error: any }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      if (!error) {
        // Also update local cache
        const local = getStoredNotifications().map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        saveStoredNotifications(local);
        return { error: null };
      }
    } catch {
      // ignore
    }
  }

  const local = getStoredNotifications().map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveStoredNotifications(local);
  return { error: null };
}

/**
 * Mark a single notification as unread
 */
export async function markNotificationAsUnread(notificationId: string): Promise<{ error: any }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', notificationId);
      if (!error) {
        const local = getStoredNotifications().map((n) =>
          n.id === notificationId ? { ...n, read: false } : n
        );
        saveStoredNotifications(local);
        return { error: null };
      }
    } catch {
      // ignore
    }
  }

  const local = getStoredNotifications().map((n) =>
    n.id === notificationId ? { ...n, read: false } : n
  );
  saveStoredNotifications(local);
  return { error: null };
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<{ error: any }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
      if (!error) {
        const local = getStoredNotifications().map((n) =>
          n.userId === userId || n.userId === 'default-user' ? { ...n, read: true } : n
        );
        saveStoredNotifications(local);
        return { error: null };
      }
    } catch {
      // ignore
    }
  }

  const local = getStoredNotifications().map((n) =>
    n.userId === userId || n.userId === 'default-user' ? { ...n, read: true } : n
  );
  saveStoredNotifications(local);
  return { error: null };
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<{ error: any }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (!error) {
        const local = getStoredNotifications().filter((n) => n.id !== notificationId);
        saveStoredNotifications(local);
        return { error: null };
      }
    } catch {
      // ignore
    }
  }

  const local = getStoredNotifications().filter((n) => n.id !== notificationId);
  saveStoredNotifications(local);
  return { error: null };
}

/**
 * Clear all notifications for a user
 */
export async function clearAllNotifications(userId: string): Promise<{ error: any }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
      if (!error) {
        const local = getStoredNotifications().filter(
          (n) => n.userId !== userId && n.userId !== 'default-user'
        );
        saveStoredNotifications(local);
        return { error: null };
      }
    } catch {
      // ignore
    }
  }

  const local = getStoredNotifications().filter(
    (n) => n.userId !== userId && n.userId !== 'default-user'
  );
  saveStoredNotifications(local);
  return { error: null };
}

/**
 * Broadcast an event notification to all users enrolled, saved, or chatting about the event!
 */
export async function broadcastEventUpdate(
  eventId: number,
  payload: {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    targetEvent?: EventItem | null;
    currentUserId?: string;
  }
): Promise<{ recipientCount: number; error: any }> {
  let recipientUserIds: string[] = [];

  if (isSupabaseConfigured) {
    try {
      // Try the database stored procedure first
      const { data, error } = await supabase.rpc('notify_event_audience', {
        p_event_id: eventId,
        p_type: payload.type,
        p_title: payload.title,
        p_message: payload.message,
        p_metadata: payload.metadata || {},
      });

      if (!error && typeof data === 'number') {
        return { recipientCount: data, error: null };
      }
    } catch {
      // stored procedure might not be created yet, gather users via client queries
    }

    try {
      // Collect booked users
      const { data: bookedRows } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('event_id', eventId)
        .neq('status', 'cancelled');
      
      // Collect saved users
      const { data: savedRows } = await supabase
        .from('saved_events')
        .select('user_id')
        .eq('event_id', eventId);

      // Collect conversation users
      const { data: convRows } = await supabase
        .from('conversations')
        .select('participant_1, participant_2')
        .eq('event_id', eventId);

      const idSet = new Set<string>();
      bookedRows?.forEach((r) => idSet.add(r.user_id));
      savedRows?.forEach((r) => idSet.add(r.user_id));
      convRows?.forEach((r) => {
        if (r.participant_1) idSet.add(r.participant_1);
        if (r.participant_2) idSet.add(r.participant_2);
      });

      if (payload.currentUserId) {
        idSet.add(payload.currentUserId);
      }

      recipientUserIds = Array.from(idSet);

      if (recipientUserIds.length > 0) {
        const rowsToInsert = recipientUserIds.map((uid) => ({
          user_id: uid,
          event_id: eventId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          metadata: payload.metadata || {},
          read: false,
        }));

        await supabase.from('notifications').insert(rowsToInsert);
      }
    } catch (err) {
      console.warn('Fallback error during broadcast audience resolution:', err);
    }
  }

  // Create local notification item for instantaneous UI feedback
  const newNotifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const localItem: NotificationItem = {
    id: newNotifId,
    userId: payload.currentUserId || 'default-user',
    eventId,
    eventTitle: payload.targetEvent?.title || 'Workshop Session',
    eventStudio: payload.targetEvent?.studio || 'Studio Partner',
    eventDate: payload.targetEvent?.date || 'Upcoming',
    eventHost: payload.targetEvent?.host || 'Instructor',
    type: payload.type,
    title: payload.title,
    message: payload.message,
    metadata: payload.metadata || null,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const currentLocal = getStoredNotifications();
  saveStoredNotifications([localItem, ...currentLocal]);

  return {
    recipientCount: Math.max(1, recipientUserIds.length),
    error: null,
  };
}

/**
 * Subscribe to realtime notifications for the active user
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notif: NotificationItem) => void
): () => void {
  if (!isSupabaseConfigured) return () => {};

  const channel: RealtimeChannel = supabase
    .channel(`public:notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new as any;
        const newNotif: NotificationItem = {
          id: row.id,
          userId: row.user_id,
          eventId: row.event_id,
          type: row.type,
          title: row.title,
          message: row.message,
          metadata: row.metadata ?? null,
          read: row.read ?? false,
          createdAt: row.created_at,
        };
        onNotification(newNotif);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
