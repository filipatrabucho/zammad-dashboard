import ChartCard from '../Charts/ChartCard';

function timeAgo(value) {
  if (!value) return '—';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

export default function UnassignedQueueList({ tickets, limit = 6 }) {
  const rows = (tickets || []).slice(0, limit);

  return (
    <ChartCard title="Fila sem atribuição">
      <div className="stale-list">
        {rows.length === 0 && <p className="empty-state">Sem tickets por atribuir.</p>}
        {rows.map((t) => (
          <div key={t.id} className="stale-row stale-row-compact">
            <span className="stale-number">#{t.number}</span>
            <span className="stale-title" title={t.title}>
              {t.title}
            </span>
            <span className="stale-time">{timeAgo(t.waitingSince)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
