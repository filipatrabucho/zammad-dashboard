import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { getGroups, getOverview } from '../api/endpoints';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorBanner from '../components/Common/ErrorBanner';

export default function GroupsPage() {
  const fetchData = useCallback(async () => {
    const [groups, overview] = await Promise.all([getGroups(), getOverview(30)]);
    const counts = new Map((overview.byGroup || []).map((g) => [g.group, g.count]));
    return groups
      .filter((g) => g.active !== false)
      .map((g) => ({ ...g, openCount: counts.get(g.name) || 0 }))
      .sort((a, b) => b.openCount - a.openCount);
  }, []);

  const { data, loading, error, refresh } = useAutoRefresh(fetchData, [], 60);
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Grupos</h1>
          <p className="page-subtitle">Grupos configurados no Zammad e tickets abertos por grupo</p>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={refresh} />

      {loading && !data ? (
        <LoadingSpinner label="A carregar grupos…" />
      ) : (
        <div className="groups-grid">
          {(data || []).map((g) => (
            <button key={g.id} type="button" className="group-card" onClick={() => navigate(`/tickets?group=${encodeURIComponent(g.name)}`)}>
              <span className="group-name">{g.name}</span>
              <span className="group-count">{g.openCount}</span>
              <span className="group-count-label">abertos</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
