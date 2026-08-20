import { NavLink } from 'react-router-dom';
import { DashboardOutlined, TagsOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuthProfile } from '../../auth/AuthContext';

const navItems = [
  { to: '/', label: 'Overview', icon: DashboardOutlined, end: true },
  { to: '/tickets', label: 'Tickets', icon: TagsOutlined },
  { to: '/groups', label: 'Grupos', icon: TeamOutlined },
  { to: '/logs', label: 'Logs', icon: FileTextOutlined, adminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuthProfile();

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">Z</span>
          <span className="brand-name">Zammad Dashboard</span>
        </div>
        <nav className="sidebar-nav">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <item.icon className="sidebar-icon" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
