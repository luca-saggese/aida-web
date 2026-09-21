import { NavLink, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  House,
  FlaskConical,
  ChartNoAxesColumnIncreasing,
  KeyRound,
  BookOpen,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronUp,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House },
  { to: '/playground', label: 'Playground', icon: FlaskConical },
  { to: '/usage', label: 'Usage', icon: ChartNoAxesColumnIncreasing },
  { to: '/api-keys', label: 'API Keys', icon: KeyRound },
];

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Sidebar({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const secondaryLine = organization?.name ?? user?.email ?? '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-top">
        {!collapsed && (
          <div className="brand">
            <div className="brand-mark">GT</div>
            <span className="brand-name">GOTRAXX AI</span>
          </div>
        )}
        <button
          className="icon-button collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen size={20} strokeWidth={1.8} />
          ) : (
            <PanelLeftClose size={20} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {!collapsed && (
        <nav className="nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <item.icon size={21} strokeWidth={1.7} />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}

          <a className="nav-item" href="https://docs.gotraxx.ai" target="_blank" rel="noreferrer">
            <BookOpen size={21} strokeWidth={1.7} />
            <span className="nav-label">Documentation</span>
            <ExternalLink size={15} strokeWidth={1.7} className="nav-ext" />
          </a>
        </nav>
      )}

      <div className="sidebar-footer">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            {collapsed ? (
              <button className="avatar avatar-small" aria-label={user?.name ?? 'Account'}>
                {user ? initials(user.name) : '?'}
              </button>
            ) : (
              <button className="account-row" aria-label={user?.name ?? 'Account'}>
                <span className="avatar">{user ? initials(user.name) : '?'}</span>
                <span className="account-text">
                  <span className="account-name">{user?.name ?? ''}</span>
                  <span className="account-org">{secondaryLine}</span>
                </span>
                <ChevronUp size={18} strokeWidth={1.7} className="account-chevron" />
              </button>
            )}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="account-menu" align={collapsed ? 'start' : 'end'} sideOffset={8}>
              <DropdownMenu.Item className="account-menu-item" onSelect={() => navigate('/settings')}>
                <Settings size={16} strokeWidth={1.7} />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="account-menu-sep" />
              <DropdownMenu.Item className="account-menu-item danger" onSelect={handleLogout}>
                <LogOut size={16} strokeWidth={1.7} />
                Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </aside>
  );
}