import { supabase } from './supabase';

export type Booking = {
  id: number;
  event_id: number;
  status: 'booked' | 'cancelled' | 'attended';
  qr_code: string | null;
  created_at: string;
};

export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, event_id, status, qr_code, created_at')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  const bookings = (data as Booking[] | null) ?? [];

  // MOCK DATA FOR TESTING
  bookings.push({
    id: 9999,
    event_id: 9999,
    status: 'booked',
    qr_code: null,
    created_at: new Date().toISOString()
  });

  return { data: bookings, error };
}

export async function createBooking(userId: string, eventId: number) {
  const { data, error } = await supabase.rpc('book_event', {
    p_user_id: userId,
    p_event_id: eventId,
  });

  if (error) return { data: null, error };
  const booking = Array.isArray(data) ? data[0] : data;
  return { data: booking as Booking, error: null };
}

export async function cancelBooking(userId: string, bookingId: number) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', userId);

  return { error };
}
