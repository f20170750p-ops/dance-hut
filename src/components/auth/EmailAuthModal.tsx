import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Building2, Sparkles, X } from 'lucide-react';
import {
  getProfile,
  signInWithEmailPassword,
  signOut,
  signUpWithEmailPassword,
  type UserRole,
} from '../../services/auth';

interface EmailAuthModalProps {
  role: UserRole;
  onClose: () => void;
}

export function EmailAuthModal({ role, onClose }: EmailAuthModalProps) {
  const [fullName, setFullName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [choreoName, setChoreoName] = useState('');
  const [locality, setLocality] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isStudio = role === 'studio';
  const isChoreo = role === 'choreographer';

  const submitPasswordAuth = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedStudio = studioName.trim();
    const trimmedChoreo = choreoName.trim();

    if (authMode === 'sign-up') {
      if (isStudio && !trimmedStudio) {
        setError('Please provide your Studio Brand Name.');
        setLoading(false);
        return;
      }
      if (isChoreo && !trimmedChoreo) {
        setError('Please provide your Stage / Artist Name.');
        setLoading(false);
        return;
      }

      localStorage.setItem('dancehut.pendingRole', role);
      localStorage.setItem('dancehut.activeRole', role);
      if (trimmedName) localStorage.setItem('dancehut.pendingDisplayName', trimmedName);
      if (trimmedStudio) localStorage.setItem('dancehut.pendingStudioName', trimmedStudio);
      if (trimmedChoreo) localStorage.setItem('dancehut.pendingChoreoName', trimmedChoreo);
    }

    const result = authMode === 'sign-up'
      ? await signUpWithEmailPassword(
          normalizedEmail,
          password,
          trimmedName || (isStudio ? trimmedStudio : trimmedChoreo),
          role
        )
      : await signInWithEmailPassword(normalizedEmail, password);

    if (result.error) {
      setLoading(false);
      setError(result.error.message);
      return;
    }

    if (authMode === 'sign-in' && result.data?.user) {
      // 2-Way Persona Verification Check
      const { data: userProfile } = await getProfile(result.data.user.id);
      const configuredRoles: UserRole[] = userProfile?.configured_roles ||
        (result.data.user.user_metadata?.configured_roles as UserRole[] | undefined) ||
        (userProfile?.role ? [userProfile.role] : ['dancer']);
      const studioName = userProfile?.studio_name || result.data.user.user_metadata?.studio_name;
      const choreoName = userProfile?.choreo_name || result.data.user.user_metadata?.choreo_name;

      const hasStudio = Boolean(studioName && studioName.trim().length > 0) || configuredRoles.includes('studio');
      const hasChoreo = Boolean(choreoName && choreoName.trim().length > 0) || configuredRoles.includes('choreographer');

      if (role === 'studio' && !hasStudio) {
        await signOut();
        setLoading(false);
        setError('No Studio profile registered with this email account. Please switch to the Sign up tab to register your studio, or select "I\'m a dancer" on the welcome screen to sign in as a dancer.');
        return;
      }

      if (role === 'choreographer' && !hasChoreo) {
        await signOut();
        setLoading(false);
        setError('No Choreographer profile registered with this email account. Please switch to the Sign up tab to register your artist profile, or select "I\'m a dancer" on the welcome screen to sign in as a dancer.');
        return;
      }

      // Validated: Store active role explicitly matching the sign-in selection
      try {
        localStorage.setItem('dancehut.activeRole', role);
        localStorage.setItem('dancehut.pendingRole', role);
      } catch {
        // ignore
      }
    }

    setLoading(false);

    if (authMode === 'sign-up' && !result.data.session) {
      setSuccessMessage('Account created. Check your email to confirm your account, then sign in.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close sign in">
          <X size={18} />
        </button>
        <span className="auth-kicker">
          {authMode === 'sign-up'
            ? isStudio
              ? 'Studio Partner Registration'
              : isChoreo
              ? 'Choreographer Registration'
              : 'Create your account'
            : isStudio
            ? 'Studio Management Portal'
            : isChoreo
            ? 'Choreographer Suite'
            : 'Welcome to dancehut'}
        </span>
        <h2>{authMode === 'sign-up' ? 'Let’s get you moving.' : 'Welcome back.'}</h2>
        <p>Continue as a {role} with your email address.</p>
        <div className="auth-tabs">
          <button
            className={authMode === 'sign-in' ? 'active' : ''}
            onClick={() => setAuthMode('sign-in')}
            type="button"
          >
            Sign in
          </button>
          <button
            className={authMode === 'sign-up' ? 'active' : ''}
            onClick={() => setAuthMode('sign-up')}
            type="button"
          >
            Sign up
          </button>
        </div>
        <form onSubmit={submitPasswordAuth}>
          {authMode === 'sign-up' && (
            <>
              {isStudio && (
                <>
                  <label className="auth-field">
                    Studio / Venue Brand Name *
                    <input
                      type="text"
                      value={studioName}
                      onChange={(event) => setStudioName(event.target.value)}
                      placeholder="e.g. The Movement House"
                      autoFocus
                      required
                    />
                  </label>
                  <label className="auth-field">
                    Owner / Manager Name *
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="e.g. Rutuvi Narang"
                      required
                    />
                  </label>
                  <label className="auth-field">
                    Primary Studio Locality *
                    <input
                      type="text"
                      value={locality}
                      onChange={(event) => setLocality(event.target.value)}
                      placeholder="e.g. Koramangala, Bengaluru"
                      required
                    />
                  </label>
                </>
              )}

              {isChoreo && (
                <>
                  <label className="auth-field">
                    Artist / Stage Name *
                    <input
                      type="text"
                      value={choreoName}
                      onChange={(event) => setChoreoName(event.target.value)}
                      placeholder="e.g. Aria Chen"
                      autoFocus
                      required
                    />
                  </label>
                  <label className="auth-field">
                    Full / Real Name *
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="e.g. Rutuvi Narang"
                      required
                    />
                  </label>
                </>
              )}

              {!isStudio && !isChoreo && (
                <label className="auth-field">
                  Full name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="e.g. Maya Sharma"
                    autoFocus
                    required
                  />
                </label>
              )}
            </>
          )}

          <label className="auth-field">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoFocus={authMode === 'sign-in'}
              required
            />
          </label>
          <label className="auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {successMessage && <p className="auth-success" role="status">{successMessage}</p>}
          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : authMode === 'sign-up' ? 'Create account' : 'Sign in'} <ArrowRight size={17} />
          </button>
        </form>

      </div>
    </div>
  );
}
