import { supabase } from './supabase';

export type EventItem = {
  id: number;
  title: string;
  style: string;
  dateKey: string;
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

type EventRow = Omit<EventItem, 'dateKey' | 'date'> & { date: string };

export const MAX_BOOKING_ADVANCE_DAYS = 30;

export function getBookingStatus(eventDateKeyOrStr?: string): {
  isAdvanceRestricted: boolean;
  daysUntilEvent: number;
  message?: string;
} {
  if (!eventDateKeyOrStr) return { isAdvanceRestricted: false, daysUntilEvent: 0 };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let eventDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(eventDateKeyOrStr)) {
      eventDate = new Date(`${eventDateKeyOrStr}T00:00:00`);
    } else {
      eventDate = new Date(eventDateKeyOrStr);
    }

    if (isNaN(eventDate.getTime())) {
      return { isAdvanceRestricted: false, daysUntilEvent: 0 };
    }

    const diffTime = eventDate.getTime() - today.getTime();
    const daysUntilEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntilEvent > MAX_BOOKING_ADVANCE_DAYS) {
      const daysUntilOpen = daysUntilEvent - MAX_BOOKING_ADVANCE_DAYS;
      return {
        isAdvanceRestricted: true,
        daysUntilEvent,
        message: `Bookings open 30 days prior (in ${daysUntilOpen} day${daysUntilOpen === 1 ? '' : 's'})`,
      };
    }

    return { isAdvanceRestricted: false, daysUntilEvent };
  } catch {
    return { isAdvanceRestricted: false, daysUntilEvent: 0 };
  }
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
    .format(new Date(`${date}T00:00:00`));
}

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, style, date, time, location, studio, host, price, spots, image, featured')
    .order('date', { ascending: true });

  let events = (data as EventRow[] | null)?.map((event) => ({ ...event, dateKey: event.date, date: formatEventDate(event.date) })) ?? [];

  // Merge any created custom events
  try {
    const customEvents: EventItem[] = JSON.parse(localStorage.getItem('dancehut.customEvents') || '[]');
    if (customEvents.length > 0) {
      const existingIds = new Set(events.map((e) => e.id));
      for (const custom of customEvents) {
        if (!existingIds.has(custom.id)) {
          events.unshift(custom);
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    data: events,
    error,
  };
}

export async function deleteEvent(eventId: number): Promise<{ error: any }> {
  try {
    const existingCustom = JSON.parse(localStorage.getItem('dancehut.customEvents') || '[]');
    const filtered = existingCustom.filter((e: any) => e.id !== eventId);
    localStorage.setItem('dancehut.customEvents', JSON.stringify(filtered));
  } catch {
    // ignore
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  return { error };
}

