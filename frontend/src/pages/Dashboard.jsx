import { useCallback, useState } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getOverview, getTimeseries } from '../api/endpoints';
import KpiCards from '../components/KPI/KpiCards';
import TimeSeriesChart from '../components/Charts/TimeSeriesChart';
import StateDonutChart from '../components/Charts/StateDonutChart';
import GroupBarChart from '../components/Charts/GroupBarChart';
import AssigneeRanking from '../components/Charts/AssigneeRanking';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';
import RefreshControl from '../components/Common/RefreshControl';

const PERIODS = [7, 14, 30, 90];

export default function Dashboard() {
  const [days, setDays] = useState(30);

  const fetchOverview = useCallback(() => getOverview(days), [days]);
  const fetchTimeseries = useCallback(() => getTimeseries(days), [days]);

  const overview = useAutoRefresh(fetchOverview, [days], 30);
  const timeseries = useAutoRefresh(fetchTimeseries, [days], 30);

  const loading = overview.loading && !overview.data;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p className="page-subtitle">Resumo de atividade do Zammad</p>
        </div>
        <div className="page-header-actions">
          <div className="segmented">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                className={p === days ? 'active' : ''}
                onClick={() => setDays(p)}
              >
                {p}d
              </button>
            ))}
          </div>
          <RefreshControl
            seconds={overview.intervalSeconds}
            onChange={(s) => {
              overview.setIntervalSeconds(s);
              timeseries.setIntervalSeconds(s);
            }}
            onRefreshNow={() => {
              overview.refresh();
              timeseries.refresh();
            }}
          />
        </div>
      </div>

      <ErrorBanner message={overview.error || timeseries.error} onRetry={overview.refresh} />

      {loading ? (
        <LoadingSpinner label="A carregar estatísticas…" />
      ) : (
        <>
          <KpiCards totals={overview.data?.totals} />
          <div className="charts-grid">
            <TimeSeriesChart data={timeseries.data} />
            <StateDonutChart byState={overview.data?.byState} />
            <GroupBarChart byGroup={overview.data?.byGroup} />
            <AssigneeRanking byAssignee={overview.data?.byAssignee} />
          </div>
        </>
      )}
    </div>
  );
}
