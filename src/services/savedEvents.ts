import { supabase } from './supabase';

export async function getSavedEventIds(userId: string) {
  const { data, error } = await supabase
    .from('saved_events')
    .select('event_id')
    .eq('user_id', userId);

  return { data: data?.map((row) => Number(row.event_id)) ?? [], error };
}

export async function saveEvent(userId: string, eventId: number) {
  const { error } = await supabase
    .from('saved_events')
    .upsert({ user_id: userId, event_id: eventId }, { onConflict: 'user_id,event_id' });

  return { error };
}

export async function unsaveEvent(userId: string, eventId: number) {
  const { error } = await supabase
    .from('saved_events')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  return { error };
}
