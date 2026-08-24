import { useCallback, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuthProfile } from '../auth/AuthContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getOverview, getTimeseries, getWallboardSettings } from '../api/endpoints';
import { periodToDays } from '../utils/period';
import BrandMark from '../components/Common/BrandMark';
import KpiSidebar from '../components/Wallboard/KpiSidebar';
import TimeSeriesChart from '../components/Charts/TimeSeriesChart';
import StateDonutChart from '../components/Charts/StateDonutChart';
import GroupBarChart from '../components/Charts/GroupBarChart';
import AssigneeRanking from '../components/Charts/AssigneeRanking';
import ConnectionStatus from '../components/Common/ConnectionStatus';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';

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

export default function Wallboard() {
  const now = useClock();
  const { instance } = useMsal();
  const { profile, isAdmin } = useAuthProfile();

  const settings = useAutoRefresh(getWallboardSettings, [], SETTINGS_REFRESH_SECONDS);
  const widgets = settings.data?.widgets;
  const days = periodToDays(settings.data?.period);

  const fetchOverview = useCallback(() => getOverview(days), [days]);
  const fetchTimeseries = useCallback(() => getTimeseries(days), [days]);

  const overview = useAutoRefresh(fetchOverview, [days], REFRESH_SECONDS);
  const timeseries = useAutoRefresh(fetchTimeseries, [days], REFRESH_SECONDS);

  const loading = (overview.loading && !overview.data) || (settings.loading && !settings.data);

  const showAnyKpi =
    !widgets || widgets.kpiOpen || widgets.kpiCreatedToday || widgets.kpiClosedToday || widgets.kpiSlaAtRisk;
  const showTimeseries = !widgets || widgets.chartTimeseries;
  const showByState = !widgets || widgets.chartByState;
  const showByGroup = !widgets || widgets.chartByGroup;
  const showByAssignee = !widgets || widgets.chartByAssignee;
  const anyChartVisible = showTimeseries || showByState || showByGroup || showByAssignee;

  return (
    <div className="wallboard-page dark-theme">
      <header className="wallboard-header">
        <div className="wallboard-brand">
          <BrandMark size={30} />
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

      {(overview.error || timeseries.error) && (
        <ErrorBanner message={overview.error || timeseries.error} onRetry={overview.refresh} />
      )}

      {loading ? (
        <LoadingSpinner label="A carregar estatísticas…" />
      ) : (
        <div className="wallboard-body">
          {anyChartVisible && (
            <div className="wallboard-charts">
              {showTimeseries && (
                <TimeSeriesChart
                  data={timeseries.data}
                  dark
                  subtitle={`Últimos ${days} dia${days === 1 ? '' : 's'}`}
                  height="100%"
                />
              )}
              {showByState && (
                <StateDonutChart byState={overview.data?.byState} dark interactive={false} height="100%" />
              )}
              {showByGroup && (
                <GroupBarChart
                  byGroup={overview.data?.byGroup}
                  dark
                  interactive={false}
                  height="100%"
                  limit={6}
                />
              )}
              {showByAssignee && (
                <AssigneeRanking byAssignee={overview.data?.byAssignee} interactive={false} limit={6} />
              )}
            </div>
          )}

          {showAnyKpi && <KpiSidebar totals={overview.data?.totals} widgets={widgets} />}
        </div>
      )}
    </div>
  );
}
