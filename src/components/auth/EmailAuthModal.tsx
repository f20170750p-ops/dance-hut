import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, X } from 'lucide-react';
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  type UserRole,
} from '../../services/auth';

interface EmailAuthModalProps {
  role: UserRole;
  onClose: () => void;
}

export function EmailAuthModal({ role, onClose }: EmailAuthModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitPasswordAuth = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (authMode === 'sign-up') {
      localStorage.setItem('dancehut.pendingRole', role);
      if (trimmedName) {
        localStorage.setItem('dancehut.pendingDisplayName', trimmedName);
      }
    }

    const result = authMode === 'sign-up'
      ? await signUpWithEmailPassword(normalizedEmail, password, trimmedName, role)
      : await signInWithEmailPassword(normalizedEmail, password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

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
          {authMode === 'sign-up' ? 'Create your account' : 'Welcome to dancehut'}
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
