import { useEffect, useRef, useState, useCallback } from 'react';
import { playChime } from '../utils/chime';

const DEFAULT_DURATION_S = 60;
const CHECK_INTERVAL_MS = 15000;

/**
 * Mostra a pausa para café quando o relógio bate numa das horas
 * configuradas (Backoffice). Guarda a última hora "disparada" (por dia)
 * para não repetir dentro da mesma hora enquanto o separador fica aberto.
 * `triggerNow()` permite simular/testar sem esperar pela hora certa.
 */
export function useCoffeeBreak({ enabled = true, hours = [], durationSeconds = DEFAULT_DURATION_S } = {}) {
  const [visible, setVisible] = useState(false);
  const lastFiredKey = useRef(null);
  const dismissTimer = useRef(null);
  const durationRef = useRef(durationSeconds);
  durationRef.current = durationSeconds;

  const clearDismissTimer = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  };

  const show = useCallback(() => {
    clearDismissTimer();
    setVisible(true);
    playChime();
    dismissTimer.current = setTimeout(() => setVisible(false), durationRef.current * 1000);
  }, []);

  const dismiss = useCallback(() => {
    clearDismissTimer();
    setVisible(false);
  }, []);

  const triggerNow = useCallback(() => {
    show();
  }, [show]);

  const hoursKey = hours.join(',');

  useEffect(() => {
    if (!enabled || !hours.length) return undefined;

    const check = () => {
      const now = new Date();
      if (!hours.includes(now.getHours()) || now.getMinutes() !== 0) return;

      const key = `${now.toDateString()}-${now.getHours()}`;
      if (lastFiredKey.current === key) return;
      lastFiredKey.current = key;
      show();
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hoursKey, show]);

  useEffect(() => () => clearDismissTimer(), []);

  return { visible, dismiss, triggerNow };
}
