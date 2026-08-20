import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTickets, getGroups, getStates } from '../api/endpoints';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import TicketsFilters from '../components/Tickets/TicketsFilters';
import TicketsTable from '../components/Tickets/TicketsTable';
import Pagination from '../components/Tickets/Pagination';
import TicketDetailModal from '../components/Tickets/TicketDetailModal';
import ErrorBanner from '../components/Common/ErrorBanner';
import RefreshControl from '../components/Common/RefreshControl';

const PER_PAGE = 25;

export default function TicketsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: '',
    state: searchParams.get('state') || '',
    group: searchParams.get('group') || '',
    assignee: searchParams.get('assignee') || '',
    page: 1,
  });
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    getGroups().then(setGroups).catch(() => {});
    getStates().then(setStates).catch(() => {});
  }, []);

  const fetchTickets = useCallback(
    () =>
      getTickets({
        query: filters.query || undefined,
        state: filters.state || undefined,
        group: filters.group || undefined,
        assignee: filters.assignee || undefined,
        page: filters.page,
        perPage: PER_PAGE,
      }),
    [filters]
  );

  const { data, loading, error, refresh, intervalSeconds, setIntervalSeconds } = useAutoRefresh(
    fetchTickets,
    [filters],
    0
  );

  const tickets = data || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tickets</h1>
          <p className="page-subtitle">Pesquisa e filtra os tickets do Zammad</p>
        </div>
        <RefreshControl seconds={intervalSeconds} onChange={setIntervalSeconds} onRefreshNow={refresh} />
      </div>

      <TicketsFilters
        filters={filters}
        onChange={setFilters}
        states={states}
        groups={groups}
        onClear={() => setFilters({ query: '', state: '', group: '', assignee: '', page: 1 })}
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <TicketsTable tickets={tickets} loading={loading} onSelect={setSelectedTicketId} />

      <Pagination
        page={filters.page}
        hasMore={tickets.length === PER_PAGE}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      {selectedTicketId && (
        <TicketDetailModal ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
      )}
    </div>
  );
}
