import { Bell, ChevronDown, MapPin, Menu } from 'lucide-react';

interface TopbarProps {
  setShowMenu: (show: boolean) => void;
  currentUserName: string;
  currentUserInitials: string;
  onOpenProfile: () => void;
}

export function Topbar({
  setShowMenu,
  currentUserName,
  currentUserInitials,
  onOpenProfile,
}: TopbarProps) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="menu-trigger"
        onClick={() => setShowMenu(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>
      <div className="mobile-brand">
        <span className="brand-mark">D</span> dancehut
      </div>
      <div className="topbar-right">
        <div className="city-pill">
          <MapPin size={15} /> Bengaluru <ChevronDown size={14} />
        </div>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={19} />
        </button>
        <div
          className="avatar avatar-small"
          onClick={onOpenProfile}
          role="button"
          tabIndex={0}
          title={`Logged in as ${currentUserName}. Click to manage profile.`}
        >
          {currentUserInitials}
        </div>
      </div>
    </header>
  );
}
