import { useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  ExternalLink,
  MapPin,
  Search,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import type { EventItem } from '../../services/events';

interface Studio {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  description: string;
  image: string;
  amenities: string[];
  capacity: string;
}

const FEATURED_STUDIOS: Studio[] = [
  {
    id: 'studio-21',
    name: 'Studio 21',
    neighborhood: 'Indiranagar',
    address: '100 Feet Rd, Indiranagar, Bengaluru',
    description: 'Premier movement space equipped with imported sprung hardwood floors and touring-grade acoustic soundcraft.',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    amenities: ['Sprung Hardwood Floors', 'Soundcraft Audio', 'Full-Length Mirrors', 'Changing Rooms'],
    capacity: '40 dancers',
  },
  {
    id: 'attakkalari',
    name: 'Attakkalari Centre for Movement Arts',
    neighborhood: 'Wilson Garden',
    address: 'BTS Bus Depot Rd, Wilson Garden, Bengaluru',
    description: 'Iconic contemporary dance sanctuary renowned for masterclasses, cultural residency, and physical theatre workshops.',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80',
    amenities: ['High Ceilings', 'Shock-absorbing Floor', 'Surround Sound', 'Lounge Area'],
    capacity: '50 dancers',
  },
  {
    id: 'bohemian-house',
    name: 'The Bohemian House',
    neighborhood: 'Richmond Town',
    address: 'Wood St, Ashok Nagar, Richmond Town, Bengaluru',
    description: 'Boutique heritage courtyard venue hosting intimate workshops, heels choreography, and expressive movement sessions.',
    image: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=800&q=80',
    amenities: ['Warm Ambient Lighting', 'Acoustic Sound', 'Open Garden Cafe', 'Air Conditioned'],
    capacity: '25 dancers',
  },
  {
    id: 'play-studio',
    name: 'Play Studio',
    neighborhood: 'Koramangala',
    address: '5th Block, Koramangala, Bengaluru',
    description: 'High-energy urban dance studio built for commercial hip-hop, popping, locking, and viral choreography creation.',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Dual Mirror Walls', 'Subwoofer Array', 'Dynamic RGB Lighting', 'Locker Facility'],
    capacity: '35 dancers',
  },
  {
    id: 'left-foot-first',
    name: 'Left Foot First Dance Studio',
    neighborhood: 'Koramangala',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru',
    description: 'Community-driven dance hub focused on breaking, afro-grooves, and building authentic street culture in South Bengaluru.',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&w=800&q=80',
    amenities: ['Cushioned Dance Floor', 'Mobile DJ Booth', 'Community Chill Zone', 'Filtered Water'],
    capacity: '30 dancers',
  },
];

interface StudioExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  onSelectStudio: (studioName: string) => void;
}

export function StudioExplorerModal({
  isOpen,
  onClose,
  events,
  onSelectStudio,
}: StudioExplorerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');

  const neighborhoods = useMemo(() => {
    const list = Array.from(new Set(FEATURED_STUDIOS.map((s) => s.neighborhood)));
    return ['All', ...list];
  }, []);

  const filteredStudios = useMemo(() => {
    return FEATURED_STUDIOS.filter((s) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchNeighborhood =
        selectedNeighborhood === 'All' || s.neighborhood === selectedNeighborhood;
      return matchSearch && matchNeighborhood;
    });
  }, [searchQuery, selectedNeighborhood]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="studio-explorer-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close studio explorer">
          <X size={18} />
        </button>

        <div className="studio-explorer-header">
          <div className="studio-explorer-kicker">
            <Building2 size={15} /> Partner Studio Directory
          </div>
          <h2>Explore Dance Spaces in Bengaluru</h2>
          <p>
            Browse premium dance studios with verified acoustics, sprung floors, and scheduled
            workshops.
          </p>

          <div className="studio-search-controls">
            <div className="search-box explorer-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search studios by name, area, or amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="neighborhood-chips">
              {neighborhoods.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`neighborhood-chip ${selectedNeighborhood === n ? 'active' : ''}`}
                  onClick={() => setSelectedNeighborhood(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="studio-cards-list">
          {filteredStudios.map((studio) => {
            const studioEvents = events.filter((e) =>
              e.studio.toLowerCase().includes(studio.name.toLowerCase())
            );
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${studio.name}, ${studio.address}`
            )}`;

            return (
              <div className="studio-explorer-card" key={studio.id}>
                <div className="studio-card-media">
                  <img src={studio.image} alt={studio.name} />
                  <span className="studio-neighborhood-pill">
                    <MapPin size={12} /> {studio.neighborhood}
                  </span>
                  <span className="studio-capacity-pill">Cap: {studio.capacity}</span>
                </div>
                <div className="studio-card-content">
                  <div className="studio-card-top">
                    <div>
                      <h3>{studio.name}</h3>
                      <p className="studio-card-address">{studio.address}</p>
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="studio-maps-btn"
                      title="Open in Google Maps"
                    >
                      <ExternalLink size={14} />
                      <span>Directions</span>
                    </a>
                  </div>

                  <p className="studio-card-desc">{studio.description}</p>

                  <div className="studio-amenities-row">
                    {studio.amenities.map((amenity) => (
                      <span className="amenity-tag" key={amenity}>
                        <Zap size={11} /> {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="studio-card-actions">
                    <div className="studio-event-count">
                      <CalendarDays size={14} />
                      <span>
                        <strong>{studioEvents.length}</strong> {studioEvents.length === 1 ? 'class' : 'classes'} scheduled
                      </span>
                    </div>
                    <button
                      type="button"
                      className="primary-btn studio-view-workshops-btn"
                      onClick={() => {
                        onSelectStudio(studio.name);
                        onClose();
                      }}
                    >
                      Browse classes <Sparkles size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredStudios.length === 0 && (
            <div className="empty-state">
              <Building2 size={32} />
              <h3>No studios match your filter</h3>
              <p>Try searching for a different neighborhood or amenity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
