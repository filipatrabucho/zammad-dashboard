import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamOutlined, RightOutlined } from '@ant-design/icons';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getGroups, getOverview } from '../api/endpoints';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';

const PERIOD_DAYS = 30;

export default function GroupsPage() {
  const fetchData = useCallback(async () => {
    const [groups, overview] = await Promise.all([getGroups(), getOverview(PERIOD_DAYS)]);
    const counts = new Map((overview.byGroup || []).map((g) => [g.group, g.count]));
    return groups
      .filter((g) => g.active !== false)
      .map((g) => ({ ...g, ticketCount: counts.get(g.name) || 0 }))
      .sort((a, b) => b.ticketCount - a.ticketCount);
  }, []);

  const { data, loading, error, refresh } = useAutoRefresh(fetchData, [], 60);
  const navigate = useNavigate();
  const total = (data || []).reduce((sum, g) => sum + g.ticketCount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Grupos</h1>
          <p className="page-subtitle">
            Grupos configurados no Zammad — tickets criados nos últimos {PERIOD_DAYS} dias, por grupo
          </p>
        </div>
        {!loading && data && (
          <div className="groups-total">
            <span className="groups-total-value">{total}</span>
            <span className="groups-total-label">tickets no período</span>
          </div>
        )}
      </div>

      <ErrorBanner message={error} onRetry={refresh} />

      {loading && !data ? (
        <LoadingSpinner label="A carregar grupos…" />
      ) : (
        <div className="groups-grid">
          {(data || []).map((g) => (
            <button
              key={g.id}
              type="button"
              className="group-card"
              onClick={() => navigate(`/tickets?group=${encodeURIComponent(g.name)}`)}
            >
              <div className="group-card-top">
                <span className="group-card-icon">
                  <TeamOutlined />
                </span>
                <RightOutlined className="group-card-arrow" />
              </div>
              <span className="group-name">{g.name}</span>
              <div className="group-count-row">
                <span className="group-count">{g.ticketCount}</span>
                <span className="group-count-label">tickets</span>
              </div>
            </button>
          ))}
          {data && data.length === 0 && <p className="empty-state">Nenhum grupo ativo encontrado.</p>}
        </div>
      )}
    </div>
  );
}
