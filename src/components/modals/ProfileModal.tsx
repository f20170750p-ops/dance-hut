import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Building2, Check, Lock, Sparkles, UserRound, Users, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import {
  getDisplayName,
  getInitials,
  updateProfile,
  type UserProfile,
  type UserRole,
} from '../../services/auth';

interface ProfileModalProps {
  user: User;
  profile: UserProfile | null;
  currentRole: UserRole;
  activeBookingsCount: number;
  savedCount: number;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => void;
  onSignOut: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function ProfileModal({
  user,
  profile,
  currentRole,
  activeBookingsCount,
  savedCount,
  onClose,
  onUpdate,
  onSignOut,
  onNavigateTab,
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(
    profile?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || ''
  );
  const [studioName, setStudioName] = useState(
    profile?.studio_name || user.user_metadata?.studio_name || ''
  );
  const [choreoName, setChoreoName] = useState(
    profile?.choreo_name || user.user_metadata?.choreo_name || ''
  );

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const configuredRoles: UserRole[] = profile?.configured_roles ||
    (user.user_metadata?.configured_roles as UserRole[] | undefined) ||
    (profile?.role ? [profile.role] : [currentRole]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isConfigured = (r: UserRole) => {
    return configuredRoles.includes(r);
  };

  const previewName = selectedRole === 'studio'
    ? studioName.trim() || 'Dance Studio'
    : selectedRole === 'choreographer'
    ? choreoName.trim() || displayName.trim() || 'Choreographer'
    : displayName.trim() || getDisplayName(profile, user);

  const previewInitials = getInitials(previewName);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (selectedRole === 'studio' && !studioName.trim()) {
      setError('Please provide your registered Studio Name.');
      return;
    }
    if (selectedRole === 'choreographer' && !choreoName.trim() && !displayName.trim()) {
      setError('Please provide your Stage / Artist Name.');
      return;
    }

    setSaving(true);

    const trimmedName = displayName.trim();
    const trimmedStudio = studioName.trim();
    const trimmedChoreo = choreoName.trim();

    const { data, error: updateErr } = await updateProfile(user.id, {
      display_name: trimmedName,
      role: selectedRole,
      studio_name: trimmedStudio || null,
      choreo_name: trimmedChoreo || null,
      configured_roles: configuredRoles,
    });

    setSaving(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    const updatedProfile: UserProfile = data || {
      id: user.id,
      role: selectedRole,
      display_name: trimmedName,
      email: user.email ?? null,
      studio_name: trimmedStudio || null,
      choreo_name: trimmedChoreo || null,
      configured_roles: configuredRoles,
    };

    try {
      localStorage.setItem('dancehut.activeRole', selectedRole);
    } catch {
      // ignore
    }

    onUpdate(updatedProfile);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const roleOptions: { id: UserRole; label: string; icon: typeof UserRound }[] = [
    { id: 'dancer', label: 'Dancer', icon: UserRound },
    { id: 'choreographer', label: 'Choreographer', icon: Sparkles },
    { id: 'studio', label: 'Studio', icon: Users },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close profile"
        >
          <X size={18} />
        </button>

        <div className="profile-modal-head">
          <div className="profile-modal-avatar">{previewInitials}</div>
          <div className="profile-modal-meta">
            <h2>{previewName}</h2>
            <span>{user.email}</span>
          </div>
        </div>

        {/* Dancer Metrics Only */}
        {selectedRole === 'dancer' && (
          <div className="profile-stats-row">
            <div className="profile-stat-item">
              <strong>{activeBookingsCount}</strong>
              <span>Active Bookings</span>
            </div>
            <div className="profile-stat-item">
              <strong>{savedCount}</strong>
              <span>Saved Classes</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="profile-role-picker">
            <span className="profile-role-label">Switch Persona / Role</span>
            <div className="profile-roles-grid">
              {roleOptions.map(({ id, label, icon: Icon }) => {
                const configured = isConfigured(id);
                return (
                  <button
                    type="button"
                    key={id}
                    disabled={!configured}
                    className={`profile-role-btn ${selectedRole === id ? 'selected' : ''} ${!configured ? 'unconfigured-role disabled' : ''}`}
                    onClick={() => {
                      if (configured) {
                        setSelectedRole(id);
                      }
                    }}
                    title={!configured ? `${label} profile not registered with this account` : `Switch to ${label}`}
                    style={{
                      opacity: configured ? 1 : 0.4,
                      cursor: configured ? 'pointer' : 'not-allowed',
                      pointerEvents: configured ? 'auto' : 'none',
                    }}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    {!configured && <Lock size={12} style={{ marginLeft: 'auto', opacity: 0.8 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DANCER SPECIFIC FIELDS */}
          {selectedRole === 'dancer' && (
            <label className="auth-field" style={{ marginTop: '12px' }}>
              Full name / Dancer Name
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Maya Sharma"
                required
              />
            </label>
          )}

          {/* STUDIO SPECIFIC FIELDS */}
          {selectedRole === 'studio' && (
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="auth-field">
                Studio / Venue Brand Name *
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="e.g. The Movement House"
                  required
                />
              </label>
              <label className="auth-field">
                Owner / Manager Personal Name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rutuvi Narang"
                />
              </label>

              {onNavigateTab && (
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: '#f1ede5',
                    border: '1px solid #ded8cc',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#3f3b37',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                  onClick={() => {
                    onClose();
                    onNavigateTab('Studio Profile');
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} style={{ color: '#e83b3b' }} />
                    Edit Venue Address, Rooms & Amenities
                  </span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          )}

          {/* CHOREOGRAPHER SPECIFIC FIELDS */}
          {selectedRole === 'choreographer' && (
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="auth-field">
                Artist / Stage Name *
                <input
                  type="text"
                  value={choreoName}
                  onChange={(e) => setChoreoName(e.target.value)}
                  placeholder="e.g. Aria Chen"
                  required
                />
              </label>
              <label className="auth-field">
                Real / Full Name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rutuvi Narang"
                />
              </label>
            </div>
          )}

          <label className="auth-field" style={{ marginTop: '14px' }}>
            Account Email
            <input
              type="email"
              value={user.email ?? ''}
              disabled
              style={{ background: '#ebe8e1', color: '#6e6963', cursor: 'not-allowed' }}
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">Profile updated successfully!</p>}

          <div className="profile-actions">
            <button className="primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : success ? 'Saved!' : `Save & Switch to ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}{' '}
              {!saving && !success && <Check size={16} />}
            </button>
            <button
              className="profile-signout-btn"
              type="button"
              onClick={onSignOut}
              title="Sign out of your account"
            >
              <X size={15} /> Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
