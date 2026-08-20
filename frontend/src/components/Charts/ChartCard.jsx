export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-header">
        <h3>{title}</h3>
        {subtitle && <span className="chart-card-subtitle">{subtitle}</span>}
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}
