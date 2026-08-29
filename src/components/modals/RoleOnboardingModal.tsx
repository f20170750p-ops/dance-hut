import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Building2, Check, Sparkles, X } from 'lucide-react';
import type { UserProfile, UserRole } from '../../services/auth';
import { updateProfile } from '../../services/auth';

interface RoleOnboardingModalProps {
  userId: string;
  userEmail: string;
  targetRole: 'studio' | 'choreographer';
  currentProfile: UserProfile | null;
  onComplete: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

const POPULAR_LOCALITIES = [
  'Koramangala 4th Block',
  'Indiranagar (100ft Road)',
  'HSR Layout Sector 2',
  'Church Street (MG Road)',
  'Jayanagar 4th Block',
  'Whitefield',
  'Malleshwaram',
  'JP Nagar',
  'Bellandur',
  'Wilson Garden',
  'Other / Custom Area',
];

export function RoleOnboardingModal({
  userId,
  userEmail,
  targetRole,
  currentProfile,
  onComplete,
  onCancel,
}: RoleOnboardingModalProps) {
  const isStudio = targetRole === 'studio';

  const [studioName, setStudioName] = useState('');
  const [ownerName, setOwnerName] = useState(currentProfile?.display_name || '');
  const [locality, setLocality] = useState(POPULAR_LOCALITIES[0]);
  const [customLocality, setCustomLocality] = useState('');
  const [phone, setPhone] = useState('');

  const [choreoName, setChoreoName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (isStudio && !studioName.trim()) {
      setError('Please provide a Studio Brand Name.');
      return;
    }
    if (!isStudio && !choreoName.trim()) {
      setError('Please provide your Artist / Stage Name.');
      return;
    }

    setSaving(true);

    const existingConfigured = currentProfile?.configured_roles || ['dancer'];
    const updatedConfigured = Array.from(new Set([...existingConfigured, targetRole]));

    const trimmedStudio = studioName.trim();
    const trimmedOwner = ownerName.trim();
    const trimmedChoreo = choreoName.trim();

    const updates = {
      display_name: trimmedOwner || currentProfile?.display_name || 'Owner',
      role: targetRole as UserRole,
      studio_name: isStudio ? trimmedStudio : currentProfile?.studio_name,
      choreo_name: !isStudio ? trimmedChoreo : currentProfile?.choreo_name,
      configured_roles: updatedConfigured as UserRole[],
    };

    const { data, error: updateErr } = await updateProfile(userId, updates);
    setSaving(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    const finalProfile: UserProfile = data || {
      id: userId,
      role: targetRole,
      display_name: updates.display_name,
      email: userEmail,
      studio_name: updates.studio_name,
      choreo_name: updates.choreo_name,
      configured_roles: updatedConfigured as UserRole[],
    };

    try {
      localStorage.setItem('dancehut.activeRole', targetRole);
    } catch {
      // ignore
    }

    onComplete(finalProfile);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="auth-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onCancel}
          aria-label="Cancel onboarding"
        >
          <X size={18} />
        </button>

        <div className="auth-kicker" style={{ color: '#e83b3b' }}>
          {isStudio ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={13} /> Studio Account Setup Required
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} /> Choreographer Profile Setup
            </span>
          )}
        </div>

        <h2 style={{ marginTop: '6px', fontSize: '24px' }}>
          {isStudio ? 'Set Up Your Studio' : 'Create Your Artist Profile'}
        </h2>
        <p style={{ fontSize: '13px', color: '#6a655e', margin: '4px 0 16px' }}>
          {isStudio
            ? `Your email (${userEmail}) doesn't have a Studio profile yet. Complete these basic details to unlock the Studio Management Portal.`
            : `Your email (${userEmail}) doesn't have a Choreographer profile yet. Complete these basic details to unlock your Choreo Suite.`}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isStudio ? (
            <>
              <label className="auth-field">
                Studio / Venue Brand Name *
                <input
                  type="text"
                  placeholder="e.g. The Movement House"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  autoFocus
                  required
                />
              </label>

              <label className="auth-field">
                Owner / Manager Full Name *
                <input
                  type="text"
                  placeholder="e.g. Rutuvi Narang"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </label>

              <label className="auth-field">
                Primary Studio Locality *
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  style={{
                    padding: '11px 13px',
                    borderRadius: '8px',
                    border: '1px solid #dedbd3',
                    background: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                  }}
                >
                  {POPULAR_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>

              {locality === 'Other / Custom Area' && (
                <label className="auth-field">
                  Specific Street / Address *
                  <input
                    type="text"
                    placeholder="e.g. Sarjapur Main Road, Bengaluru"
                    value={customLocality}
                    onChange={(e) => setCustomLocality(e.target.value)}
                    required
                  />
                </label>
              )}

              <label className="auth-field">
                Studio Contact Phone / WhatsApp (Optional)
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <label className="auth-field">
                Artist / Stage Name *
                <input
                  type="text"
                  placeholder="e.g. Aria Chen"
                  value={choreoName}
                  onChange={(e) => setChoreoName(e.target.value)}
                  autoFocus
                  required
                />
              </label>

              <label className="auth-field">
                Real / Full Name
                <input
                  type="text"
                  placeholder="e.g. Rutuvi Narang"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </label>
            </>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #dedbd3',
                background: '#f4f1e8',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Continue as Dancer
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {saving ? 'Creating Profile…' : isStudio ? 'Create Studio & Enter' : 'Create Artist Profile'}{' '}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
