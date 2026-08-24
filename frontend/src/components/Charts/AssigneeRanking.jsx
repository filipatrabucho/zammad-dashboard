import { useNavigate } from 'react-router-dom';
import ChartCard from './ChartCard';

export default function AssigneeRanking({ byAssignee, interactive = true }) {
  const navigate = useNavigate();
  const data = (byAssignee || []).slice(0, 10);
  const max = data.reduce((m, d) => Math.max(m, d.count), 0) || 1;
  const Tag = interactive ? 'button' : 'div';

  return (
    <ChartCard title="Tickets por assignee" subtitle={interactive ? 'Clica numa linha para ver os tickets' : undefined}>
      <div className="ranked-list">
        {data.length === 0 && <p className="empty-state">Sem dados para o período selecionado.</p>}
        {data.map((row) => (
          <Tag
            key={row.assignee}
            type={interactive ? 'button' : undefined}
            className="ranked-row"
            onClick={interactive ? () => navigate(`/tickets?assignee=${encodeURIComponent(row.assignee)}`) : undefined}
          >
            <span className="ranked-label" title={row.assignee}>
              {row.assignee}
            </span>
            <span className="ranked-bar-track">
              <span className="ranked-bar-fill" style={{ width: `${Math.max((row.count / max) * 100, 4)}%` }} />
            </span>
            <span className="ranked-value">{row.count}</span>
          </Tag>
        ))}
      </div>
    </ChartCard>
  );
}
