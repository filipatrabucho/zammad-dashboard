import { useCallback, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuthProfile } from '../auth/AuthContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getOverview, getTimeseries, getTickets } from '../api/endpoints';
import KpiCards from '../components/KPI/KpiCards';
import TimeSeriesChart from '../components/Charts/TimeSeriesChart';
import StateDonutChart from '../components/Charts/StateDonutChart';
import GroupBarChart from '../components/Charts/GroupBarChart';
import AssigneeRanking from '../components/Charts/AssigneeRanking';
import RecentTicketsFeed from '../components/Wallboard/RecentTicketsFeed';
import ConnectionStatus from '../components/Common/ConnectionStatus';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';

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
  const fetchRecent = useCallback(
    () => getTickets({ sortBy: 'created_at', orderBy: 'desc', perPage: 8, page: 1 }),
    []
  );

  const overview = useAutoRefresh(fetchOverview, [], REFRESH_SECONDS);
  const timeseries = useAutoRefresh(fetchTimeseries, [], REFRESH_SECONDS);
  const recent = useAutoRefresh(fetchRecent, [], REFRESH_SECONDS);

  const loading = overview.loading && !overview.data;

  return (
    <div className="wallboard-page">
      <header className="wallboard-header">
        <div className="wallboard-brand">
          <span className="brand-mark">Z</span>
          <div>
            <h1>Zammad — Sala IT</h1>
            <span className="wallboard-subtitle">Estado ao vivo do suporte</span>
          </div>
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

      <ErrorBanner message={overview.error || timeseries.error} onRetry={overview.refresh} />

      {loading ? (
        <LoadingSpinner label="A carregar estatísticas…" />
      ) : (
        <div className="wallboard-body">
          <KpiCards totals={overview.data?.totals} />

          <div className="charts-grid wallboard-charts">
            <TimeSeriesChart data={timeseries.data} dark subtitle={`Últimos ${PERIOD_DAYS} dias`} />
            <StateDonutChart byState={overview.data?.byState} dark interactive={false} />
            <GroupBarChart byGroup={overview.data?.byGroup} dark interactive={false} />
            <AssigneeRanking byAssignee={overview.data?.byAssignee} interactive={false} />
          </div>

          <RecentTicketsFeed tickets={recent.data} />
        </div>
      )}
    </div>
  );
}
