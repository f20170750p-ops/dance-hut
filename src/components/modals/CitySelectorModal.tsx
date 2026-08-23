import { useState } from 'react';
import { Check, MapPin, Sparkles, X } from 'lucide-react';

export interface CityItem {
  id: string;
  name: string;
  isLive: boolean;
}

const CITIES: CityItem[] = [
  { id: 'bengaluru', name: 'Bengaluru', isLive: true },
  { id: 'mumbai', name: 'Mumbai', isLive: false },
  { id: 'delhi-ncr', name: 'Delhi NCR', isLive: false },
  { id: 'hyderabad', name: 'Hyderabad', isLive: false },
  { id: 'pune', name: 'Pune', isLive: false },
  { id: 'goa', name: 'Goa', isLive: false },
  { id: 'chennai', name: 'Chennai', isLive: false },
  { id: 'kolkata', name: 'Kolkata', isLive: false },
  { id: 'chandigarh', name: 'Chandigarh', isLive: false },
  { id: 'jaipur', name: 'Jaipur', isLive: false },
];

interface CitySelectorModalProps {
  currentCity: string;
  onSelectCity: (cityName: string) => void;
  onClose: () => void;
}

export function CitySelectorModal({
  currentCity,
  onSelectCity,
  onClose,
}: CitySelectorModalProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleCityClick = (city: CityItem) => {
    if (city.isLive) {
      onSelectCity(city.name);
      onClose();
    } else {
      setToastMsg(`Launching in ${city.name} soon! Stay tuned 🚀`);
      setTimeout(() => {
        setToastMsg(null);
      }, 3500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="city-selector-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close city selector"
        >
          <X size={16} />
        </button>

        <div className="city-modal-head">
          <div className="city-modal-title">
            <span className="city-modal-pin">
              <MapPin size={18} />
            </span>
            <h2>Select City</h2>
          </div>
          <p className="city-modal-sub">
            Currently live in Bengaluru • Expanding rapidly to new cities
          </p>
        </div>

        {toastMsg && (
          <div className="city-compact-toast">
            <Sparkles size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="city-chicklets-section">
          <span className="city-section-label">Live Now</span>
          <div className="city-chicklets-wrap">
            {CITIES.filter((c) => c.isLive).map((city) => {
              const isSelected =
                currentCity.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  type="button"
                  key={city.id}
                  className={`city-chicklet live ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCityClick(city)}
                >
                  <span className="chicklet-dot" />
                  <span className="chicklet-name">{city.name}</span>
                  {isSelected && <Check size={14} className="chicklet-check" />}
                </button>
              );
            })}
          </div>

          <span className="city-section-label" style={{ marginTop: '16px' }}>
            Coming Soon
          </span>
          <div className="city-chicklets-wrap">
            {CITIES.filter((c) => !c.isLive).map((city) => (
              <button
                type="button"
                key={city.id}
                className="city-chicklet upcoming"
                onClick={() => handleCityClick(city)}
                title={`Click to stay tuned for ${city.name}`}
              >
                <span className="chicklet-name">{city.name}</span>
                <span className="chicklet-badge">Soon</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
