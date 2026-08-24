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
