import { useEffect, useRef, useState, useCallback } from 'react';
import { playChime } from '../utils/chime';

const TRIGGER_HOURS = [10, 16];
const AUTO_DISMISS_MS = 20000;
const CHECK_INTERVAL_MS = 15000;

/**
 * Mostra a pausa para café quando o relógio bate 10h ou 16h. Guarda a
 * última hora "disparada" (por dia) para não repetir dentro da mesma hora
 * enquanto o separador fica aberto.
 */
export function useCoffeeBreak() {
  const [visible, setVisible] = useState(false);
  const lastFiredKey = useRef(null);
  const dismissTimer = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      if (!TRIGGER_HOURS.includes(now.getHours()) || now.getMinutes() !== 0) return;

      const key = `${now.toDateString()}-${now.getHours()}`;
      if (lastFiredKey.current === key) return;
      lastFiredKey.current = key;

      setVisible(true);
      playChime();
      dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      clearInterval(id);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [dismiss]);

  return { visible, dismiss };
}
