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

function stateTone(state) {
  const s = (state || '').toLowerCase();
  if (s.includes('closed')) return 'closed';
  if (s.includes('pending')) return 'pending';
  if (s.includes('new')) return 'new';
  return 'open';
}

export default function RecentTicketsFeed({ tickets }) {
  const rows = (tickets || []).slice(0, 8);

  return (
    <div className="recent-feed">
      <div className="recent-feed-header">
        <h3>Atividade recente</h3>
      </div>
      <div className="recent-feed-list">
        {rows.length === 0 && <p className="empty-state">Sem tickets recentes.</p>}
        {rows.map((t) => (
          <div key={t.id} className="recent-feed-row">
            <span className={`state-badge tone-${stateTone(t.state)}`}>{t.state}</span>
            <span className="recent-feed-title" title={t.title}>
              {t.title}
            </span>
            <span className="recent-feed-group">{t.group}</span>
            <span className="recent-feed-time">{timeAgo(t.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
