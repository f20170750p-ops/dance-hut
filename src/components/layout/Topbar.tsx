import { Bell, ChevronDown, MapPin, Menu } from 'lucide-react';

interface TopbarProps {
  setShowMenu: (show: boolean) => void;
  currentUserName: string;
  currentUserInitials: string;
  onOpenProfile: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onNavigateHome?: () => void;
  selectedCity?: string;
  onOpenCitySelector?: () => void;
}

export function Topbar({
  setShowMenu,
  currentUserName,
  currentUserInitials,
  onOpenProfile,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onNavigateHome,
  selectedCity = 'Bengaluru',
  onOpenCitySelector,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="menu-trigger"
          onClick={() => setShowMenu(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <button
          type="button"
          className="mobile-brand brand-btn"
          onClick={onNavigateHome}
          title="Go to Discover feed"
          aria-label="Dance Hut home"
        >
          <span className="brand-mark">D</span>
          <span className="brand-text">dancehut</span>
        </button>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="city-pill interactive-city-pill"
          onClick={onOpenCitySelector}
          title={`Currently exploring workshops in ${selectedCity}. Click to view expansion cities.`}
          aria-label={`Selected city: ${selectedCity}. Click to change city.`}
        >
          <MapPin size={14} className="city-pin-icon" />
          <span className="city-pill-name">{selectedCity}</span>
          <span className="city-live-status-dot" title="Live City" />
          <ChevronDown size={13} className="city-chevron" />
        </button>

        <button
          type="button"
          className="icon-btn notif-bell-btn"
          onClick={onOpenNotifications}
          aria-label={
            unreadNotificationsCount > 0
              ? `${unreadNotificationsCount} unread notifications. Click to view feed.`
              : 'Notifications'
          }
          title={
            unreadNotificationsCount > 0
              ? `${unreadNotificationsCount} unread notifications`
              : 'Notifications'
          }
        >
          <Bell size={19} />
          {unreadNotificationsCount > 0 && (
            <span className="bell-badge-count">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
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
