import {
  ArrowRight,
  Clock3,
  Flame,
  MapPin,
  MessageCircle,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { EventItem } from '../../services/events';

interface EventModalProps {
  event: EventItem;
  error: string;
  alreadyBooked: boolean;
  onClose: () => void;
  onBook: () => void;
  onMessageHost?: (event: EventItem) => void;
}

export function EventModal({
  event,
  error,
  alreadyBooked,
  onClose,
  onBook,
  onMessageHost,
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
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                event.studio + ', ' + event.location + ', Bengaluru'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-location-link"
              title="Open venue in Google Maps"
            >
              <MapPin size={17} />
              <span>
                <strong>{event.studio}</strong>
                {event.location}
              </span>
            </a>
            <div className="instructor-detail-row">
              <UserRound size={17} />
              <div className="instructor-info-wrap">
                <span>
                  <strong>Hosted by {event.host}</strong>
                  Professional choreographer
                </span>
                {onMessageHost && (
                  <button
                    type="button"
                    className="message-instructor-btn"
                    onClick={() => onMessageHost(event)}
                    title={`Message ${event.host}`}
                  >
                    <MessageCircle size={14} />
                    <span>Message Host</span>
                  </button>
                )}
              </div>
            </div>
            <div>
              <Clock3 size={17} />
              <span>
                <strong>90 minutes</strong>
                All levels welcome
              </span>
            </div>
          </div>

          <div className="modal-urgency-strip">
            <div className="urgency-icon-wrap">
              {soldOut ? (
                <Users size={16} />
              ) : event.spots <= 3 ? (
                <Flame size={16} />
              ) : (
                <Sparkles size={16} />
              )}
            </div>
            <div className="urgency-text">
              <strong>
                {soldOut
                  ? 'Sold out for this session'
                  : event.spots <= 3
                  ? `Selling fast · Only ${event.spots} spots left!`
                  : `Trending workshop in ${event.location}`}
              </strong>
              <span>
                {soldOut
                  ? 'Check other dates or upcoming workshops'
                  : `${Math.max(4, 20 - event.spots)} dancers booked recently · Instant QR check-in`}
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
