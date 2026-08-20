const zammad = require('./zammadClient');

const CLOSED_STATES = new Set(['closed', 'closed successful', 'closed unsuccessful']);

function isClosedState(stateName) {
  return CLOSED_STATES.has((stateName || '').toLowerCase());
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function countBy(tickets, keyFn) {
  const counts = new Map();
  tickets.forEach((ticket) => {
    const key = keyFn(ticket) || 'Sem atribuição';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Agregação para o overview do dashboard: tickets por estado, por
 * grupo, por assignee, e criados vs fechados no período pedido.
 */
async function getOverview({ days = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const [openTickets, periodTickets] = await Promise.all([
    zammad.fetchTicketsForStats({ query: 'state.name:open OR state.name:new OR state.name:pending*', limit: 1500 }),
    zammad.fetchTicketsForStats({ query: `created_at:>=${sinceIso}`, limit: 1500 }),
  ]);

  const createdInPeriod = periodTickets.length;
  const closedInPeriod = periodTickets.filter((t) => t.close_at || isClosedState(t.state)).length;

  const now = Date.now();
  const slaAtRisk = openTickets.filter((t) => {
    if (!t.escalation_at) return false;
    return new Date(t.escalation_at).getTime() < now;
  }).length;

  const closedToday = periodTickets.filter((t) => t.close_at && isoDate(t.close_at) === isoDate(new Date())).length;
  const createdToday = periodTickets.filter((t) => isoDate(t.created_at) === isoDate(new Date())).length;

  return {
    period: { days, since: sinceIso },
    totals: {
      open: openTickets.length,
      createdInPeriod,
      closedInPeriod,
      createdToday,
      closedToday,
      slaAtRisk,
    },
    byState: countBy(openTickets, (t) => t.state).map((x) => ({ state: x.key, count: x.count })),
    byGroup: countBy(openTickets, (t) => t.group).map((x) => ({ group: x.key, count: x.count })),
    byAssignee: countBy(
      openTickets.filter((t) => t.owner && t.owner !== '-'),
      (t) => t.owner
    ).map((x) => ({ assignee: x.key, count: x.count })),
  };
}

/**
 * Série temporal diária: tickets criados vs fechados, últimos `days` dias.
 */
async function getTimeseries({ days = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const tickets = await zammad.fetchTicketsForStats({ query: `created_at:>=${sinceIso}`, limit: 3000 });

  const buckets = new Map();
  for (let i = 0; i <= days; i += 1) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets.set(isoDate(d), { date: isoDate(d), created: 0, closed: 0 });
  }

  tickets.forEach((t) => {
    const createdKey = isoDate(t.created_at);
    if (buckets.has(createdKey)) buckets.get(createdKey).created += 1;

    if (t.close_at) {
      const closedKey = isoDate(t.close_at);
      if (buckets.has(closedKey)) buckets.get(closedKey).closed += 1;
    }
  });

  return Array.from(buckets.values());
}

module.exports = { getOverview, getTimeseries };
