import { FolderOpenOutlined, PlusCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

const items = [
  { key: 'open', widgetKey: 'kpiOpen', label: 'Tickets abertos', icon: FolderOpenOutlined, hero: true },
  { key: 'createdToday', widgetKey: 'kpiCreatedToday', label: 'Criados hoje', icon: PlusCircleOutlined },
  { key: 'closedToday', widgetKey: 'kpiClosedToday', label: 'Fechados hoje', icon: CheckCircleOutlined },
  {
    key: 'slaAtRisk',
    widgetKey: 'kpiSlaAtRisk',
    label: 'SLA em risco',
    icon: WarningOutlined,
    alertWhenPositive: true,
  },
];

export default function KpiSidebar({ totals, widgets }) {
  const visible = items.filter((item) => !widgets || widgets[item.widgetKey] !== false);

  if (visible.length === 0) return null;

  return (
    <div className="kpi-sidebar">
      {visible.map((item) => {
        const value = totals ? totals[item.key] ?? 0 : null;
        const alert = item.alertWhenPositive && value > 0;
        return (
          <div
            key={item.key}
            className={`kpi-tile ${item.hero ? 'kpi-tile-hero' : ''} ${alert ? 'kpi-tile-alert' : ''}`}
          >
            <span className="kpi-tile-icon">
              <item.icon />
            </span>
            <span className="kpi-tile-text">
              <span className="kpi-tile-label">{item.label}</span>
              <span className="kpi-tile-value">{value ?? '—'}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
