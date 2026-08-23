import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Download,
  Mail,
  QrCode,
  Radio,
  Search,
  UserCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { EventItem } from '../../services/events';
import {
  getEventAttendees,
  updateAttendeeStatus,
  type StudioAttendee,
} from '../../services/studio';

interface AttendeeRosterModalProps {
  event: EventItem;
  onClose: () => void;
  onOpenScanner: (event: EventItem) => void;
  onOpenBroadcast: (event: EventItem) => void;
}

export function AttendeeRosterModal({
  event,
  onClose,
  onOpenScanner,
  onOpenBroadcast,
}: AttendeeRosterModalProps) {
  const [attendees, setAttendees] = useState<StudioAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attended' | 'booked'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getEventAttendees(event.id).then(({ data }) => {
      if (mounted) {
        setAttendees(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [event.id]);

  const handleToggleStatus = async (attendee: StudioAttendee) => {
    const nextStatus = attendee.status === 'attended' ? 'booked' : 'attended';
    setUpdatingId(attendee.bookingId);

    // Optimistic UI update
    setAttendees((prev) =>
      prev.map((a) =>
        a.bookingId === attendee.bookingId
          ? {
              ...a,
              status: nextStatus,
              checkedInAt: nextStatus === 'attended' ? new Date().toISOString() : null,
            }
          : a
      )
    );

    await updateAttendeeStatus(attendee.bookingId, nextStatus);
    setUpdatingId(null);
  };

  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchesSearch =
        a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.qrCode && a.qrCode.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (filterStatus === 'all') return true;
      return a.status === filterStatus;
    });
  }, [attendees, searchQuery, filterStatus]);

  const attendedCount = attendees.filter((a) => a.status === 'attended').length;
  const pendingCount = attendees.filter((a) => a.status === 'booked').length;
  const totalCount = attendees.length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="attendee-roster-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="roster-modal-head">
          <div className="roster-title-area">
            <span className="section-kicker">Live Attendee Roster</span>
            <h2>{event.title}</h2>
            <div className="roster-meta-tags">
              <span>
                <Clock size={13} /> {event.date} • {event.time}
              </span>
              <span>
                <Users size={13} /> {event.studio} ({event.location})
              </span>
              <span className="roster-host-pill">Instructor: {event.host}</span>
            </div>
          </div>

          <div className="roster-head-actions">
            <button
              type="button"
              className="roster-action-btn primary"
              onClick={() => onOpenScanner(event)}
              title="Open QR Scanner to scan dancer passes"
            >
              <QrCode size={15} /> Scan QR Passes
            </button>
            <button
              type="button"
              className="roster-action-btn secondary"
              onClick={() => onOpenBroadcast(event)}
              title="Send notification to enrolled dancers"
            >
              <Radio size={15} /> Broadcast Alert
            </button>
            <button
              type="button"
              className="modal-close-icon"
              onClick={onClose}
              aria-label="Close roster"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="roster-stats-row">
          <div className="roster-stat-card">
            <strong>{totalCount}</strong>
            <span>Total Registered</span>
          </div>
          <div className="roster-stat-card success">
            <strong>{attendedCount}</strong>
            <span>Checked-In (Attended)</span>
          </div>
          <div className="roster-stat-card warning">
            <strong>{pendingCount}</strong>
            <span>Pending Check-In</span>
          </div>
          <div className="roster-stat-card">
            <strong>
              {totalCount > 0
                ? `${Math.round((attendedCount / totalCount) * 100)}%`
                : '0%'}
            </strong>
            <span>Attendance Rate</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="roster-toolbar">
          <div className="roster-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search dancer name, email or ticket code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="roster-filter-chips">
            <button
              type="button"
              className={`roster-chip ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              className={`roster-chip ${
                filterStatus === 'attended' ? 'active' : ''
              }`}
              onClick={() => setFilterStatus('attended')}
            >
              Attended ({attendedCount})
            </button>
            <button
              type="button"
              className={`roster-chip ${
                filterStatus === 'booked' ? 'active' : ''
              }`}
              onClick={() => setFilterStatus('booked')}
            >
              Pending ({pendingCount})
            </button>
          </div>
        </div>

        {/* Attendee Table / List */}
        <div className="roster-table-container">
          {loading ? (
            <div className="roster-loading-state">
              <div className="loader-dot" />
              <span>Loading attendee roster from Supabase...</span>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="roster-empty-state">
              <UserRound size={32} />
              <h4>No registered dancers found</h4>
              <p>
                {searchQuery
                  ? `No attendees match "${searchQuery}".`
                  : 'Registrations will appear here in real time as dancers book tickets.'}
              </p>
            </div>
          ) : (
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Dancer</th>
                  <th>Ticket / Booking ID</th>
                  <th>Booked On</th>
                  <th>Check-In Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee) => {
                  const initials = attendee.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const isAttended = attendee.status === 'attended';

                  return (
                    <tr key={attendee.bookingId} className={isAttended ? 'row-attended' : ''}>
                      <td>
                        <div className="roster-user-cell">
                          <div className="roster-avatar">{initials}</div>
                          <div>
                            <strong>{attendee.userName}</strong>
                            <span>{attendee.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="ticket-code-pill">
                          {attendee.qrCode || `DH-TKT-${attendee.bookingId}`}
                        </code>
                      </td>
                      <td>
                        <span className="booking-date-cell">
                          {new Date(attendee.bookedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`roster-status-badge ${
                            isAttended ? 'attended' : 'pending'
                          }`}
                        >
                          {isAttended ? (
                            <>
                              <Check size={12} /> Attended
                            </>
                          ) : (
                            <>
                              <Clock size={12} /> Pending Check-in
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={`roster-toggle-btn ${
                            isAttended ? 'is-attended' : ''
                          }`}
                          onClick={() => handleToggleStatus(attendee)}
                          disabled={updatingId === attendee.bookingId}
                        >
                          {updatingId === attendee.bookingId ? (
                            'Updating...'
                          ) : isAttended ? (
                            <>
                              <UserCheck size={14} /> Checked-In
                            </>
                          ) : (
                            'Mark Attended'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="roster-modal-footer">
          <span className="roster-footer-note">
            💡 Attendance records sync instantly with Supabase & update dancer history.
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
}
