import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Check,
  Flame,
  Globe,
  Instagram,
  Play,
  Save,
  Sparkles,
  Tag,
  Video,
  Youtube,
} from 'lucide-react';
import {
  DANCE_STYLE_OPTIONS,
  getChoreoProfile,
  saveChoreoProfile,
  type ChoreoProfileData,
} from '../../services/choreo';

interface ChoreoProfileTabProps {
  userId: string;
  currentUserName: string;
  onProfileUpdated?: (name: string) => void;
}

export function ChoreoProfileTab({
  userId,
  currentUserName,
  onProfileUpdated,
}: ChoreoProfileTabProps) {
  const [profile, setProfile] = useState<ChoreoProfileData>({
    stageName: currentUserName || '',
    bio: '',
    yearsExperience: 5,
    signatureStyles: ['Hip Hop', 'Urban Choreo'],
    instagramHandle: '@ananya_roy_dance',
    videoReelUrl: 'https://youtube.com/shorts/demo-dance-reel',
    credentials: 'Ex-Crew Captain & Dance Educator • Taught 50+ Masterclasses',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getChoreoProfile(userId).then((data) => {
      setProfile((prev) => ({
        ...data,
        stageName: data.stageName || currentUserName || prev.stageName,
      }));
      setLoading(false);
    });
  }, [userId, currentUserName]);

  const handleToggleStyle = (style: string) => {
    setProfile((prev) => {
      const exists = prev.signatureStyles.includes(style);
      return {
        ...prev,
        signatureStyles: exists
          ? prev.signatureStyles.filter((s) => s !== style)
          : [...prev.signatureStyles, style],
      };
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedSuccess(false);

    const result = await saveChoreoProfile(userId, profile);
    setSaving(false);

    if (result.error) {
      setError(result.error.message || 'Failed to update choreographer profile.');
      return;
    }

    setSavedSuccess(true);
    if (onProfileUpdated && profile.stageName) {
      onProfileUpdated(profile.stageName);
    }

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  if (loading) {
    return <div className="auth-loading">Loading portfolio…</div>;
  }

  return (
    <div className="tab-view choreo-profile-view">
      <div className="tab-heading-row">
        <div>
          <span className="section-kicker">Choreographer Portfolio</span>
          <h2>Artist & Instructor Profile</h2>
          <p>Showcase your signature dance styles, video showreels, and social presence to dancers.</p>
        </div>
      </div>

      <div className="choreo-profile-layout">
        {/* Left Column: Editor Form */}
        <form onSubmit={handleSave} className="choreo-profile-form">
          {error && <div className="form-alert error">{error}</div>}
          {savedSuccess && (
            <div className="form-alert success">
              <Check size={16} /> Profile & portfolio updated successfully!
            </div>
          )}

          {/* Section 1: Basic Stage Identity */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <Sparkles size={16} />
              <h3>Artist Identity & Bio</h3>
            </div>

            <div className="form-grid">
              <label className="field-group">
                <span>Stage / Professional Name *</span>
                <input
                  type="text"
                  value={profile.stageName}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, stageName: e.target.value }))
                  }
                  placeholder="e.g. Ananya Roy"
                  required
                />
              </label>

              <label className="field-group">
                <span>Years of Teaching Experience</span>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={profile.yearsExperience}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      yearsExperience: Number(e.target.value) || 1,
                    }))
                  }
                  required
                />
              </label>

              <label className="field-group full-width">
                <span>Instructor Bio & Teaching Philosophy</span>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell dancers about your background, energy, and what they will learn in your classes..."
                  required
                />
              </label>

              <label className="field-group full-width">
                <span>Key Credentials & Dance Crews</span>
                <input
                  type="text"
                  value={profile.credentials}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, credentials: e.target.value }))
                  }
                  placeholder="e.g. Crew Captain @ 080 Dancers • National Battle Finalist"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Signature Dance Styles */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <Tag size={16} />
              <h3>Signature Dance Styles</h3>
            </div>
            <p className="section-hint">Select the styles you teach to help dancers find your masterclasses:</p>

            <div className="style-chips-selector">
              {DANCE_STYLE_OPTIONS.map((style) => {
                const isSelected = profile.signatureStyles.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    className={`style-selector-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleStyle(style)}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                    <span>{style}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Social & Video Showcase */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <Video size={16} />
              <h3>Socials & Video Showreel</h3>
            </div>

            <div className="form-grid">
              <label className="field-group">
                <span>
                  <Instagram size={14} /> Instagram Handle
                </span>
                <input
                  type="text"
                  value={profile.instagramHandle}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      instagramHandle: e.target.value,
                    }))
                  }
                  placeholder="@your_dance_handle"
                />
              </label>

              <label className="field-group">
                <span>
                  <Youtube size={14} /> Video Reel / Choreography Link
                </span>
                <input
                  type="url"
                  value={profile.videoReelUrl}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      videoReelUrl: e.target.value,
                    }))
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </label>
            </div>
          </div>

          <div className="profile-submit-row">
            <button
              type="submit"
              className="primary-btn save-portfolio-btn"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Portfolio Changes'}
            </button>
          </div>
        </form>

        {/* Right Column: Live Portfolio Preview Card */}
        <div className="choreo-preview-pane">
          <span className="preview-pane-label">
            <Sparkles size={14} /> Live Dancer View
          </span>

          <div className="choreo-public-card">
            <div className="public-card-cover">
              <div className="choreo-avatar-circle">
                {profile.stageName ? profile.stageName.slice(0, 2).toUpperCase() : 'AR'}
              </div>
            </div>

            <div className="public-card-body">
              <div className="public-card-header">
                <h3>{profile.stageName || 'Artist Name'}</h3>
                <span className="badge-choreo">
                  <Flame size={12} /> Choreographer
                </span>
              </div>

              <span className="public-card-exp">
                {profile.yearsExperience}+ years teaching in Bengaluru
              </span>

              <p className="public-card-bio">
                {profile.bio ||
                  'Passionate dance instructor leading high-energy choreography workshops.'}
              </p>

              {profile.credentials && (
                <div className="public-card-credentials">
                  <small>🏆 {profile.credentials}</small>
                </div>
              )}

              <div className="public-card-styles">
                <span className="styles-label">Specialties:</span>
                <div className="styles-tags-list">
                  {profile.signatureStyles.map((st) => (
                    <span key={st} className="style-tag-pill">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="public-card-links">
                {profile.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="public-link-chip"
                  >
                    <Instagram size={14} /> {profile.instagramHandle}
                  </a>
                )}
                {profile.videoReelUrl && (
                  <a
                    href={profile.videoReelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="public-link-chip video-chip"
                  >
                    <Play size={12} fill="currentColor" /> Watch Showreel
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
