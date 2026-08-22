import { useState } from 'react';
import { CalendarDays, Ticket } from 'lucide-react';
import type { Booking } from '../../services/bookings';
import type { EventItem } from '../../services/events';
import { EmptyTab } from '../common/EmptyTab';
import { EventCard } from '../common/EventCard';

interface CalendarTabProps {
  events: EventItem[];
  saved: number[];
  bookings: { booking: Booking; event: EventItem }[];
  onOpenEvent: (event: EventItem) => void;
  onToggleSave: (id: number) => void;
  onFindClass: () => void;
  onViewTicket: (event: EventItem, booking: Booking) => void;
}

export function CalendarTab({
  events,
  saved,
  bookings,
  onOpenEvent,
  onToggleSave,
  onFindClass,
  onViewTicket,
}: CalendarTabProps) {
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<'AUG' | 'SEP'>('AUG');

  const selectedDateKey =
    selectedCalendarDay === null
      ? null
      : `${calendarMonth === 'AUG' ? '2026-08' : '2026-09'}-${String(selectedCalendarDay).padStart(2, '0')}`;
  const selectedEvents =
    selectedDateKey === null ? [] : events.filter((event) => event.dateKey === selectedDateKey);
  const selectedBookings =
    selectedDateKey === null
      ? []
      : bookings.filter(({ event }) => event.dateKey === selectedDateKey);
  const monthLabel = calendarMonth === 'AUG' ? 'August 2026' : 'September 2026';
  const daysInMonth = calendarMonth === 'AUG' ? 31 : 30;
  const firstDayOffset =
    (new Date(calendarMonth === 'AUG' ? '2026-08-01T00:00:00' : '2026-09-01T00:00:00').getDay() +
      6) %
    7;

  return (
    <section className="tab-view">
      <div className="tab-heading">
        <span className="section-kicker">Your workspace</span>
        <h2>Your calendar</h2>
        <p>Select a date to explore classes and your bookings.</p>
      </div>

      <div className="calendar-panel">
        <div className="calendar-header">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => {
              setCalendarMonth('AUG');
              setSelectedCalendarDay(null);
            }}
          >
            ‹
          </button>
          <strong>{monthLabel}</strong>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => {
              setCalendarMonth('SEP');
              setSelectedCalendarDay(null);
            }}
          >
            ›
          </button>
        </div>

        <div className="calendar-week">
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
          <span>SUN</span>
        </div>

        <div className="calendar-grid">
          {Array.from({ length: firstDayOffset }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty" aria-hidden="true" />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dateKey = `${calendarMonth === 'AUG' ? '2026-08' : '2026-09'}-${String(day).padStart(2, '0')}`;
            const hasBooking = bookings.some(({ event }) => event.dateKey === dateKey);
            const hasEvents = events.some((event) => event.dateKey === dateKey);
            return (
              <button
                type="button"
                className={`calendar-day ${hasBooking ? 'booked' : ''} ${
                  selectedCalendarDay === day ? 'selected' : ''
                }`}
                key={day}
                onClick={() => setSelectedCalendarDay(day)}
              >
                <span>{day}</span>
                {hasEvents && !hasBooking && <span className="day-dot event-dot" />}
                {hasBooking && <span className="day-dot booking-dot" />}
              </button>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span className="legend-dot event-dot" /> Classes available{' '}
          <span className="legend-dot booking-dot" /> Your booking
        </div>
      </div>

      {selectedCalendarDay !== null && (
        <div className="calendar-events">
          <div className="section-head">
            <div>
              <span className="section-kicker">
                {monthLabel} · {selectedCalendarDay}
              </span>
              <h3>{selectedEvents.length ? 'Classes on this day' : 'No classes on this day'}</h3>
            </div>
          </div>

          {selectedBookings.length > 0 && (
            <div className="date-bookings">
              <span className="section-kicker">Your bookings</span>
              {selectedBookings.map(({ event, booking }) => (
                <div className="date-booking" key={booking.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>
                      {event.time} · {event.studio}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => onViewTicket(event, booking)}
                  >
                    View ticket <Ticket size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedEvents.length ? (
            <>
              <span className="section-kicker">Other classes</span>
              <div className="event-grid">
                {selectedEvents.map((event) => (
                  <EventCard
                    event={event}
                    saved={saved.includes(event.id)}
                    onSave={() => onToggleSave(event.id)}
                    onOpen={() => onOpenEvent(event)}
                    key={event.id}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyTab
              icon={<CalendarDays size={28} />}
              title="No classes found"
              message="Try another date or return to Discover."
              action="Browse all classes"
              onAction={onFindClass}
            />
          )}
        </div>
      )}
    </section>
  );
}
