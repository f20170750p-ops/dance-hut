import { useMemo } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Megaphone,
  Plus,
  QrCode,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import type { EventItem } from '../../services/events';
import { computeStudioKPIs } from '../../services/studio';

interface StudioOverviewTabProps {
  studioName: string;
  events: EventItem[];
  bookings: any[];
  onOpenCreateWorkshop: () => void;
  onOpenRoster: (event: EventItem) => void;
  onOpenScanner: (event?: EventItem) => void;
  onOpenBroadcast: (event?: EventItem) => void;
  onNavigateTab: (tab: string) => void;
}

export function StudioOverviewTab({
  studioName,
  events,
  bookings,
  onOpenCreateWorkshop,
  onOpenRoster,
  onOpenScanner,
  onOpenBroadcast,
  onNavigateTab,
}: StudioOverviewTabProps) {
  const kpis = useMemo(() => computeStudioKPIs(events, bookings), [events, bookings]);

  // Today's classes
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayEvents = useMemo(() => {
    return events.filter((e) => e.dateKey === todayKey);
  }, [events, todayKey]);

  // Next upcoming classes
  const upcomingEvents = useMemo(() => {
    return events.slice(0, 4);
  }, [events]);

  const formattedCurrentDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="tab-view studio-overview-view">
      {/* Studio Header Banner */}
      <div className="studio-hero-card">
        <div className="studio-hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot pulse" /> Studio Management Portal
          </div>
          <h2>
            Welcome back, <br />
            <em>{studioName || 'Step & Groove Studio'}</em>
          </h2>
          <p>
            Track registrations, manage dance halls, and scan attendee passes in real time.
          </p>
          <span className="studio-hero-date">
            <Calendar size={14} /> {formattedCurrentDate}
          </span>
        </div>

        <div className="studio-hero-actions">
          <button
            type="button"
            className="primary-btn studio-create-btn"
            onClick={onOpenCreateWorkshop}
          >
            <Plus size={18} /> Create New Workshop
          </button>
          <div className="studio-secondary-actions">
            <button
              type="button"
              className="studio-chip-btn"
              onClick={() => onOpenScanner()}
            >
              <QrCode size={16} /> QR Ticket Scanner
            </button>
            <button
              type="button"
              className="studio-chip-btn"
              onClick={() => onOpenBroadcast()}
            >
              <Megaphone size={16} /> Broadcast Alert
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="studio-kpi-grid">
        <div className="studio-kpi-card">
          <div className="kpi-icon-wrap primary">
            <Calendar size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Active Workshops</span>
            <strong className="kpi-value">{kpis.activeWorkshopsCount}</strong>
            <span className="kpi-subtext">Live on Bengaluru Discover</span>
          </div>
        </div>

        <div className="studio-kpi-card">
          <div className="kpi-icon-wrap accent">
            <Users size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Occupancy & Spots</span>
            <strong className="kpi-value">
              {kpis.totalSpotsBooked}{' '}
              <small>/ {kpis.totalCapacity} spots</small>
            </strong>
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{
                  width: `${
                    kpis.totalCapacity > 0
                      ? Math.min(
                          100,
                          Math.round((kpis.totalSpotsBooked / kpis.totalCapacity) * 100)
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="studio-kpi-card">
          <div className="kpi-icon-wrap success">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Estimated Gross Sales</span>
            <strong className="kpi-value">
              ₹{kpis.estimatedRevenue.toLocaleString('en-IN')}
            </strong>
            <span className="kpi-subtext">From confirmed bookings</span>
          </div>
        </div>

        <div className="studio-kpi-card">
          <div className="kpi-icon-wrap info">
            <UserCheck size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Check-In Rate</span>
            <strong className="kpi-value">{kpis.checkInRate}%</strong>
            <span className="kpi-subtext">Front-desk pass scans</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule Section */}
      <div className="studio-section">
        <div className="studio-section-head">
          <div>
            <span className="section-kicker">Today's Class Schedule</span>
            <h3>Classes Running Today</h3>
          </div>
          {todayEvents.length > 0 && (
            <span className="schedule-count-badge">
              {todayEvents.length} {todayEvents.length === 1 ? 'Class' : 'Classes'} Scheduled
            </span>
          )}
        </div>

        {todayEvents.length === 0 ? (
          <div className="studio-empty-schedule">
            <div className="empty-schedule-icon">
              <Clock size={28} />
            </div>
            <h4>No workshops scheduled for today</h4>
            <p>You have no classes running today. Upcoming workshops will appear below.</p>
            <button
              type="button"
              className="primary-btn empty-schedule-btn"
              onClick={onOpenCreateWorkshop}
            >
              <Plus size={16} /> Schedule Class for Today
            </button>
          </div>
        ) : (
          <div className="today-classes-grid">
            {todayEvents.map((ev) => (
              <div key={ev.id} className="today-class-card">
                <div className="today-class-time">
                  <Clock size={16} />
                  <span>{ev.time}</span>
                </div>
                <div className="today-class-body">
                  <div className="today-class-header">
                    <span className="class-style-tag">{ev.style}</span>
                    <span className="class-price-tag">{ev.price}</span>
                  </div>
                  <h4>{ev.title}</h4>
                  <p className="today-class-location">
                    <MapPin size={13} /> {ev.studio} • {ev.location}
                  </p>
                  <div className="today-class-instructor">
                    <span>Instructor: <strong>{ev.host}</strong></span>
                  </div>
                </div>

                <div className="today-class-footer">
                  <div className="today-class-spots">
                    <Users size={14} />
                    <span>
                      <strong>{Math.max(0, 25 - ev.spots)}</strong> / 25 Booked
                    </span>
                  </div>
                  <div className="today-class-actions">
                    <button
                      type="button"
                      className="class-card-btn secondary"
                      onClick={() => onOpenRoster(ev)}
                    >
                      View Roster
                    </button>
                    <button
                      type="button"
                      className="class-card-btn primary"
                      onClick={() => onOpenScanner(ev)}
                    >
                      <QrCode size={14} /> Scan Passes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Workshops & Feed Section */}
      <div className="studio-section">
        <div className="studio-section-head">
          <div>
            <span className="section-kicker">Manage Your Schedule</span>
            <h3>Upcoming Workshop Schedule</h3>
          </div>
          <button
            type="button"
            className="view-all-link"
            onClick={() => onNavigateTab('My Workshops')}
          >
            View all workshops <ArrowRight size={14} />
          </button>
        </div>

        <div className="upcoming-classes-table-card">
          <table className="studio-mini-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Workshop Title</th>
                <th>Instructor</th>
                <th>Pricing & Spots</th>
                <th style={{ textAlign: 'right' }}>Quick Action</th>
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
                      <span>{ev.style} • {ev.location}</span>
                    </div>
                  </td>
                  <td>
                    <span className="table-instructor-name">{ev.host}</span>
                  </td>
                  <td>
                    <div className="table-spots-cell">
                      <strong>{ev.price}</strong>
                      <span>{ev.spots} spots left</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="table-roster-btn"
                      onClick={() => onOpenRoster(ev)}
                    >
                      Roster & Attendance
                    </button>
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
