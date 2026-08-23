import { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, MapPin, Navigation, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { EventItem } from '../../services/events';
import type { CountdownPhase } from '../../hooks/useClassCountdown';

interface CheckInCardProps {
  event: EventItem;
  bookingId: number | null;
  timeLabel: string;
  phase: CountdownPhase;
}

export function CheckInCard({ event, bookingId, timeLabel, phase }: CheckInCardProps) {
  const [expanded, setExpanded] = useState(true);
  const ticketValue = `dancehut:booking:${bookingId ?? event.id}`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.studio + ', ' + event.location + ', Bengaluru'
  )}`;

  return (
    <section className="checkin-card">
      <button
        type="button"
        className="checkin-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="checkin-header-left">
          <span className="checkin-dot" />
          <span className="checkin-status">
            {phase === 'in-progress' ? 'CLASS IN PROGRESS' : 'CHECK IN'}
          </span>
          <span className="checkin-time-label">{timeLabel}</span>
        </div>
        <span className="checkin-toggle">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div className="checkin-body">
          <div className="checkin-qr-area">
            <div className="checkin-qr-frame">
              <QRCodeSVG
                value={ticketValue}
                size={160}
                bgColor="#ffffff"
                fgColor="#2a2826"
                level="M"
              />
              <div className="qr-corner corner-a" />
              <div className="qr-corner corner-b" />
              <div className="qr-corner corner-c" />
              <div className="qr-corner corner-d" />
            </div>
            <p className="checkin-qr-hint">Show this QR at the venue entrance</p>
          </div>

          <div className="checkin-details">
            <div className="checkin-detail-row">
              <Sparkles size={15} />
              <div>
                <strong>{event.title}</strong>
                <span>with {event.host}</span>
              </div>
            </div>
            <div className="checkin-detail-row">
              <CalendarDays size={15} />
              <div>
                <strong>{event.date}</strong>
                <span>{event.time}</span>
              </div>
            </div>
            <div className="checkin-detail-row">
              <MapPin size={15} />
              <div>
                <strong>{event.studio}</strong>
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="checkin-navigate"
          >
            <Navigation size={15} />
            Navigate to venue
          </a>
        </div>
      )}
    </section>
  );
}
