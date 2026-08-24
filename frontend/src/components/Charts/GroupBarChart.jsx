import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getPalette } from '../../styles/palette';
import ChartCard from './ChartCard';

function CustomTooltip({ active, payload, label, sequentialBlue }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-dot" style={{ background: sequentialBlue }} />
        <span>Tickets</span>
        <strong>{payload[0].value}</strong>
      </div>
    </div>
  );
}

export default function GroupBarChart({ byGroup, dark = false, interactive = true }) {
  const navigate = useNavigate();
  const { ink, sequentialBlue } = getPalette(dark);
  const data = (byGroup || []).slice(0, 10).map((g) => ({ name: g.group, value: g.count }));

  return (
    <ChartCard title="Tickets por grupo" subtitle={interactive ? 'Clica numa barra para ver os tickets' : undefined}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={ink.gridline} />
          <XAxis type="number" tick={{ fill: ink.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: ink.secondary, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip sequentialBlue={sequentialBlue} />}
            cursor={{ fill: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            cursor={interactive ? 'pointer' : 'default'}
            onClick={interactive ? (entry) => navigate(`/tickets?group=${encodeURIComponent(entry.name)}`) : undefined}
            maxBarSize={22}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={sequentialBlue} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
