import { useCallback, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuthProfile } from '../auth/AuthContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getOverview, getTimeseries } from '../api/endpoints';
// import BrandMark from '../components/Common/BrandMark';
import KpiSidebar from '../components/Wallboard/KpiSidebar';
import TimeSeriesChart from '../components/Charts/TimeSeriesChart';
import StateDonutChart from '../components/Charts/StateDonutChart';
import GroupBarChart from '../components/Charts/GroupBarChart';
import AssigneeRanking from '../components/Charts/AssigneeRanking';
import ConnectionStatus from '../components/Common/ConnectionStatus';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';
import logo from '/favicon.svg';

const PERIOD_DAYS = 30;
const REFRESH_SECONDS = 30;

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Wallboard() {
  const now = useClock();
  const { instance } = useMsal();
  const { profile } = useAuthProfile();

  const fetchOverview = useCallback(() => getOverview(PERIOD_DAYS), []);
  const fetchTimeseries = useCallback(() => getTimeseries(PERIOD_DAYS), []);

  const overview = useAutoRefresh(fetchOverview, [], REFRESH_SECONDS);
  const timeseries = useAutoRefresh(fetchTimeseries, [], REFRESH_SECONDS);

  const loading = overview.loading && !overview.data;

  return (
    <div className="wallboard-page">
      <header className="wallboard-header">
        <div className="wallboard-brand">
          <img src={logo} alt='ICON' />
          <h1>PKF Helpdesk</h1>
        </div>

        <div className="wallboard-header-right">
          <ConnectionStatus />
          <div className="wallboard-clock">
            <span className="wallboard-time">{now.toLocaleTimeString('pt-PT')}</span>
            <span className="wallboard-date">
              {now.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>
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

      {(overview.error || timeseries.error) && (
        <ErrorBanner message={overview.error || timeseries.error} onRetry={overview.refresh} />
      )}

      {loading ? (
        <LoadingSpinner label="A carregar estatísticas…" />
      ) : (
        <div className="wallboard-body">
          <div className="wallboard-charts">
            <TimeSeriesChart
              data={timeseries.data}
              dark
              subtitle={`Últimos ${PERIOD_DAYS} dias`}
              height="100%"
            />
            <StateDonutChart byState={overview.data?.byState} dark interactive={false} height="100%" />
            <GroupBarChart
              byGroup={overview.data?.byGroup}
              dark
              interactive={false}
              height="100%"
              limit={6}
            />
            <AssigneeRanking byAssignee={overview.data?.byAssignee} interactive={false} limit={6} />
          </div>

          <KpiSidebar totals={overview.data?.totals} />
        </div>
      )}
    </div>
  );
}
