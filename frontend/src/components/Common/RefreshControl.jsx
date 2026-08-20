const OPTIONS = [
  { value: 0, label: 'Manual' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
];

export default function RefreshControl({ seconds, onChange, onRefreshNow }) {
  return (
    <div className="refresh-control">
      <button type="button" className="btn-secondary btn-icon" onClick={onRefreshNow} title="Atualizar agora">
        ⟳
      </button>
      <select value={seconds} onChange={(e) => onChange(Number(e.target.value))} aria-label="Intervalo de auto-refresh">
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
