import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Chama `fetchFn` imediatamente e depois a cada `intervalSeconds`
 * (se > 0). Devolve { data, error, loading, refresh, intervalSeconds, setIntervalSeconds }.
 */
export function useAutoRefresh(fetchFn, deps = [], defaultInterval = 30) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intervalSeconds, setIntervalSeconds] = useState(defaultInterval);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchRef.current();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!intervalSeconds || intervalSeconds <= 0) return undefined;
    const id = setInterval(refresh, intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [intervalSeconds, refresh]);

  return { data, error, loading, refresh, intervalSeconds, setIntervalSeconds };
}
