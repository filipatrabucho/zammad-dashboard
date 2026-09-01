import { useEffect, useRef } from 'react';
import { getTickets } from '../api/endpoints';
import { playNewTicketChime } from '../utils/chime';

const CHECK_INTERVAL_MS = 20000;

/**
 * Verifica periodicamente qual é o ticket mais recente; se mudar desde a
 * última verificação (e não for a primeira, para não tocar logo ao abrir
 * a página), toca um som curto de notificação.
 */
export function useNewTicketSound({ enabled = true } = {}) {
  const lastTicketId = useRef(null);
  const isFirstCheck = useRef(true);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    const check = async () => {
      try {
        const tickets = await getTickets({ sortBy: 'created_at', orderBy: 'desc', perPage: 1, page: 1 });
        if (cancelled) return;
        const latest = tickets?.[0];
        if (!latest) return;

        if (isFirstCheck.current) {
          lastTicketId.current = latest.id;
          isFirstCheck.current = false;
          return;
        }

        if (latest.id !== lastTicketId.current) {
          lastTicketId.current = latest.id;
          playNewTicketChime();
        }
      } catch (err) {
        console.warn('[new-ticket-sound] falha ao verificar novos tickets:', err.message);
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled]);
}
