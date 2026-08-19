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

  return {
    data: (data as EventRow[] | null)?.map((event) => ({ ...event, dateKey: event.date, date: formatEventDate(event.date) })) ?? [],
    error,
  };
}
