import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import type { UserRole } from '../../services/auth';

interface ContactModalProps {
  onClose: () => void;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
  currentUserRole?: UserRole | string;
}

type IssueCategory =
  | 'bug'
  | 'booking'
  | 'account'
  | 'studio_workshop'
  | 'feature'
  | 'other';

const CATEGORIES: { id: IssueCategory; label: string; iconDesc: string }[] = [
  { id: 'bug', label: 'Bug / Technical Issue', iconDesc: 'App error or glitch' },
  { id: 'booking', label: 'Booking & Ticket Help', iconDesc: 'Pass, QR or payment' },
  { id: 'account', label: 'Account & Profile', iconDesc: 'Login or details' },
  { id: 'studio_workshop', label: 'Studio & Workshop', iconDesc: 'Hosting or hosting query' },
  { id: 'feature', label: 'Feature Request', iconDesc: 'Idea or improvement' },
  { id: 'other', label: 'General Feedback', iconDesc: 'Questions for team' },
];

export function ContactModal({
  onClose,
  currentUserEmail = '',
  currentUserName = '',
  currentUserRole = 'dancer',
}: ContactModalProps) {
  const [name, setName] = useState(currentUserName || '');
  const [email, setEmail] = useState(currentUserEmail || '');
  const [category, setCategory] = useState<IssueCategory>('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [error, setError] = useState('');

  const adminEmail = 'admin@dancehut.com';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !message.trim()) {
      setError('Please provide your email and describe the issue.');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate dispatching contact email request to backend / admin mailbox
      await new Promise((resolve) => setTimeout(resolve, 650));

      const refId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketRef(refId);

      // Persist in local storage support tickets list for in-app tracking
      try {
        const existing = JSON.parse(localStorage.getItem('dancehut.support_tickets') || '[]');
        const newTicket = {
          id: refId,
          name: name.trim() || 'Anonymous',
          email: email.trim(),
          category,
          priority,
          subject: subject.trim() || CATEGORIES.find((c) => c.id === category)?.label,
          message: message.trim(),
          role: currentUserRole,
          createdAt: new Date().toISOString(),
          status: 'received',
        };
        localStorage.setItem('dancehut.support_tickets', JSON.stringify([newTicket, ...existing]));
      } catch {
        // ignore
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit contact message:', err);
      setError('Unable to send message right now. Please try again or email admin@dancehut.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMailClient = () => {
    const formattedSubject = encodeURIComponent(
      `[DanceHut Support] ${subject || category} - ${name || 'User'}`
    );
    const formattedBody = encodeURIComponent(
      `Hi Dance Hut Admins,\n\nName: ${name}\nEmail: ${email}\nRole: ${currentUserRole}\nCategory: ${category}\nPriority: ${priority}\n\nDetails:\n${message}\n`
    );
    window.location.href = `mailto:${adminEmail}?subject=${formattedSubject}&body=${formattedBody}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="contact-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="contact-success-state">
            <div className="contact-success-icon">
              <CheckCircle2 size={36} />
            </div>
            {ticketRef && (
              <span className="contact-ticket-pill">Ticket #{ticketRef}</span>
            )}
            <h3>Support Request Received</h3>
            <p>
              Thank you! Our support and admin team have received your request. We will review
              your ticket and follow up at <strong>{email}</strong> as soon as possible.
            </p>
            <div className="contact-success-actions">
              <button
                type="button"
                className="primary-btn contact-done-btn"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="contact-modal-head">
              <div className="contact-header-badge">
                <Mail size={18} />
              </div>
              <div>
                <h2 id="contact-modal-title">Contact Support & Admins</h2>
                <p>
                  Facing an issue or need assistance? Drop a message to our admin team.
                </p>
              </div>
            </div>

            {error && (
              <div className="contact-error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <div className="form-field">
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-email">Your Email *</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Issue Category</label>
                <div className="category-pills">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-pill ${category === cat.id ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="Brief summary of the issue (e.g. Booking confirmation not showing)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="contact-message">Describe the issue *</label>
                  <div className="priority-toggle">
                    <span className="priority-label">Urgency:</span>
                    <button
                      type="button"
                      className={`priority-btn ${priority === 'normal' ? 'active' : ''}`}
                      onClick={() => setPriority('normal')}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      className={`priority-btn urgent ${priority === 'urgent' ? 'active' : ''}`}
                      onClick={() => setPriority('urgent')}
                    >
                      Urgent
                    </button>
                  </div>
                </div>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Please describe what happened, steps to reproduce, or any questions for our admins..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="contact-form-footer">
                <button
                  type="button"
                  className="contact-alt-link"
                  onClick={handleOpenMailClient}
                  title="Open your email app with this message"
                >
                  <MessageSquare size={14} />
                  <span>Open in Mail app</span>
                </button>

                <div className="contact-btn-group">
                  <button
                    type="button"
                    className="contact-cancel-btn"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="spin-icon" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send to Admins</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
