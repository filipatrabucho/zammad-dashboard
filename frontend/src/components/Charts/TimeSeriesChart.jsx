import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { categorical, ink } from '../../styles/palette';
import ChartCard from './ChartCard';

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{formatDate(label)}</div>
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

export default function TimeSeriesChart({ data }) {
  return (
    <ChartCard title="Tickets criados vs fechados" subtitle="Evolução diária no período selecionado">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data || []} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={categorical[0]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={categorical[0]} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={categorical[1]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={categorical[1]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={ink.gridline} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: ink.muted, fontSize: 12 }}
            axisLine={{ stroke: ink.baseline }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis tick={{ fill: ink.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 13, color: ink.secondary }}
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Criados"
            stroke={categorical[0]}
            strokeWidth={2}
            fill="url(#fillCreated)"
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="closed"
            name="Fechados"
            stroke={categorical[1]}
            strokeWidth={2}
            fill="url(#fillClosed)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
