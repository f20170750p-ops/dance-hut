import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  Compass,
  Heart,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Plus,
  QrCode,
  SlidersHorizontal,
  Ticket,
  X,
} from 'lucide-react';
import type { UserRole } from '../../services/auth';

interface SidebarProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserName: string;
  currentUserInitials: string;
  currentUserRoleBadge: string;
  currentUserRole?: UserRole;
  bookingsCount: number;
  studioEventsCount?: number;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  onOpenProfile: () => void;
  onOpenMessages?: () => void;
  onOpenCreateWorkshop?: () => void;
  onOpenScanner?: () => void;
  onOpenBroadcast?: () => void;
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
  currentUserRole = 'dancer',
  bookingsCount,
  studioEventsCount = 0,
  unreadMessagesCount = 1,
  unreadNotificationsCount = 0,
  onOpenProfile,
  onOpenMessages,
  onOpenCreateWorkshop,
  onOpenScanner,
  onOpenBroadcast,
  onSignOut,
}: SidebarProps) {
  const isStudio = currentUserRole === 'studio';

  const dancerTabs = [
    { name: 'Discover', icon: Compass },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'My bookings', icon: Ticket },
    { name: 'Saved', icon: Heart },
  ];

  const studioTabs = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Workshops', icon: CalendarDays },
    { name: 'Studio Profile', icon: Building2 },
  ];

  const activeTabsList = isStudio ? studioTabs : dancerTabs;

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

      {/* Studio Fast Action: Create Workshop */}
      {isStudio && onOpenCreateWorkshop && (
        <button
          type="button"
          className="sidebar-quick-create-btn"
          onClick={() => {
            onOpenCreateWorkshop();
            setShowMenu(false);
          }}
        >
          <Plus size={16} />
          <span>New Workshop</span>
        </button>
      )}

      <div className="side-group">
        <span className="side-label">
          {isStudio ? 'Studio Portal' : 'Workspace'}
        </span>
        {activeTabsList.map(({ name, icon: Icon }) => (
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
            {name === 'My Workshops' && studioEventsCount > 0 && (
              <i>{studioEventsCount}</i>
            )}
          </button>
        ))}

        {isStudio && onOpenScanner && (
          <button
            type="button"
            className="side-item"
            onClick={() => {
              onOpenScanner();
              setShowMenu(false);
            }}
          >
            <QrCode size={19} />
            <span>QR Scanner</span>
          </button>
        )}
      </div>

      <div className="side-group side-bottom">
        <span className="side-label">
          {isStudio ? 'Studio Comms' : 'Your space'}
        </span>
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
        {isStudio && onOpenBroadcast && (
          <button
            type="button"
            className="side-item"
            onClick={() => {
              onOpenBroadcast();
              setShowMenu(false);
            }}
          >
            <Megaphone size={19} />
            <span>Broadcast Alert</span>
          </button>
        )}
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
