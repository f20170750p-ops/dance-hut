import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Sparkles, UserRound, Users, X } from 'lucide-react';
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
  activeBookingsCount: number;
  savedCount: number;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => void;
  onSignOut: () => void;
}

export function ProfileModal({
  user,
  profile,
  activeBookingsCount,
  savedCount,
  onClose,
  onUpdate,
  onSignOut,
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(
    profile?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || ''
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    profile?.role || (user.user_metadata?.role as UserRole) || 'dancer'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const previewName = displayName.trim() || getDisplayName(profile, user);
  const previewInitials = getInitials(previewName);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    const trimmed = displayName.trim();
    const { data, error: updateErr } = await updateProfile(user.id, {
      display_name: trimmed,
      role: selectedRole,
    });

    setSaving(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    if (data) {
      onUpdate(data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const roleOptions: { id: UserRole; label: string; icon: typeof UserRound }[] = [
    { id: 'dancer', label: 'Dancer', icon: UserRound },
    { id: 'choreographer', label: 'Choreographer', icon: Sparkles },
    { id: 'studio', label: 'Studio', icon: Users },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close profile">
          <X size={18} />
        </button>

        <div className="profile-modal-head">
          <div className="profile-modal-avatar">{previewInitials}</div>
          <div className="profile-modal-meta">
            <h2>{previewName}</h2>
            <span>{user.email}</span>
          </div>
        </div>

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

        <form onSubmit={handleSave}>
          <label className="auth-field" style={{ marginTop: '12px' }}>
            Full name / Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya Sharma"
              required
            />
          </label>

          <div className="profile-role-picker">
            <span className="profile-role-label">Account Role</span>
            <div className="profile-roles-grid">
              {roleOptions.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`profile-role-btn ${selectedRole === id ? 'selected' : ''}`}
                  onClick={() => setSelectedRole(id)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="auth-field" style={{ marginTop: '16px' }}>
            Email address
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
              {saving ? 'Saving…' : success ? 'Saved!' : 'Save changes'}{' '}
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
