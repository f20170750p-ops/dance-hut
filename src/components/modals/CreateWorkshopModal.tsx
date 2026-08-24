import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Flame,
  Image as ImageIcon,
  MapPin,
  Music2,
  Sparkles,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { createStudioEvent, type StudioEventInput } from '../../services/studio';
import type { EventItem } from '../../services/events';
import type { UserRole } from '../../services/auth';
import { DANCE_STYLE_OPTIONS, SKILL_LEVELS } from '../../services/choreo';

interface CreateWorkshopModalProps {
  studioName: string;
  creatorRole?: UserRole;
  onClose: () => void;
  onEventCreated: (newEvent: EventItem) => void;
}

const PRESET_IMAGES = [
  { id: 'hiphop', label: 'Urban Hip Hop', url: 'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 'contemporary', label: 'Contemporary Flow', url: 'https://images.pexels.com/photos/3775127/pexels-photo-3775127.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 'heels', label: 'Heels & Grooves', url: 'https://images.pexels.com/photos/2820884/pexels-photo-2820884.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 'afro', label: 'Afrobeats Vibe', url: 'https://images.pexels.com/photos/2188012/pexels-photo-2188012.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 'rehearsal', label: 'Studio Rehearsal', url: 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=900' },
];

const VERIFIED_NEIGHBOURHOODS = [
  'Koramangala 4th Block',
  'Koramangala 5th Block',
  'Indiranagar (100ft Road)',
  'Indiranagar (12th Main)',
  'HSR Layout Sector 2',
  'HSR Layout Sector 4',
  'Church Street (MG Road)',
  'Jayanagar 4th Block',
  'Whitefield (ITPB Main Rd)',
  'Malleshwaram 8th Cross',
  'JP Nagar 2nd Phase',
  'Bellandur Outer Ring Rd',
  'Wilson Garden',
  'Kalyan Nagar (HRBR Layout)',
  'Other / Custom Locality',
];

const PARTNER_VENUES = [
  { name: 'Step & Groove Studio', area: 'Koramangala 4th Block' },
  { name: 'Lourd Vijay Dance Studio', area: 'Indiranagar (100ft Road)' },
  { name: 'Left Foot Right Danceworks', area: 'HSR Layout Sector 2' },
  { name: 'Attakkalari Centre for Movement Arts', area: 'Wilson Garden' },
  { name: 'Nnritya Dance Studio', area: 'Church Street (MG Road)' },
  { name: 'The Tribe Dance Space', area: 'Jayanagar 4th Block' },
  { name: 'Custom Studio / Venue', area: 'Bengaluru' },
];

export function CreateWorkshopModal({
  studioName,
  creatorRole = 'studio',
  onClose,
  onEventCreated,
}: CreateWorkshopModalProps) {
  const isChoreo = creatorRole === 'choreographer';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [songTrack, setSongTrack] = useState('');
  const [level, setLevel] = useState(SKILL_LEVELS[0]);
  const [style, setStyle] = useState(DANCE_STYLE_OPTIONS[0]);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('18:00 - 19:30');
  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState(0);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(VERIFIED_NEIGHBOURHOODS[0]);
  const [customStudioName, setCustomStudioName] = useState(isChoreo ? '' : studioName || '');
  const [customLocation, setCustomLocation] = useState('');
  const [host, setHost] = useState(isChoreo ? studioName || '' : '');
  const [price, setPrice] = useState('850');
  const [spots, setSpots] = useState(25);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_IMAGES[0].id);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCustomPartner = isChoreo && selectedPartnerIndex === PARTNER_VENUES.length - 1;
  const isCustomLoc = selectedNeighbourhood === 'Other / Custom Locality';

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

    let finalStudio = '';
    let finalLocation = '';

    if (!isChoreo) {
      // Studio role: Locked to registered studio name
      finalStudio = studioName.trim() || customStudioName.trim() || 'Dance Studio';
      finalLocation = isCustomLoc
        ? customLocation.trim() || 'Bengaluru'
        : selectedNeighbourhood;
    } else {
      // Choreo role
      const partner = PARTNER_VENUES[selectedPartnerIndex];
      finalStudio = isCustomPartner ? customStudioName.trim() || 'Dance Studio' : partner.name;
      finalLocation = isCustomPartner ? customLocation.trim() || 'Bengaluru' : partner.area;
    }

    const fullTitle =
      isChoreo && songTrack.trim()
        ? `${title.trim()} (${songTrack.trim()})`
        : title.trim();

    const eventInput: StudioEventInput = {
      title: fullTitle,
      style,
      date,
      time,
      location: finalLocation,
      studio: isChoreo ? finalStudio : (studioName || finalStudio),
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
            <span className="section-kicker">
              {isChoreo ? 'Choreographer Creator Suite' : 'Studio Workshop Creator'}
            </span>
            <h2>{isChoreo ? 'Host a New Masterclass' : 'Create New Workshop'}</h2>
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

          {/* Section 1: Routine & Style Info */}
          <div className="form-section">
            <span className="form-section-title">
              <Sparkles size={14} /> Workshop & Choreography Details
            </span>
            <div className="form-grid">
              <label className="field-group full-width">
                <span>Routine / Workshop Title *</span>
                <input
                  type="text"
                  placeholder={
                    isChoreo
                      ? 'e.g. Urban Choreography Intensive'
                      : 'e.g. Commercial Hip Hop Masterclass'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              {isChoreo && (
                <label className="field-group">
                  <span>
                    <Music2 size={13} /> Routine Song Track / Artist
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Too Sweet — Hozier"
                    value={songTrack}
                    onChange={(e) => setSongTrack(e.target.value)}
                  />
                </label>
              )}

              <label className="field-group">
                <span>Skill Level</span>
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-group">
                <span>Dance Style</span>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  {DANCE_STYLE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-group">
                <span>Instructor / Host Name *</span>
                <input
                  type="text"
                  placeholder="e.g. Ananya Roy"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>

          {/* Section 2: Schedule & Studio Venue */}
          <div className="form-section">
            <span className="form-section-title">
              <Calendar size={14} /> Schedule & Studio Venue
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

              {!isChoreo ? (
                <>
                  <label className="field-group full-width">
                    <span>Registered Studio Venue</span>
                    <input
                      type="text"
                      value={studioName || 'Dance Studio'}
                      disabled
                      style={{ background: '#ebe8e1', color: '#4a4640', cursor: 'not-allowed', fontWeight: 600 }}
                    />
                  </label>

                  <label className="field-group full-width">
                    <span>Verified Neighbourhood / City Zone *</span>
                    <select
                      value={selectedNeighbourhood}
                      onChange={(e) => setSelectedNeighbourhood(e.target.value)}
                    >
                      {VERIFIED_NEIGHBOURHOODS.map((nh) => (
                        <option key={nh} value={nh}>
                          {nh}
                        </option>
                      ))}
                    </select>
                  </label>

                  {isCustomLoc && (
                    <label className="field-group full-width">
                      <span>Specify Custom Locality / Address *</span>
                      <input
                        type="text"
                        placeholder="e.g. Sarjapur Main Road, Bengaluru"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        required
                      />
                    </label>
                  )}
                </>
              ) : (
                <>
                  <label className="field-group full-width">
                    <span>Partner Dance Studio Venue *</span>
                    <select
                      value={selectedPartnerIndex}
                      onChange={(e) => setSelectedPartnerIndex(Number(e.target.value))}
                    >
                      {PARTNER_VENUES.map((ven, idx) => (
                        <option key={ven.name} value={idx}>
                          {ven.name} ({ven.area})
                        </option>
                      ))}
                    </select>
                  </label>

                  {isCustomPartner && (
                    <>
                      <label className="field-group">
                        <span>Custom Studio / Space Name *</span>
                        <input
                          type="text"
                          placeholder="e.g. Dance District Bangalore"
                          value={customStudioName}
                          onChange={(e) => setCustomStudioName(e.target.value)}
                          required
                        />
                      </label>
                      <label className="field-group">
                        <span>Neighborhood / Area *</span>
                        <input
                          type="text"
                          placeholder="e.g. Indiranagar 12th Main"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          required
                        />
                      </label>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Section 3: Pricing & Capacity */}
          <div className="form-section">
            <span className="form-section-title">
              <Tag size={14} /> Pricing & Spot Capacity
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
                <span>Total Spots Cap</span>
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

          {/* Section 4: Workshop Poster */}
          <div className="form-section">
            <span className="form-section-title">
              <ImageIcon size={14} /> Workshop Poster Art
            </span>
            <div className="poster-presets-grid">
              {PRESET_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.id}
                  className={`poster-preset-card ${
                    selectedPresetId === img.id && !customImageUrl ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedPresetId(img.id);
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
              <span>Or Custom Poster URL</span>
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
              {loading ? 'Publishing...' : isChoreo ? 'Launch Masterclass' : 'Publish Workshop to Discover'}{' '}
              <Check size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
