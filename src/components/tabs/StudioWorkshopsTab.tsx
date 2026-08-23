import { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Filter,
  MapPin,
  Megaphone,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { EventItem } from '../../services/events';
import { deleteStudioEvent } from '../../services/studio';

interface StudioWorkshopsTabProps {
  events: EventItem[];
  onOpenCreateWorkshop: () => void;
  onOpenRoster: (event: EventItem) => void;
  onOpenScanner: (event: EventItem) => void;
  onOpenBroadcast: (event: EventItem) => void;
  onDeleteWorkshop?: (eventId: number) => void;
}

export function StudioWorkshopsTab({
  events,
  onOpenCreateWorkshop,
  onOpenRoster,
  onOpenScanner,
  onOpenBroadcast,
  onDeleteWorkshop,
}: StudioWorkshopsTabProps) {
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
        ev.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <div className="tab-view studio-workshops-view">
      <div className="tab-heading-row">
        <div>
          <span className="section-kicker">Workshop Operations</span>
          <h2>My Studio Workshops</h2>
          <p>Create, manage, and track attendance across all your hosted workshops.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={onOpenCreateWorkshop}
        >
          <Plus size={16} /> Create New Workshop
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="studio-workshops-toolbar">
        <div className="toolbar-search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search workshops by title, style or instructor..."
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

      {/* Workshop Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="studio-empty-workshops">
          <Calendar size={40} />
          <h3>No workshops found</h3>
          <p>
            {searchQuery || selectedStyle !== 'All'
              ? 'No classes match your current filter criteria.'
              : 'You have not created any workshops yet. Click below to add your first class!'}
          </p>
          <button
            type="button"
            className="primary-btn"
            onClick={onOpenCreateWorkshop}
          >
            <Plus size={16} /> Schedule Your First Class
          </button>
        </div>
      ) : (
        <div className="studio-workshops-grid">
          {filteredEvents.map((ev) => {
            const bookedCount = Math.max(0, 25 - ev.spots);
            const occupancyPct = Math.min(100, Math.round((bookedCount / 25) * 100));

            return (
              <div key={ev.id} className="studio-workshop-card">
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
                      <MapPin size={13} /> {ev.studio} • {ev.location}
                    </p>
                    <p>
                      Instructor: <strong>{ev.host}</strong>
                    </p>
                  </div>

                  <div className="card-occupancy-section">
                    <div className="occupancy-labels">
                      <span>Occupancy</span>
                      <strong>
                        {bookedCount} / 25 spots ({occupancyPct}%)
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
                      <Users size={14} /> Attendee Roster
                    </button>
                    <button
                      type="button"
                      className="card-action-btn secondary"
                      onClick={() => onOpenScanner(ev)}
                    >
                      <QrCode size={14} /> Scan Pass
                    </button>
                    <button
                      type="button"
                      className="card-action-btn tertiary"
                      onClick={() => onOpenBroadcast(ev)}
                      title="Broadcast alert to attendees"
                    >
                      <Megaphone size={14} /> Alert
                    </button>
                    <button
                      type="button"
                      className="card-action-btn danger"
                      onClick={() => handleDelete(ev.id, ev.title)}
                      disabled={deletingId === ev.id}
                      title="Cancel & delete workshop"
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
