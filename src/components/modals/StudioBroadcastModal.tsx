import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Bell,
  Check,
  Clock,
  Info,
  MapPin,
  Megaphone,
  Radio,
  Send,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';
import type { EventItem } from '../../services/events';
import { broadcastWorkshopAlert } from '../../services/studio';

interface StudioBroadcastModalProps {
  events: EventItem[];
  preselectedEvent?: EventItem | null;
  onClose: () => void;
  onBroadcastSent?: (eventId: number, recipientCount: number) => void;
}

const BROADCAST_TEMPLATES = [
  {
    type: 'announcement' as const,
    label: 'General Announcement',
    icon: Megaphone,
    defaultTitle: 'Important Workshop Update',
    defaultMsg: 'Hey dancers! We look forward to seeing you in class. Please arrive 10 minutes early for check-in.',
  },
  {
    type: 'reminder' as const,
    label: 'Footwear & Attire Reminder',
    icon: Shirt,
    defaultTitle: 'Footwear Guidelines for Class',
    defaultMsg: 'Please bring clean indoor dance sneakers / block heels. Outside street footwear is not permitted in the studio hall.',
  },
  {
    type: 'location_change' as const,
    label: 'Room / Studio Hall Shift',
    icon: MapPin,
    defaultTitle: 'Studio Hall Room Update',
    defaultMsg: 'Notice: Today’s workshop will take place in Studio Hall A (First Floor). Follow the signage at the front desk.',
  },
  {
    type: 'time_change' as const,
    label: 'Schedule / Timing Delay',
    icon: Clock,
    defaultTitle: 'Slight Delay in Class Timing',
    defaultMsg: 'Please note today’s session will commence 15 minutes past the scheduled time. Thank you for your patience!',
  },
];

export function StudioBroadcastModal({
  events,
  preselectedEvent,
  onClose,
  onBroadcastSent,
}: StudioBroadcastModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<number>(
    preselectedEvent?.id || events[0]?.id || 0
  );
  const [selectedType, setSelectedType] = useState<
    'announcement' | 'location_change' | 'time_change' | 'reminder'
  >('announcement');
  const [title, setTitle] = useState(BROADCAST_TEMPLATES[0].defaultTitle);
  const [message, setMessage] = useState(BROADCAST_TEMPLATES[0].defaultMsg);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [error, setError] = useState('');

  const activeEvent = events.find((e) => e.id === Number(selectedEventId));

  const handleTemplateSelect = (tmpl: (typeof BROADCAST_TEMPLATES)[0]) => {
    setSelectedType(tmpl.type);
    setTitle(tmpl.defaultTitle);
    setMessage(tmpl.defaultMsg);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Please fill in both the announcement title and message.');
      return;
    }
    if (!selectedEventId) {
      setError('Please select a target workshop.');
      return;
    }

    setSending(true);
    setError('');

    const { recipientCount: count, error: err } = await broadcastWorkshopAlert(
      Number(selectedEventId),
      title.trim(),
      message.trim(),
      selectedType,
      {
        event_title: activeEvent?.title,
        studio: activeEvent?.studio,
        broadcast_time: new Date().toISOString(),
      }
    );

    setSending(false);

    if (err) {
      setError(err.message || 'Failed to dispatch broadcast alert.');
      return;
    }

    setSuccess(true);
    setRecipientCount(count || 0);
    if (onBroadcastSent) {
      onBroadcastSent(Number(selectedEventId), count || 0);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="studio-broadcast-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <span className="section-kicker">Audience Notification Center</span>
            <h2>Broadcast Workshop Alert</h2>
          </div>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close broadcast"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="broadcast-success-view">
            <div className="success-pulse-icon">
              <Check size={32} />
            </div>
            <h3>Broadcast Sent Successfully!</h3>
            <p>
              Alert dispatched to <strong>{recipientCount}</strong> enrolled & interested dancers for <em>"{activeEvent?.title}"</em>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="broadcast-form">
            {error && <div className="form-alert error">{error}</div>}

            <label className="field-group full-width">
              <span>Select Workshop Audience *</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                required
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date} • {ev.time})
                  </option>
                ))}
              </select>
            </label>

            <div className="broadcast-templates-container">
              <span className="field-label">Quick Alert Presets</span>
              <div className="template-chips-grid">
                {BROADCAST_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = selectedType === tmpl.type;
                  return (
                    <button
                      type="button"
                      key={tmpl.type}
                      className={`template-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleTemplateSelect(tmpl)}
                    >
                      <Icon size={14} />
                      <span>{tmpl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="field-group full-width">
              <span>Announcement Title *</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bring indoor dance sneakers"
                required
              />
            </label>

            <label className="field-group full-width">
              <span>Message Body *</span>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to enrolled dancers..."
                required
              />
            </label>

            {/* Live Preview Box */}
            <div className="broadcast-preview-box">
              <div className="preview-label">
                <Sparkles size={12} /> Dancer Notification Preview:
              </div>
              <div className="preview-card">
                <div className="preview-header">
                  <span className="preview-badge">{selectedType.replace('_', ' ').toUpperCase()}</span>
                  <span className="preview-time">Just now</span>
                </div>
                <strong>{title || 'Announcement Title'}</strong>
                <p>{message || 'Message preview will appear here...'}</p>
                <small className="preview-event-name">
                  📍 {activeEvent?.title || 'Selected Workshop'}
                </small>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn broadcast-submit-btn"
                disabled={sending}
              >
                {sending ? 'Dispatching...' : 'Dispatch Alert to Dancers'}{' '}
                <Send size={15} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
