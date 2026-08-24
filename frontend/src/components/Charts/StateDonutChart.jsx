import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getPalette } from '../../styles/palette';
import ChartCard from './ChartCard';

const MAX_SLICES = 7;

function prepareData(byState) {
  if (!byState?.length) return [];
  const sorted = [...byState].sort((a, b) => b.count - a.count);
  if (sorted.length <= MAX_SLICES) return sorted.map((s) => ({ name: s.state, value: s.count }));

  const top = sorted.slice(0, MAX_SLICES).map((s) => ({ name: s.state, value: s.count }));
  const rest = sorted.slice(MAX_SLICES).reduce((sum, s) => sum + s.count, 0);
  return [...top, { name: 'Outros', value: rest, isOther: true }];
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-dot" style={{ background: p.payload.fill }} />
        <span>{p.name}</span>
        <strong>{p.value}</strong>
      </div>
    </div>
  );
}

export default function StateDonutChart({ byState, dark = false, interactive = true, height = 280 }) {
  const navigate = useNavigate();
  const { categorical, ink } = getPalette(dark);
  const data = prepareData(byState);

  const handleClick = (entry) => {
    if (!interactive || entry.isOther) return;
    navigate(`/tickets?state=${encodeURIComponent(entry.name)}`);
  };

  return (
    <ChartCard
      title="Distribuição por estado"
      subtitle={interactive ? 'Clica numa fatia para ver os tickets' : undefined}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={64}
            outerRadius={100}
            paddingAngle={2}
            cornerRadius={4}
            cursor={interactive ? 'pointer' : 'default'}
            onClick={handleClick}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.isOther ? ink.muted : categorical[index % categorical.length]}
                stroke={ink.surface}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 13, color: ink.secondary }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
