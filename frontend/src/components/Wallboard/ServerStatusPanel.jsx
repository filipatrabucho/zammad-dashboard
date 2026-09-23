import { CloudServerOutlined } from '@ant-design/icons';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { getServersStatus } from '../../api/endpoints';

const REFRESH_SECONDS = 30;

function statusLabel(server) {
  if (server.status === 'up') return server.latencyMs != null ? `${server.latencyMs}ms` : 'ok';
  if (server.status === 'down') {
    if (server.statusCode) return `HTTP ${server.statusCode}`;
    if (server.errorReason) return server.errorReason;
    return 'em baixo';
  }
  return '—';
}

function statusTitle(server) {
  if (server.status !== 'down') return undefined;
  if (server.statusCode) return `Respondeu com HTTP ${server.statusCode} (não 2xx)`;
  if (server.errorReason) return `Falha de ligação: ${server.errorReason}`;
  return 'Falha de ligação';
}

export default function ServerStatusPanel() {
  const { data, loading } = useAutoRefresh(getServersStatus, [], REFRESH_SECONDS);
  const servers = data || [];

  return (
    <div className="server-status-panel">
      <div className="server-status-header">
        <h3>Outros servidores</h3>
        {servers.length > 0 && <span className="server-status-subtitle">{servers.length} monitorizados</span>}
      </div>

      {servers.length === 0 ? (
        <div className="server-status-placeholder">
          <CloudServerOutlined />
          <p>{loading ? 'A verificar servidores…' : 'Nenhum servidor configurado. Adiciona um no Backoffice.'}</p>
        </div>
      ) : (
        <div className="server-status-list">
          {servers.map((s) => (
            <div key={s.id} className="server-status-row" title={statusTitle(s)}>
              <span className={`server-dot server-dot-${s.status}`} />
              <span className="server-status-name" title={s.name}>
                {s.name}
              </span>
              <span className="server-status-latency">{statusLabel(s)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
