import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Building2,
  Check,
  ExternalLink,
  Instagram,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import type { UserProfile } from '../../services/auth';

interface StudioProfileTabProps {
  profile: UserProfile | null;
  onUpdateProfile: (updated: UserProfile) => void;
}

const AMENITIES_LIST = [
  'Sprung Wooden Dance Floor',
  'Full-Length Wall Mirrors',
  'Professional Sound System & Bluetooth',
  'Air Conditioned Hall',
  'Separate Changing Rooms & Washrooms',
  'Drinking Water & Lounge Area',
  'Dedicated Vehicle Parking',
  'Front-Desk Reception & Waiting Lobby',
];

export function StudioProfileTab({
  profile,
  onUpdateProfile,
}: StudioProfileTabProps) {
  const [studioName, setStudioName] = useState(
    profile?.display_name || 'Step & Groove Dance Studio'
  );
  const [neighborhood, setNeighborhood] = useState('Indiranagar, Bengaluru');
  const [address, setAddress] = useState(
    '12, 100ft Road, Opposite Toit, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038'
  );
  const [phone, setPhone] = useState('+91 98765 43210');
  const [instagram, setInstagram] = useState('@stepandgroove_blr');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Sprung Wooden Dance Floor',
    'Full-Length Wall Mirrors',
    'Professional Sound System & Bluetooth',
    'Air Conditioned Hall',
    'Separate Changing Rooms & Washrooms',
    'Drinking Water & Lounge Area',
  ]);

  const [rooms, setRooms] = useState<{ id: string; name: string; capacity: number }[]>([
    { id: '1', name: 'Main Studio A (Wooden Floor)', capacity: 35 },
    { id: '2', name: 'Practice Room B (Mirrors)', capacity: 15 },
  ]);

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCap, setNewRoomCap] = useState(20);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    setRooms((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newRoomName.trim(),
        capacity: Number(newRoomCap) || 20,
      },
    ]);
    setNewRoomName('');
    setNewRoomCap(20);
  };

  const handleRemoveRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    if (profile) {
      onUpdateProfile({
        ...profile,
        display_name: studioName.trim(),
      });
    }

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${studioName}, ${address}`
  )}`;

  return (
    <div className="tab-view studio-profile-view">
      <div className="tab-heading-row">
        <div>
          <span className="section-kicker">Studio Management</span>
          <h2>Studio Space & Profile Settings</h2>
          <p>
            Configure your studio location, amenities, and room capacities for workshop hosting.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving Changes...' : savedSuccess ? 'Saved!' : 'Save Changes'}{' '}
          <Save size={16} />
        </button>
      </div>

      {savedSuccess && (
        <div className="form-alert success" style={{ marginBottom: '24px' }}>
          <Check size={16} /> Studio profile and space details updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="studio-settings-grid">
        {/* Studio Identity Card */}
        <div className="settings-card">
          <div className="settings-card-head">
            <Building2 size={18} />
            <h3>Studio Identity & Contact</h3>
          </div>

          <div className="settings-fields">
            <label className="field-group full-width">
              <span>Studio Name</span>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                required
              />
            </label>

            <label className="field-group">
              <span>Primary Neighborhood / Area</span>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                required
              />
            </label>

            <label className="field-group">
              <span>WhatsApp / Contact Number</span>
              <div className="input-with-icon">
                <Phone size={15} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </label>

            <label className="field-group full-width">
              <span>Instagram Handle</span>
              <div className="input-with-icon">
                <Instagram size={15} />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Location & Google Maps */}
        <div className="settings-card">
          <div className="settings-card-head">
            <MapPin size={18} />
            <h3>Venue Address & Maps Pin</h3>
          </div>

          <div className="settings-fields">
            <label className="field-group full-width">
              <span>Full Physical Address</span>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </label>

            <div className="maps-preview-box">
              <span>Google Maps Link (Auto-generated for Dancer Tickets):</span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="maps-external-link"
              >
                <span>{studioName}, {neighborhood}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Studio Amenities */}
        <div className="settings-card full-width">
          <div className="settings-card-head">
            <Sparkles size={18} />
            <h3>Studio Amenities & Features</h3>
          </div>

          <div className="amenities-checkboxes-grid">
            {AMENITIES_LIST.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  className={`amenity-chip-toggle ${isChecked ? 'active' : ''}`}
                  onClick={() => toggleAmenity(amenity)}
                >
                  <span className="amenity-check-box">
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Room / Hall Management */}
        <div className="settings-card full-width">
          <div className="settings-card-head">
            <Users size={18} />
            <h3>Studio Dance Rooms & Capacity</h3>
          </div>

          <div className="rooms-list-container">
            {rooms.map((room) => (
              <div key={room.id} className="room-row-card">
                <div className="room-info">
                  <strong>{room.name}</strong>
                  <span>Max Capacity: {room.capacity} dancers</span>
                </div>
                <button
                  type="button"
                  className="room-delete-btn"
                  onClick={() => handleRemoveRoom(room.id)}
                  title="Remove room"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <div className="add-room-inline-form">
              <input
                type="text"
                placeholder="New room name (e.g. Studio Hall 2)..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <input
                type="number"
                min="5"
                max="100"
                placeholder="Cap."
                value={newRoomCap}
                onChange={(e) => setNewRoomCap(Number(e.target.value))}
                style={{ width: '90px' }}
              />
              <button
                type="button"
                className="add-room-btn"
                onClick={handleAddRoom}
                disabled={!newRoomName.trim()}
              >
                <Plus size={15} /> Add Room
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
