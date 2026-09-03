import { CloudServerOutlined } from '@ant-design/icons';

/**
 * Placeholder honesto — reserva espaço no wallboard para, no futuro,
 * mostrar o estado de outros servidores (ex: Zammad, VPN, etc).
 * Sem dados ainda; substituir por widgets reais quando existir uma fonte.
 */
export default function ServerStatusPanel() {
  return (
    <div className="server-status-panel">
      <div className="server-status-header">
        <h3>Outros servidores</h3>
        <span className="server-status-subtitle">Em breve</span>
      </div>
      <div className="server-status-placeholder">
        <CloudServerOutlined />
        <p>Espaço reservado para o estado de outros servidores.</p>
      </div>
    </div>
  );
}
