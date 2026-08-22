import { ArrowRight, Clock3, MapPin, Ticket, UserRound, X } from 'lucide-react';
import type { EventItem } from '../../services/events';

interface EventModalProps {
  event: EventItem;
  error: string;
  alreadyBooked: boolean;
  onClose: () => void;
  onBook: () => void;
}

export function EventModal({
  event,
  error,
  alreadyBooked,
  onClose,
  onBook,
}: EventModalProps) {
  const soldOut = event.spots <= 0;
  const statusMessage =
    error ||
    (alreadyBooked
      ? 'You have already booked this class. You can find it in My bookings.'
      : soldOut
      ? 'This class is sold out. Please choose another session.'
      : '');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>
        <img
          className="modal-image"
          src={event.image}
          alt={`${event.title} at ${event.studio}`}
        />
        <div className="modal-body">
          <div className="event-date">
            {event.date} <span>·</span> {event.time}
          </div>
          <div className="modal-title-row">
            <div>
              <span className="event-style dark-style">{event.style}</span>
              <h2>{event.title}</h2>
            </div>
            <span className="modal-price">{event.price}</span>
          </div>
          <div className="details-list">
            <div>
              <MapPin size={17} />
              <span>
                <strong>{event.studio}</strong>
                {event.location}
              </span>
            </div>
            <div>
              <UserRound size={17} />
              <span>
                <strong>Hosted by {event.host}</strong>
                Professional choreographer
              </span>
            </div>
            <div>
              <Clock3 size={17} />
              <span>
                <strong>90 minutes</strong>
                All levels welcome
              </span>
            </div>
          </div>
          <p className="modal-description">
            Come as you are. Leave with a new groove. This intimate session is built
            for good music, clear guidance, and the kind of energy that makes you
            want to stay for one more song.
          </p>
          {statusMessage && (
            <p className="booking-error" role="alert">
              {statusMessage}
            </p>
          )}
          <button
            className="primary-btn book-btn"
            onClick={onBook}
            disabled={soldOut || alreadyBooked}
          >
            {alreadyBooked
              ? 'Already booked'
              : soldOut
              ? 'Sold out'
              : 'Book this session'}{' '}
            {!soldOut && !alreadyBooked && <ArrowRight size={17} />}
          </button>
          <span className="modal-note">
            <Ticket size={14} /> Instant confirmation with a QR ticket
          </span>
        </div>
      </div>
    </div>
  );
}
