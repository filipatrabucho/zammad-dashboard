function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function stateTone(state) {
  const s = (state || '').toLowerCase();
  if (s.includes('closed')) return 'closed';
  if (s.includes('pending')) return 'pending';
  if (s.includes('new')) return 'new';
  return 'open';
}

export default function TicketsTable({ tickets, loading, onSelect }) {
  if (loading) {
    return <div className="table-skeleton">A carregar tickets…</div>;
  }

  if (!tickets || tickets.length === 0) {
    return <div className="empty-state">Nenhum ticket encontrado com estes filtros.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="tickets-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Grupo</th>
            <th>Assignee</th>
            <th>Criado</th>
            <th>Atualizado</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} onClick={() => onSelect(t.id)} className="clickable-row">
              <td className="mono">{t.number || t.id}</td>
              <td className="title-cell">{t.title}</td>
              <td>
                <span className={`state-badge tone-${stateTone(t.state)}`}>{t.state}</span>
              </td>
              <td>{t.group}</td>
              <td>{t.owner && t.owner !== '-' ? t.owner : '—'}</td>
              <td className="mono">{formatDate(t.created_at)}</td>
              <td className="mono">{formatDate(t.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
