import { NavLink } from 'react-router-dom';
import { useAuthProfile } from '../../auth/AuthContext';

const navItems = [
  { to: '/', label: 'Overview', icon: '📊', end: true },
  { to: '/tickets', label: 'Tickets', icon: '🎫' },
  { to: '/groups', label: 'Grupos', icon: '👥' },
  { to: '/logs', label: 'Logs', icon: '📜', adminOnly: true },
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
                <span className="sidebar-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
