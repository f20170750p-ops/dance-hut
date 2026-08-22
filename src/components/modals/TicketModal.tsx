import { CalendarDays, Check, MapPin, Sparkles, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { EventItem } from '../../services/events';

interface TicketModalProps {
  event: EventItem;
  bookingId: number | null;
  onClose: () => void;
}

export function TicketModal({ event, bookingId, onClose }: TicketModalProps) {
  const ticketValue = `dancehut:booking:${bookingId ?? event.id}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close ticket">
          <X size={18} />
        </button>
        <div className="ticket-success">
          <span>
            <Check size={18} />
          </span>
          <small>BOOKING SUCCESSFUL</small>
        </div>
        <h2>Your spot is saved.</h2>
        <p>Show this ticket at the venue entrance.</p>
        <div className="qr-frame">
          <QRCodeSVG
            value={ticketValue}
            size={146}
            bgColor="#ffffff"
            fgColor="#2a2826"
            level="M"
          />
          <div className="qr-corner corner-a" />
          <div className="qr-corner corner-b" />
          <div className="qr-corner corner-c" />
          <div className="qr-corner corner-d" />
        </div>
        <div className="ticket-details">
          <div>
            <CalendarDays size={15} />
            <span>
              <strong>{event.date}</strong>
              {event.time}
            </span>
          </div>
          <div>
            <MapPin size={15} />
            <span>
              <strong>{event.studio}</strong>
              {event.location}
            </span>
          </div>
          <div>
            <Sparkles size={15} />
            <span>
              <strong>{event.title}</strong>
              with {event.host}
            </span>
          </div>
        </div>
        <button className="primary-btn book-btn" onClick={onClose}>
          Done <Check size={17} />
        </button>
      </div>
    </div>
  );
}
