import { useEffect, useMemo, useState } from 'react';
import type { EventItem } from '../services/events';
import type { Booking } from '../services/bookings';

export type CountdownPhase = 'countdown' | 'checkin' | 'in-progress' | 'done' | 'none';

interface CountdownState {
  nextEvent: EventItem | null;
  nextBooking: Booking | null;
  timeLabel: string;
  phase: CountdownPhase;
  isQRWindowActive: boolean;
}

const CLASS_DURATION_MS = 90 * 60 * 1000; // 90 minutes
const CHECKIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes before

function parseEventDateTime(event: EventItem): Date | null {
  try {
    // event.dateKey is like "2026-08-23", event.time is like "5:30 PM" or "05:30 PM"
    const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const date = new Date(`${event.dateKey}T00:00:00`);
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch {
    return null;
  }
}

function formatTimeUntil(ms: number): string {
  if (ms <= 0) return 'Starting now';

  const totalMinutes = Math.ceil(ms / 60000);

  if (totalMinutes < 1) return 'Under a minute';
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function computeState(
  bookedEvents: { event: EventItem; booking: Booking }[],
): CountdownState {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Filter to today's booked events, sorted by start time
  const todayBooked = bookedEvents
    .filter(({ event }) => event.dateKey === todayKey)
    .map(({ event, booking }) => ({
      event,
      booking,
      startTime: parseEventDateTime(event),
    }))
    .filter((item): item is { event: EventItem; booking: Booking; startTime: Date } =>
      item.startTime !== null
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  for (const { event, booking, startTime } of todayBooked) {
    const msUntilStart = startTime.getTime() - now.getTime();
    const endTime = startTime.getTime() + CLASS_DURATION_MS;
    const msUntilEnd = endTime - now.getTime();

    // Class already ended
    if (msUntilEnd <= 0) continue;

    // Class in progress (past start, before end)
    if (msUntilStart <= 0) {
      return {
        nextEvent: event,
        nextBooking: booking,
        timeLabel: 'In progress',
        phase: 'in-progress',
        isQRWindowActive: true,
      };
    }

    // Within 15 min check-in window
    if (msUntilStart <= CHECKIN_WINDOW_MS) {
      return {
        nextEvent: event,
        nextBooking: booking,
        timeLabel: `Starts in ${formatTimeUntil(msUntilStart)}`,
        phase: 'checkin',
        isQRWindowActive: true,
      };
    }

    // Future class today — countdown
    return {
      nextEvent: event,
      nextBooking: booking,
      timeLabel: formatTimeUntil(msUntilStart),
      phase: 'countdown',
      isQRWindowActive: false,
    };
  }

  // No active/upcoming booked classes today
  return {
    nextEvent: null,
    nextBooking: null,
    timeLabel: '',
    phase: 'none',
    isQRWindowActive: false,
  };
}

export function useClassCountdown(
  bookings: Booking[],
  events: EventItem[],
): CountdownState {
  const bookedEvents = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'booked')
      .map((booking) => ({
        booking,
        event: events.find((e) => e.id === booking.event_id),
      }))
      .filter(
        (item): item is { booking: Booking; event: EventItem } => item.event !== undefined
      );
  }, [bookings, events]);

  const [state, setState] = useState<CountdownState>(() => computeState(bookedEvents));

  useEffect(() => {
    setState(computeState(bookedEvents));

    // Determine tick interval: 1s when under 5 min, else 60s
    const currentState = computeState(bookedEvents);
    const fast =
      currentState.phase === 'checkin' ||
      currentState.phase === 'in-progress' ||
      (currentState.phase === 'countdown' &&
        currentState.nextEvent &&
        (() => {
          const start = parseEventDateTime(currentState.nextEvent);
          return start ? start.getTime() - Date.now() < 5 * 60 * 1000 : false;
        })());

    const interval = setInterval(() => {
      setState(computeState(bookedEvents));
    }, fast ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [bookedEvents]);

  return state;
}
