const cardDefs = [
  { key: 'open', label: 'Tickets abertos', tone: 'blue' },
  { key: 'createdToday', label: 'Criados hoje', tone: 'green' },
  { key: 'closedToday', label: 'Fechados hoje', tone: 'purple' },
  { key: 'slaAtRisk', label: 'SLA em risco', tone: 'red' },
];

export default function KpiCards({ totals }) {
  return (
    <div className="kpi-grid">
      {cardDefs.map((def) => (
        <div key={def.key} className={`kpi-card tone-${def.tone}`}>
          <span className="kpi-label">{def.label}</span>
          <span className="kpi-value">{totals ? totals[def.key] ?? 0 : '—'}</span>
        </div>
      ))}
    </div>
  );
}
