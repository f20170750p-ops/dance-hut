import { Heart } from 'lucide-react';
import type { EventItem } from '../../services/events';
import { EmptyTab } from '../common/EmptyTab';
import { EventCard } from '../common/EventCard';

interface SavedTabProps {
  events: EventItem[];
  saved: number[];
  onOpenEvent: (event: EventItem) => void;
  onToggleSave: (id: number) => void;
  onFindClass: () => void;
}

export function SavedTab({
  events,
  saved,
  onOpenEvent,
  onToggleSave,
  onFindClass,
}: SavedTabProps) {
  const savedEvents = events.filter((event) => saved.includes(event.id));

  return (
    <section className="tab-view">
      <div className="tab-heading">
        <span className="section-kicker">Your workspace</span>
        <h2>Saved events</h2>
        <p>Classes and workshops you want to come back to.</p>
      </div>

      {savedEvents.length > 0 ? (
        <div className="event-grid">
          {savedEvents.map((event) => (
            <EventCard
              event={event}
              saved
              onSave={() => onToggleSave(event.id)}
              onOpen={() => onOpenEvent(event)}
              key={event.id}
            />
          ))}
        </div>
      ) : (
        <EmptyTab
          icon={<Heart size={28} />}
          title="Nothing saved yet"
          message="Tap the heart on a class to save it for later."
          action="Explore classes"
          onAction={onFindClass}
        />
      )}
    </section>
  );
}
