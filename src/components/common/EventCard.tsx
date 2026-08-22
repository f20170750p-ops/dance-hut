import { Heart, MapPin } from 'lucide-react';
import type { EventItem } from '../../services/events';

interface EventCardProps {
  event: EventItem;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}

export function EventCard({ event, saved, onSave, onOpen }: EventCardProps) {
  return (
    <article className="event-card" onClick={onOpen}>
      <div className="event-image">
        <img src={event.image} alt="" />
        <div className="image-top">
          <span className="event-style">{event.style}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className={saved ? 'saved' : ''}
            aria-label={saved ? 'Unsave class' : 'Save class'}
          >
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <span className="spots-badge">{event.spots} spots left</span>
      </div>
      <div className="event-info">
        <div className="event-date">
          {event.date} <span>·</span> {event.time}
        </div>
        <h4>{event.title}</h4>
        <p>
          <MapPin size={14} /> {event.studio} · {event.location}
        </p>
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
