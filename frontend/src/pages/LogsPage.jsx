import { useEffect, useRef, useState } from 'react';
import { getLogContainers, getLogs } from '../api/endpoints';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import ErrorBanner from '../components/Common/ErrorBanner';
import RefreshControl from '../components/Common/RefreshControl';

export default function LogsPage() {
  const [containers, setContainers] = useState([]);
  const [container, setContainer] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const outputRef = useRef(null);

  useEffect(() => {
    getLogContainers().then((res) => {
      setContainers(res.containers || []);
      if (res.containers?.length) setContainer(res.containers[0]);
    });
  }, []);

  const { data, loading, error, refresh, intervalSeconds, setIntervalSeconds } = useAutoRefresh(
    () => (container ? getLogs(container, 300) : Promise.resolve(null)),
    [container],
    15
  );

  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [data, autoScroll]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Logs</h1>
          <p className="page-subtitle">docker logs — apenas administradores</p>
        </div>
        <RefreshControl seconds={intervalSeconds} onChange={setIntervalSeconds} onRefreshNow={refresh} />
      </div>

      <div className="filters-bar">
        <select value={container} onChange={(e) => setContainer(e.target.value)} className="filter-input">
          {containers.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="checkbox-label">
          <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
          Auto-scroll
        </label>
      </div>

      <ErrorBanner message={error} onRetry={refresh} />

      <pre className="logs-output" ref={outputRef}>
        {loading && !data ? 'A carregar logs…' : data?.logs || 'Sem output.'}
      </pre>
    </div>
  );
}
