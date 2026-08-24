import {
  FolderOpenOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InboxOutlined,
} from '@ant-design/icons';

function formatWaitDuration(ms) {
  if (ms == null) return null;
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return 'há menos de 1h';
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

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
  {
    key: 'unassignedOpen',
    widgetKey: 'kpiUnassignedQueue',
    label: 'Fila sem atribuição',
    icon: InboxOutlined,
    alertWhenPositive: true,
    subKey: 'unassignedOldestWaitMs',
    subFormat: (ms) => {
      const label = formatWaitDuration(ms);
      return label ? `mais antiga ${label}` : null;
    },
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
        const subText = item.subKey && totals ? item.subFormat(totals[item.subKey]) : null;
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
              {subText && <span className="kpi-tile-sub">{subText}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
