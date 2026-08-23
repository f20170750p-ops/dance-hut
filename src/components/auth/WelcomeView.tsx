import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Instagram,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import type { UserRole } from '../../services/auth';
import { EmailAuthModal } from './EmailAuthModal';

const roles: { id: UserRole; label: string; detail: string; icon: typeof UserRound }[] = [
  { id: 'dancer', label: 'I’m a dancer', detail: 'Discover classes & book your next session', icon: UserRound },
  { id: 'choreographer', label: 'I’m a choreographer', detail: 'Find studios & manage your schedule', icon: Sparkles },
  { id: 'studio', label: 'I run a studio', detail: 'Fill classes & grow your community', icon: Users },
];

interface WelcomeViewProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

export function WelcomeView({ role, setRole }: WelcomeViewProps) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="welcome-page">
      <div className="welcome-orb orb-one" />
      <div className="welcome-orb orb-two" />
      <nav className="welcome-nav">
        <div className="brand">
          <span className="brand-mark">D</span>
          <span>dancehut</span>
        </div>
        <span className="nav-note">Made for movement</span>
      </nav>
      <main className="welcome-main">
        <div className="welcome-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Bengaluru’s dance community
          </div>
          <h1>
            Find your<br />
            <em>next rhythm.</em>
          </h1>
          <p>One place for every class, workshop, and dance floor in your city.</p>
          <div className="role-picker">
            <p className="picker-label">Tell us how you move</p>
            {roles.map(({ id, label, detail, icon: Icon }) => (
              <button
                type="button"
                className={`role-option ${role === id ? 'selected' : ''}`}
                key={id}
                onClick={() => setRole(id)}
              >
                <span className="role-icon">
                  <Icon size={18} />
                </span>
                <span className="role-text">
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
                <span className="role-check">
                  {role === id && <Check size={15} strokeWidth={3} />}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="primary-btn welcome-btn"
            onClick={() => setAuthOpen(true)}
          >
            Enter dancehut <ArrowRight size={17} />
          </button>
          <div className="login-options">
            <button
              type="button"
              className="login-chip"
              onClick={() => setAuthOpen(true)}
            >
              <UserRound size={15} /> Continue with email
            </button>
            <button
              type="button"
              className="login-chip"
              disabled
              title="Instagram OAuth is not configured yet"
            >
              <Instagram size={15} /> Instagram (coming soon)
            </button>
          </div>
          <span className="login-note">
            Use your email and password to securely access your account.
          </span>
        </div>

      </main>

      {authOpen && <EmailAuthModal role={role} onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
