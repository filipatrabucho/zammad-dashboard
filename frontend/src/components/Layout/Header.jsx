import { useMsal } from '@azure/msal-react';
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthProfile } from '../../auth/AuthContext';
import ConnectionStatus from '../Common/ConnectionStatus';

export default function Header({ onMenuClick }) {
  const { instance } = useMsal();
  const { profile } = useAuthProfile();

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <header className="header">
      <button type="button" className="menu-toggle" onClick={onMenuClick} aria-label="Abrir menu">
        <MenuOutlined />
      </button>
      <div className="header-spacer" />
      <ConnectionStatus />
      {profile && (
        <div className="user-chip">
          <span className="user-name">{profile.name || profile.email}</span>
          <span className={`role-badge role-${profile.role}`}>{profile.role}</span>
        </div>
      )}
      <button type="button" className="btn-secondary" onClick={handleLogout}>
        <LogoutOutlined />
        Sair
      </button>
    </header>
  );
}
