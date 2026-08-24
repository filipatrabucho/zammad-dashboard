import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { getHealth } from '../../api/endpoints';

export default function ConnectionStatus() {
  const { data } = useAutoRefresh(getHealth, [], 30);
  const online = data?.zammad === 'online';

  return (
    <div className={`connection-status ${online ? 'online' : 'offline'}`} title="Estado da ligação ao Zammad">
      <span className="dot" />
      {online ? 'Online' : data ? 'Offline' : 'A verificar…'}
    </div>
  );
}
