import { CalendarClock, Flame, Heart, MapPin, Users } from 'lucide-react';
import { type EventItem, getBookingStatus } from '../../services/events';

interface EventCardProps {
  event: EventItem;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}

export function EventCard({ event, saved, onSave, onOpen }: EventCardProps) {
  const bookingStatus = getBookingStatus(event.dateKey || event.date);
  const isAdvanceRestricted = bookingStatus.isAdvanceRestricted;
  const isUrgent = !isAdvanceRestricted && event.spots > 0 && event.spots <= 3;
  const isPopular = !isAdvanceRestricted && event.spots > 3 && event.spots <= 7;
  const soldOut = event.spots <= 0;
  const bookedEstimate = Math.max(4, 20 - event.spots);

  return (
    <article className="event-card" onClick={onOpen}>
      <div className="event-image">
        <img src={event.image} alt={event.title} />
        <div className="image-top">
          <span className="event-style">{event.style}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className={`event-save-btn ${saved ? 'saved' : ''}`}
            aria-label={saved ? 'Unsave class' : 'Save class'}
          >
            <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <span
          className={`spots-badge ${soldOut ? 'sold-out' : isAdvanceRestricted ? 'advance-badge' : isUrgent ? 'urgent' : isPopular ? 'popular' : ''}`}
        >
          {soldOut ? (
            'Sold out'
          ) : isAdvanceRestricted ? (
            <>
              <CalendarClock size={11} /> Opens soon
            </>
          ) : isUrgent ? (
            <>
              <Flame size={11} /> Only {event.spots} left
            </>
          ) : (
            `${event.spots} spots left`
          )}
        </span>
      </div>
      <div className="event-info">
        <div className="event-date-row">
          <div className="event-date">
            {event.date} <span>·</span> {event.time}
          </div>
          {isAdvanceRestricted && <span className="advance-pill">⏳ Opens 30d prior</span>}
          {!isAdvanceRestricted && isUrgent && <span className="urgency-pill">🔥 Filling fast</span>}
          {!isAdvanceRestricted && !isUrgent && event.featured && <span className="trending-pill">✦ Spotlight</span>}
        </div>
        <h4>{event.title}</h4>
        <p>
          <MapPin size={14} /> {event.studio} · {event.location}
        </p>
        <div className="card-social-proof">
          <Users size={12} />
          <span>{bookedEstimate} dancers attending</span>
        </div>
        <div className="event-meta">
          <span>
            with <strong>{event.host}</strong>
          </span>
          <strong>{event.price}</strong>
        </div>
      </div>
    </article>
  );
}
