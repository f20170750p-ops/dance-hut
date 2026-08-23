import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  Compass,
  Headphones,
  Heart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  Music2,
  Plus,
  QrCode,
  Sparkles,
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
  onNavigateHome?: () => void;
  onOpenContact?: () => void;
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
  onNavigateHome,
  onOpenContact,
  onSignOut,
}: SidebarProps) {
  const isStudio = currentUserRole === 'studio';
  const isChoreo = currentUserRole === 'choreographer';

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

  const choreoTabs = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Classes', icon: Music2 },
    { name: 'My Portfolio', icon: Sparkles },
  ];

  const activeTabsList = isStudio ? studioTabs : isChoreo ? choreoTabs : dancerTabs;

  return (
    <aside className={`sidebar ${showMenu ? 'open' : ''}`}>
      <div className="sidebar-head">
        <button
          type="button"
          className="brand brand-btn"
          onClick={() => {
            if (onNavigateHome) {
              onNavigateHome();
            } else {
              setActiveTab(isStudio || isChoreo ? 'Dashboard' : 'Discover');
            }
            setShowMenu(false);
          }}
          title="Go to Discover feed"
          aria-label="Dance Hut home"
        >
          <span className="brand-mark">D</span>
          <span>dancehut</span>
        </button>
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

      {/* Studio / Choreo Fast Action: Create / Host Workshop */}
      {(isStudio || isChoreo) && onOpenCreateWorkshop && (
        <button
          type="button"
          className="sidebar-quick-create-btn"
          onClick={() => {
            onOpenCreateWorkshop();
            setShowMenu(false);
          }}
        >
          <Plus size={16} />
          <span>{isChoreo ? 'Host Workshop' : 'New Workshop'}</span>
        </button>
      )}

      <div className="side-group">
        <span className="side-label">
          {isStudio ? 'Studio Portal' : isChoreo ? 'Choreo Suite' : 'Workspace'}
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
            {(name === 'My Workshops' || name === 'My Classes') && studioEventsCount > 0 && (
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
          {isStudio ? 'Studio Comms' : isChoreo ? 'Choreo Comms' : 'Your space'}
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
        {(isStudio || isChoreo) && onOpenBroadcast && (
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
      </div>

      <div className="side-footer">
        <button
          type="button"
          className="side-contact-btn"
          onClick={() => {
            if (onOpenContact) {
              onOpenContact();
            }
            setShowMenu(false);
          }}
        >
          <Headphones size={17} />
          <span>Contact us</span>
        </button>

        <button
          type="button"
          className="side-item side-signout-btn"
          onClick={() => {
            setShowMenu(false);
            onSignOut();
          }}
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
