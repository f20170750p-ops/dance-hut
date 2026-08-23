import { useMemo } from 'react';
import {
  ArrowRight,
  Award,
  Calendar,
  Clock,
  Flame,
  MapPin,
  Megaphone,
  Music2,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { EventItem } from '../../services/events';
import { computeChoreoKPIs } from '../../services/choreo';

interface ChoreoOverviewTabProps {
  choreoName: string;
  events: EventItem[];
  onOpenCreateWorkshop: () => void;
  onOpenRoster: (event: EventItem) => void;
  onOpenBroadcast: (event?: EventItem) => void;
  onNavigateTab: (tab: string) => void;
}

export function ChoreoOverviewTab({
  choreoName,
  events,
  onOpenCreateWorkshop,
  onOpenRoster,
  onOpenBroadcast,
  onNavigateTab,
}: ChoreoOverviewTabProps) {
  const kpis = useMemo(() => computeChoreoKPIs(events, choreoName), [events, choreoName]);

  const formattedCurrentDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const upcomingEvents = useMemo(() => {
    return events.slice(0, 4);
  }, [events]);

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
    <div className="tab-view choreo-overview-view">
      {/* Choreographer Hero Banner */}
      <div className="choreo-hero-card">
        <div className="choreo-hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot pulse" /> Choreographer Studio & Creator Suite
          </div>
          <h2>
            Welcome back, <br />
            <em>{choreoName || 'Ananya Roy'}</em> ✨
          </h2>
          <p>
            Manage your masterclasses, track student registrations, and send routine updates to your dancers.
          </p>
          <span className="choreo-hero-date">
            <Calendar size={14} /> {formattedCurrentDate}
          </span>
        </div>

        <div className="choreo-hero-actions">
          <button
            type="button"
            className="primary-btn choreo-create-btn"
            onClick={onOpenCreateWorkshop}
          >
            <Plus size={18} /> Host New Workshop
          </button>
          <div className="choreo-secondary-actions">
            <button
              type="button"
              className="choreo-chip-btn"
              onClick={() => onOpenBroadcast()}
            >
              <Megaphone size={15} /> Song & Prep Broadcast
            </button>
            <button
              type="button"
              className="choreo-chip-btn"
              onClick={() => onNavigateTab('My Classes')}
            >
              <Music2 size={15} /> View My Classes
            </button>
          </div>
        </div>
      </div>

      {/* Creator KPI Metrics Grid */}
      <div className="choreo-kpi-grid">
        <div className="choreo-kpi-card">
          <div className="kpi-icon-wrap primary">
            <Sparkles size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Active Masterclasses</span>
            <strong className="kpi-value">{kpis.upcomingClassesCount}</strong>
            <span className="kpi-subtext">Live on Bengaluru Discover</span>
          </div>
        </div>

        <div className="choreo-kpi-card">
          <div className="kpi-icon-wrap accent">
            <Users size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Dancers Enrolled</span>
            <strong className="kpi-value">{kpis.totalStudentsEnrolled} Students</strong>
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{ width: `${kpis.averageFillRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="choreo-kpi-card">
          <div className="kpi-icon-wrap success">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Estimated Gross Revenue</span>
            <strong className="kpi-value">
              ₹{kpis.estimatedEarnings.toLocaleString('en-IN')}
            </strong>
            <span className="kpi-subtext">From confirmed bookings</span>
          </div>
        </div>

        <div className="choreo-kpi-card">
          <div className="kpi-icon-wrap info">
            <Award size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Average Fill Rate</span>
            <strong className="kpi-value">{kpis.averageFillRate}%</strong>
            <span className="kpi-subtext">High dancer demand 🔥</span>
          </div>
        </div>
      </div>

      {/* Next Class Spotlight Card */}
      {kpis.nextClass && (
        <div className="choreo-section">
          <div className="choreo-section-head">
            <div>
              <span className="section-kicker">Next In Your Schedule</span>
              <h3>Upcoming Class Spotlight</h3>
            </div>
            <span className="live-spotlight-pill">
              <Flame size={14} /> Next Session
            </span>
          </div>

          <div className="choreo-spotlight-card">
            <div className="spotlight-media">
              <img src={kpis.nextClass.image} alt={kpis.nextClass.title} />
              <span className="spotlight-style-badge">{kpis.nextClass.style}</span>
            </div>

            <div className="spotlight-content">
              <div className="spotlight-meta-top">
                <span className="spotlight-date">
                  <Calendar size={13} /> {kpis.nextClass.date}
                </span>
                <span className="spotlight-time">
                  <Clock size={13} /> {kpis.nextClass.time}
                </span>
                <span className="spotlight-price">{kpis.nextClass.price} / spot</span>
              </div>

              <h4>{kpis.nextClass.title}</h4>

              <p className="spotlight-venue">
                <MapPin size={14} /> <strong>{kpis.nextClass.studio}</strong> • {kpis.nextClass.location}
              </p>

              <div className="spotlight-enrollment">
                <div className="enrollment-labels">
                  <span>Enrolled Dancers</span>
                  <strong>{Math.max(0, 25 - kpis.nextClass.spots)} / 25 spots filled</strong>
                </div>
                <div className="enrollment-bar">
                  <div
                    className="enrollment-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((25 - kpis.nextClass.spots) / 25) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="spotlight-actions">
                <button
                  type="button"
                  className="primary-btn spotlight-btn"
                  onClick={() => onOpenRoster(kpis.nextClass!)}
                >
                  <Users size={15} /> View Student Roster
                </button>
                <button
                  type="button"
                  className="choreo-chip-btn"
                  onClick={() => onOpenBroadcast(kpis.nextClass!)}
                >
                  <Megaphone size={14} /> Send Song Prep Tip
                </button>
                <button
                  type="button"
                  className="choreo-chip-btn share-icon-btn"
                  onClick={() => handleShare(kpis.nextClass!)}
                  title="Share workshop link"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teaching Schedule Timeline */}
      <div className="choreo-section">
        <div className="choreo-section-head">
          <div>
            <span className="section-kicker">Schedule & Roster Management</span>
            <h3>Upcoming Teaching Schedule</h3>
          </div>
          <button
            type="button"
            className="view-all-link"
            onClick={() => onNavigateTab('My Classes')}
          >
            View all classes <ArrowRight size={14} />
          </button>
        </div>

        <div className="upcoming-classes-table-card">
          <table className="studio-mini-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Workshop Routine</th>
                <th>Studio & Venue</th>
                <th>Enrolled</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <div className="table-datetime-cell">
                      <strong>{ev.date}</strong>
                      <span>{ev.time}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-title-cell">
                      <strong>{ev.title}</strong>
                      <span className="table-style-pill">{ev.style}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-venue-cell">
                      <strong>{ev.studio}</strong>
                      <span>{ev.location}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-spots-cell">
                      <strong>{Math.max(0, 25 - ev.spots)} / 25</strong>
                      <span>{ev.spots} spots left</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-action-btns-row">
                      <button
                        type="button"
                        className="table-roster-btn"
                        onClick={() => onOpenRoster(ev)}
                      >
                        Roster
                      </button>
                      <button
                        type="button"
                        className="table-alert-btn"
                        onClick={() => onOpenBroadcast(ev)}
                        title="Send announcement to students"
                      >
                        <Megaphone size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
