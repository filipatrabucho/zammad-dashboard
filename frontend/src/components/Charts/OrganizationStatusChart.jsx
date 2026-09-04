import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPalette } from '../../styles/palette';
import ChartCard from './ChartCard';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function OrganizationStatusChart({ byOrganization, dark = false, height = 280, limit = 8 }) {
  const { categorical, ink } = getPalette(dark);
  const data = (byOrganization || [])
    .slice(0, limit)
    .map((o) => ({ name: o.organization, open: o.open, closed: o.closed }));

  return (
    <ChartCard title="Tickets por cliente" subtitle="Abertos vs fechados no período">
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
            content={<CustomTooltip />}
            cursor={{ fill: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: ink.secondary }} />
          <Bar dataKey="open" name="Abertos" fill={categorical[0]} radius={[0, 4, 4, 0]} maxBarSize={16} />
          <Bar dataKey="closed" name="Fechados" fill={categorical[1]} radius={[0, 4, 4, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
