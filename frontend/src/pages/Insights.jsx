import { useCallback, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';
import { LogoutOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuthProfile } from '../auth/AuthContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getSecondaryOverview, getWallboardSettings } from '../api/endpoints';
import { periodToDays } from '../utils/period';
import OrganizationStatusChart from '../components/Charts/OrganizationStatusChart';
import TopCreatorsRanking from '../components/Charts/TopCreatorsRanking';
import CategoryBarChart from '../components/Charts/CategoryBarChart';
import ConnectionStatus from '../components/Common/ConnectionStatus';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';
import logo from '/favicon.svg';

const REFRESH_SECONDS = 30;
const SETTINGS_REFRESH_SECONDS = 30;

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Insights() {
  const now = useClock();
  const { instance } = useMsal();
  const { profile, isAdmin } = useAuthProfile();

  const settings = useAutoRefresh(getWallboardSettings, [], SETTINGS_REFRESH_SECONDS);
  const days = periodToDays(settings.data?.period);
  const isDark = (settings.data?.theme ?? 'dark') === 'dark';

  const fetchSecondary = useCallback(() => getSecondaryOverview(days), [days]);
  const secondary = useAutoRefresh(fetchSecondary, [days], REFRESH_SECONDS);

  const loading = (secondary.loading && !secondary.data) || (settings.loading && !settings.data);

  return (
    <div className={`wallboard-page ${isDark ? 'dark-theme' : ''}`}>
      <div className="wallboard-content">
        <header className="wallboard-header">
          <div className="wallboard-brand">
            <img src={logo} alt="ICON" />
            <h1>PKF Helpdesk — Clientes &amp; Categorias</h1>
          </div>

          <div className="wallboard-header-right">
            <ConnectionStatus />
            <div className="wallboard-clock">
              <span className="wallboard-time">{now.toLocaleTimeString('pt-PT')}</span>
              <span className="wallboard-date">
                {now.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
            </div>
            <Link to="/" className="wallboard-logout" title="Voltar ao wallboard">
              <HomeOutlined />
            </Link>
            {isAdmin && (
              <Link to="/backoffice" className="wallboard-logout" title="Backoffice">
                <SettingOutlined />
              </Link>
            )}
            <button
              type="button"
              className="wallboard-logout"
              onClick={() => instance.logoutRedirect()}
              title={profile ? `Sair (${profile.email})` : 'Sair'}
            >
              <LogoutOutlined />
            </button>
          </div>
        </header>

        {secondary.error && <ErrorBanner message={secondary.error} onRetry={secondary.refresh} />}

        {loading ? (
          <LoadingSpinner label="A carregar estatísticas…" />
        ) : (
          <div className="wallboard-body">
            <div className="wallboard-charts insights-grid">
              <OrganizationStatusChart byOrganization={secondary.data?.byOrganization} dark={isDark} height="100%" />
              <TopCreatorsRanking topCreators={secondary.data?.topCreators} />
              <CategoryBarChart byCategory={secondary.data?.byCategory} dark={isDark} height="100%" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
