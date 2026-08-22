import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Compass,
  Heart,
  MessageCircle,
  SlidersHorizontal,
  Ticket,
  X,
} from 'lucide-react';

interface SidebarProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserName: string;
  currentUserInitials: string;
  currentUserRoleBadge: string;
  bookingsCount: number;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  onOpenProfile: () => void;
  onOpenMessages?: () => void;
  onSignOut: () => void;
}

export function Sidebar({
  showMenu,
  setShowMenu,
  activeTab,
  setActiveTab,
  currentUserName,
  currentUserInitials,
  currentUserRoleBadge,
  bookingsCount,
  unreadMessagesCount = 1,
  unreadNotificationsCount = 0,
  onOpenProfile,
  onOpenMessages,
  onSignOut,
}: SidebarProps) {
  const tabs = [
    { name: 'Discover', icon: Compass },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'My bookings', icon: Ticket },
    { name: 'Saved', icon: Heart },
  ];

  return (
    <aside className={`sidebar ${showMenu ? 'open' : ''}`}>
      <div className="sidebar-head">
        <div className="brand">
          <span className="brand-mark">D</span>
          <span>dancehut</span>
        </div>
        <button
          type="button"
          className="close-menu"
          onClick={() => setShowMenu(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <button
        type="button"
        className="profile-mini"
        onClick={onOpenProfile}
      >
        <span className="avatar">{currentUserInitials}</span>
        <div>
          <strong>{currentUserName}</strong>
          <span>{currentUserRoleBadge}</span>
        </div>
        <ChevronDown size={14} />
      </button>

      <div className="side-group">
        <span className="side-label">Workspace</span>
        {tabs.map(({ name, icon: Icon }) => (
          <button
            type="button"
            className={`side-item ${activeTab === name ? 'active' : ''}`}
            key={name}
            onClick={() => {
              setActiveTab(name);
              setShowMenu(false);
            }}
          >
            <Icon size={19} />
            <span>{name}</span>
            {name === 'My bookings' && bookingsCount > 0 && <i>{bookingsCount}</i>}
          </button>
        ))}
      </div>

      <div className="side-group side-bottom">
        <span className="side-label">Your space</span>
        <button
          type="button"
          className={`side-item ${activeTab === 'Messages' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Messages');
            setShowMenu(false);
          }}
        >
          <MessageCircle size={19} />
          <span>Messages</span>
          {unreadMessagesCount > 0 && <i className="message-dot" />}
        </button>
        <button
          type="button"
          className={`side-item ${activeTab === 'Notifications' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Notifications');
            setShowMenu(false);
          }}
        >
          <Bell size={19} />
          <span>Notifications</span>
          {unreadNotificationsCount > 0 && <i>{unreadNotificationsCount}</i>}
        </button>
        <button
          type="button"
          className="side-item"
          onClick={onOpenProfile}
        >
          <SlidersHorizontal size={19} />
          <span>Preferences</span>
        </button>
        <button
          type="button"
          className="side-item sign-out-item"
          onClick={onSignOut}
        >
          <X size={19} />
          <span>Sign out</span>
        </button>
      </div>

      <div className="side-footer">
        <div className="help-card">
          <span>Need a hand?</span>
          <strong>
            Talk to our team <ArrowRight size={14} />
          </strong>
        </div>
        <span className="version">dancehut / 01</span>
      </div>
    </aside>
  );
}
