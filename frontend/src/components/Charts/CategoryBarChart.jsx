import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
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

export default function CategoryBarChart({ byCategory, dark = false, height = 280, limit = 10 }) {
  const { ink, sequentialBlue } = getPalette(dark);
  const data = (byCategory || []).slice(0, limit).map((c) => ({ name: c.category, value: c.count }));

  return (
    <ChartCard title="Tickets por categoria" subtitle="Contagem no período selecionado">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={ink.gridline} />
          <XAxis
            type="number"
            tick={{ fill: ink.muted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: ink.secondary, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip sequentialBlue={sequentialBlue} />}
            cursor={{ fill: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={sequentialBlue} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
