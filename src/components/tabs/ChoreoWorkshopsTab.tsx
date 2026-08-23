import { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  MapPin,
  Megaphone,
  Plus,
  Search,
  Share2,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { EventItem } from '../../services/events';
import { deleteStudioEvent } from '../../services/studio';

interface ChoreoWorkshopsTabProps {
  events: EventItem[];
  onOpenCreateWorkshop: () => void;
  onOpenRoster: (event: EventItem) => void;
  onOpenBroadcast: (event: EventItem) => void;
  onDeleteWorkshop?: (eventId: number) => void;
}

export function ChoreoWorkshopsTab({
  events,
  onOpenCreateWorkshop,
  onOpenRoster,
  onOpenBroadcast,
  onDeleteWorkshop,
}: ChoreoWorkshopsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'upcoming' | 'past'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const uniqueStyles = useMemo(() => {
    const set = new Set(events.map((e) => e.style));
    return ['All', ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.studio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.style.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedStyle !== 'All' && ev.style !== selectedStyle) {
        return false;
      }

      if (filterPeriod === 'upcoming') {
        return ev.dateKey >= todayStr;
      }
      if (filterPeriod === 'past') {
        return ev.dateKey < todayStr;
      }

      return true;
    });
  }, [events, searchQuery, selectedStyle, filterPeriod]);

  const handleDelete = async (eventId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel and remove "${title}"?`)) {
      return;
    }
    setDeletingId(eventId);
    await deleteStudioEvent(eventId);
    setDeletingId(null);
    if (onDeleteWorkshop) {
      onDeleteWorkshop(eventId);
    }
  };

  const handleShare = (event: EventItem) => {
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: `Join my dance workshop: ${event.title} at ${event.studio}!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Join ${event.title} on DanceHut: ${window.location.origin}`
      );
      alert('Workshop link copied to clipboard!');
    }
  };

  return (
    <div className="tab-view choreo-workshops-view">
      <div className="tab-heading-row">
        <div>
          <span className="section-kicker">Classes & Masterclasses</span>
          <h2>My Hosted Workshops</h2>
          <p>View registered dancers, update class schedules, and send music & outfit prep notes.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={onOpenCreateWorkshop}
        >
          <Plus size={16} /> Host New Workshop
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="studio-workshops-toolbar">
        <div className="toolbar-search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search classes by routine, studio or dance style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="toolbar-filters-row">
          <div className="filter-pill-group">
            <button
              type="button"
              className={`filter-pill ${filterPeriod === 'all' ? 'active' : ''}`}
              onClick={() => setFilterPeriod('all')}
            >
              All Classes ({events.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterPeriod === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilterPeriod('upcoming')}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`filter-pill ${filterPeriod === 'past' ? 'active' : ''}`}
              onClick={() => setFilterPeriod('past')}
            >
              Past
            </button>
          </div>

          <div className="style-select-wrapper">
            <Filter size={14} />
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
            >
              {uniqueStyles.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Class Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="studio-empty-workshops">
          <Calendar size={40} />
          <h3>No classes found</h3>
          <p>
            {searchQuery || selectedStyle !== 'All'
              ? 'No workshops match your current search filters.'
              : 'You have not scheduled any workshops yet. Click below to host your first masterclass!'}
          </p>
          <button
            type="button"
            className="primary-btn"
            onClick={onOpenCreateWorkshop}
          >
            <Plus size={16} /> Host Your First Class
          </button>
        </div>
      ) : (
        <div className="studio-workshops-grid">
          {filteredEvents.map((ev) => {
            const bookedCount = Math.max(0, 25 - ev.spots);
            const occupancyPct = Math.min(100, Math.round((bookedCount / 25) * 100));

            return (
              <div key={ev.id} className="studio-workshop-card choreo-class-card">
                <div className="card-media-wrap">
                  <img src={ev.image} alt={ev.title} />
                  <span className="card-style-badge">{ev.style}</span>
                  {ev.featured && <span className="card-featured-badge">Featured</span>}
                  <span className="card-price-badge">{ev.price}</span>
                </div>

                <div className="card-content">
                  <div className="card-date-time">
                    <span>
                      <Calendar size={13} /> {ev.date}
                    </span>
                    <span>
                      <Clock size={13} /> {ev.time}
                    </span>
                  </div>

                  <h3>{ev.title}</h3>

                  <div className="card-venue-instructor">
                    <p>
                      <MapPin size={13} /> <strong>{ev.studio}</strong> • {ev.location}
                    </p>
                  </div>

                  <div className="card-occupancy-section">
                    <div className="occupancy-labels">
                      <span>Students Registered</span>
                      <strong>
                        {bookedCount} / 25 ({occupancyPct}%)
                      </strong>
                    </div>
                    <div className="occupancy-bar">
                      <div
                        className="occupancy-fill"
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="card-actions-grid">
                    <button
                      type="button"
                      className="card-action-btn primary"
                      onClick={() => onOpenRoster(ev)}
                    >
                      <Users size={14} /> Student Roster
                    </button>
                    <button
                      type="button"
                      className="card-action-btn secondary"
                      onClick={() => onOpenBroadcast(ev)}
                      title="Send song & prep tips"
                    >
                      <Megaphone size={14} /> Song Tip
                    </button>
                    <button
                      type="button"
                      className="card-action-btn tertiary"
                      onClick={() => handleShare(ev)}
                      title="Share class link"
                    >
                      <Share2 size={14} /> Share
                    </button>
                    <button
                      type="button"
                      className="card-action-btn danger"
                      onClick={() => handleDelete(ev.id, ev.title)}
                      disabled={deletingId === ev.id}
                      title="Cancel & remove class"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
