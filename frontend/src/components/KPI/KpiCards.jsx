const cardDefs = [
  { key: 'open', label: 'Tickets abertos', tone: 'blue' },
  { key: 'createdToday', label: 'Criados hoje', tone: 'green' },
  { key: 'closedToday', label: 'Fechados hoje', tone: 'purple' },
  { key: 'slaAtRisk', label: 'SLA em risco', tone: 'red', alertWhenPositive: true },
];

export default function KpiCards({ totals }) {
  return (
    <div className="kpi-grid">
      {cardDefs.map((def) => {
        const value = totals ? totals[def.key] ?? 0 : null;
        const alert = def.alertWhenPositive && value > 0;
        return (
          <div key={def.key} className={`kpi-card tone-${def.tone} ${alert ? 'kpi-alert' : ''}`}>
            <span className="kpi-label">{def.label}</span>
            <span className="kpi-value">{value ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}
