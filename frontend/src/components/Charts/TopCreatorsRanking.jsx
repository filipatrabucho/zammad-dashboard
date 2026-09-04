import ChartCard from './ChartCard';

export default function TopCreatorsRanking({ topCreators, limit = 8 }) {
  const data = (topCreators || []).slice(0, limit);
  const max = data.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  return (
    <ChartCard title="Principais criadores de tickets" subtitle="Quem mais abre tickets no período">
      <div className="ranked-list">
        {data.length === 0 && <p className="empty-state">Sem dados para o período selecionado.</p>}
        {data.map((row) => (
          <div key={row.customer} className="ranked-row">
            <span className="ranked-label" title={row.customer}>
              {row.customer}
            </span>
            <span className="ranked-bar-track">
              <span className="ranked-bar-fill" style={{ width: `${Math.max((row.count / max) * 100, 4)}%` }} />
            </span>
            <span className="ranked-value">{row.count}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
