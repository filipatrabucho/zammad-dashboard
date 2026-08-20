import { useNavigate } from 'react-router-dom';
import ChartCard from './ChartCard';

export default function AssigneeRanking({ byAssignee }) {
  const navigate = useNavigate();
  const data = (byAssignee || []).slice(0, 10);
  const max = data.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  return (
    <ChartCard title="Tickets por assignee" subtitle="Clica numa linha para ver os tickets">
      <div className="ranked-list">
        {data.length === 0 && <p className="empty-state">Sem dados para o período selecionado.</p>}
        {data.map((row) => (
          <button
            key={row.assignee}
            type="button"
            className="ranked-row"
            onClick={() => navigate(`/tickets?assignee=${encodeURIComponent(row.assignee)}`)}
          >
            <span className="ranked-label" title={row.assignee}>
              {row.assignee}
            </span>
            <span className="ranked-bar-track">
              <span className="ranked-bar-fill" style={{ width: `${Math.max((row.count / max) * 100, 4)}%` }} />
            </span>
            <span className="ranked-value">{row.count}</span>
          </button>
        ))}
      </div>
    </ChartCard>
  );
}
