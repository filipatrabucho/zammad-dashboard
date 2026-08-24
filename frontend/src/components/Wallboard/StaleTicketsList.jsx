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

export default function StaleTicketsList({ tickets, limit = 6 }) {
  const rows = (tickets || []).slice(0, limit);

  return (
    <ChartCard title="Sem resposta há mais tempo">
      <div className="stale-list">
        {rows.length === 0 && <p className="empty-state">Sem tickets em aberto.</p>}
        {rows.map((t) => (
          <div key={t.id} className="stale-row">
            <span className="stale-title" title={t.title}>
              {t.title}
            </span>
            <span className="stale-owner">{t.owner && t.owner !== '-' ? t.owner : 'Sem atribuição'}</span>
            <span className="stale-time">{timeAgo(t.lastActivityAt)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
