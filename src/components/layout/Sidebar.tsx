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

      <div
        className="profile-mini"
        onClick={onOpenProfile}
        role="button"
        tabIndex={0}
        title="Manage profile"
      >
        <div className="avatar">{currentUserInitials}</div>
        <div>
          <strong>{currentUserName}</strong>
          <span>{currentUserRoleBadge}</span>
        </div>
        <ChevronDown size={15} />
      </div>

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
        <button type="button" className="side-item">
          <Bell size={19} />
          <span>Notifications</span>
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
