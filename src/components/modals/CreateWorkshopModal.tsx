import { useState } from 'react';
import type { FormEvent } from 'react';
import { Calendar, Check, Clock, Image as ImageIcon, MapPin, Sparkles, Tag, Users, X } from 'lucide-react';
import { createStudioEvent, type StudioEventInput } from '../../services/studio';
import type { EventItem } from '../../services/events';

interface CreateWorkshopModalProps {
  studioName: string;
  onClose: () => void;
  onEventCreated: (newEvent: EventItem) => void;
}

const PRESET_IMAGES = [
  { label: 'Urban Hip Hop', url: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { label: 'Contemporary Flow', url: 'https://images.pexels.com/photos/3775127/pexels-photo-3775127.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { label: 'Heels & Grooves', url: 'https://images.pexels.com/photos/2820884/pexels-photo-2820884.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { label: 'Afrobeats Vibe', url: 'https://images.pexels.com/photos/2188012/pexels-photo-2188012.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { label: 'Studio Rehearsal', url: 'https://images.pexels.com/photos/2188012/pexels-photo-2188012.jpeg?auto=compress&cs=tinysrgb&w=900' },
];

const STYLE_OPTIONS = [
  'Hip Hop',
  'Contemporary',
  'Heels',
  'Afrobeats',
  'Bollywood',
  'Jazz Funk',
  'Waacking',
  'House',
  'Bachata',
  'Locking',
];

const LOCATION_OPTIONS = [
  'Indiranagar (100ft Road)',
  'Koramangala 4th Block',
  'HSR Layout Sector 2',
  'Church Street (MG Road)',
  'Jayanagar 4th Block',
  'Whitefield (ITPL Road)',
];

export function CreateWorkshopModal({
  studioName,
  onClose,
  onEventCreated,
}: CreateWorkshopModalProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('Hip Hop');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('18:00 - 19:30');
  const [location, setLocation] = useState('Indiranagar (100ft Road)');
  const [host, setHost] = useState('');
  const [price, setPrice] = useState('850');
  const [spots, setSpots] = useState(30);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a workshop title');
      return;
    }
    if (!host.trim()) {
      setError('Please enter an instructor / host name');
      return;
    }

    setLoading(true);
    setError('');

    const eventInput: StudioEventInput = {
      title: title.trim(),
      style,
      date,
      time,
      location,
      studio: studioName || 'Partner Studio',
      host: host.trim(),
      price: price.startsWith('₹') ? price : `₹${price}`,
      spots: Number(spots) || 25,
      image: customImageUrl.trim() || selectedImage,
      featured,
    };

    const { data, error: createErr } = await createStudioEvent(eventInput);
    setLoading(false);

    if (createErr) {
      setError(createErr.message || 'Failed to create workshop. Please try again.');
      return;
    }

    if (data) {
      onEventCreated(data);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="create-workshop-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <span className="section-kicker">Studio Workshop Creator</span>
            <h2>Create New Workshop</h2>
          </div>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="workshop-form">
          {error && <div className="form-alert error">{error}</div>}

          <div className="form-section">
            <span className="form-section-title">
              <Sparkles size={14} /> Basic Workshop Information
            </span>
            <div className="form-grid">
              <label className="field-group full-width">
                <span>Workshop Title *</span>
                <input
                  type="text"
                  placeholder="e.g. Commercial Hip Hop Masterclass"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label className="field-group">
                <span>Dance Style</span>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  {STYLE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-group">
                <span>Instructor / Host *</span>
                <input
                  type="text"
                  placeholder="e.g. Rohan Verma"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <span className="form-section-title">
              <Calendar size={14} /> Schedule & Location
            </span>
            <div className="form-grid">
              <label className="field-group">
                <span>Date *</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>

              <label className="field-group">
                <span>Time Slot (Start - End) *</span>
                <input
                  type="text"
                  placeholder="e.g. 18:00 - 19:30"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </label>

              <label className="field-group full-width">
                <span>Neighborhood & Venue Area</span>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="form-section">
            <span className="form-section-title">
              <Tag size={14} /> Pricing & Capacity
            </span>
            <div className="form-grid">
              <label className="field-group">
                <span>Ticket Price (₹)</span>
                <input
                  type="text"
                  placeholder="850"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </label>

              <label className="field-group">
                <span>Total Spot Capacity</span>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={spots}
                  onChange={(e) => setSpots(Number(e.target.value))}
                  required
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <span className="form-section-title">
              <ImageIcon size={14} /> Workshop Poster Image
            </span>
            <div className="poster-presets-grid">
              {PRESET_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.label}
                  className={`poster-preset-card ${
                    selectedImage === img.url && !customImageUrl ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedImage(img.url);
                    setCustomImageUrl('');
                  }}
                >
                  <img src={img.url} alt={img.label} />
                  <span>{img.label}</span>
                </button>
              ))}
            </div>
            <label className="field-group custom-image-field">
              <span>Or Custom Image URL</span>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
              />
            </label>
          </div>

          <div className="form-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span>Feature this workshop on the top Discover banner</span>
            </label>
          </div>

          <div className="modal-actions-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn submit-workshop-btn"
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Workshop to Discover'}{' '}
              <Check size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
