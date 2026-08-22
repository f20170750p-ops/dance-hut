import { Ticket } from 'lucide-react';
import type { Booking } from '../../services/bookings';
import type { EventItem } from '../../services/events';
import { EmptyTab } from '../common/EmptyTab';

interface BookingsTabProps {
  bookings: { booking: Booking; event: EventItem }[];
  onViewTicket: (event: EventItem, booking: Booking) => void;
  onFindClass: () => void;
}

function getDay(date: string) {
  return Number(date.match(/\d+/)?.[0] ?? 0);
}

function getMonth(date: string) {
  const parts = date.trim().split(/\s+/);
  return parts[parts.length - 1]?.toUpperCase() ?? '';
}

export function BookingsTab({ bookings, onViewTicket, onFindClass }: BookingsTabProps) {
  return (
    <section className="tab-view">
      <div className="tab-heading">
        <span className="section-kicker">Your workspace</span>
        <h2>My bookings</h2>
        <p>Your upcoming dance sessions in one place.</p>
      </div>

      {bookings.length ? (
        <div className="booking-list">
          {bookings.map(({ booking, event }) => (
            <div className="booking-panel" key={booking.id}>
              <div className="booking-date">
                <strong>{getDay(event.date)}</strong>
                <span>{getMonth(event.date)}</span>
              </div>
              <div className="booking-copy">
                <span className="event-style dark-style">{event.style}</span>
                <h3>{event.title}</h3>
                <p>
                  {event.date} · {event.time}
                </p>
                <p>
                  {event.studio} · {event.location}
                </p>
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={() => onViewTicket(event, booking)}
              >
                View ticket <Ticket size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyTab
          icon={<Ticket size={28} />}
          title="No bookings yet"
          message="Your confirmed classes will appear here."
          action="Discover classes"
          onAction={onFindClass}
        />
      )}
    </section>
  );
}
