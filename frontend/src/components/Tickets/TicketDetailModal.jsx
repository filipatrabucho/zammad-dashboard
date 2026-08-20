import { useEffect, useState } from 'react';
import { getTicket } from '../../api/endpoints';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorBanner from '../Common/ErrorBanner';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-PT');
}

export default function TicketDetailModal({ ticketId, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTicket(ticketId)
      .then((data) => {
        if (!cancelled) setTicket(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ticket #{ticket?.number || ticketId}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {loading && <LoadingSpinner label="A carregar ticket…" />}
          <ErrorBanner message={error} />
          {ticket && !loading && (
            <div className="ticket-detail">
              <h3>{ticket.title}</h3>
              <dl className="detail-grid">
                <dt>Estado</dt>
                <dd>{ticket.state}</dd>
                <dt>Grupo</dt>
                <dd>{ticket.group}</dd>
                <dt>Assignee</dt>
                <dd>{ticket.owner && ticket.owner !== '-' ? ticket.owner : '—'}</dd>
                <dt>Prioridade</dt>
                <dd>{ticket.priority || '—'}</dd>
                <dt>Criado em</dt>
                <dd>{formatDate(ticket.created_at)}</dd>
                <dt>Atualizado em</dt>
                <dd>{formatDate(ticket.updated_at)}</dd>
              </dl>
              {Array.isArray(ticket.articles) && ticket.articles.length > 0 && (
                <div className="ticket-articles">
                  <h4>Últimas mensagens</h4>
                  {ticket.articles.slice(-3).map((a) => (
                    <div key={a.id} className="ticket-article">
                      <div className="ticket-article-meta">
                        <strong>{a.from || 'Sistema'}</strong>
                        <span>{formatDate(a.created_at)}</span>
                      </div>
                      <div
                        className="ticket-article-body"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: a.body_html || a.body || '' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
