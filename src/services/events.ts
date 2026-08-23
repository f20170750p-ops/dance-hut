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

  const events = (data as EventRow[] | null)?.map((event) => ({ ...event, dateKey: event.date, date: formatEventDate(event.date) })) ?? [];
  
  // MOCK DATA FOR TESTING
  const now = new Date();
  const mockStartTime = new Date(now.getTime() + 10 * 60000); // 10 minutes from now
  const ampm = mockStartTime.getHours() >= 12 ? 'PM' : 'AM';
  const hours = mockStartTime.getHours() % 12 || 12;
  const mins = String(mockStartTime.getMinutes()).padStart(2, '0');
  
  events.push({
    id: 9999,
    title: 'MOCK: QR Check-in Test Class',
    style: 'Hip Hop',
    dateKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    date: formatEventDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`),
    time: `${hours}:${mins} ${ampm}`,
    location: 'Indiranagar',
    studio: 'Mock Studio',
    host: 'Jane Doe',
    price: '900',
    spots: 5,
    image: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=900',
    featured: true
  });

  return {
    data: events,
    error,
  };
}
