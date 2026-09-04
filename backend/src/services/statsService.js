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
  // A pesquisa do Zammad (Lucene/Elasticsearch) usa ":" como separador
  // campo:valor — um timestamp ISO completo (com hora) tem ":" dentro do
  // próprio valor e parte a query, devolvendo sempre 0 resultados. Usar só
  // a data (sem hora) evita o problema.
  const sinceDate = isoDate(since);

  const [openTickets, periodTickets] = await Promise.all([
    zammad.fetchTicketsForStats({ query: 'state.name:open OR state.name:new OR state.name:pending*', limit: 1500 }),
    zammad.fetchTicketsForStats({ query: `created_at:>=${sinceDate}`, limit: 1500 }),
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

  // Fila sem atribuição: tickets abertos sem owner ("-" é a convenção do
  // Zammad para "por atribuir"), listados do que espera há mais tempo
  // para o que espera há menos tempo.
  const unassignedOpenTickets = openTickets
    .filter((t) => !t.owner || t.owner === '-')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const unassignedTickets = unassignedOpenTickets.slice(0, 8).map((t) => ({
    id: t.id,
    number: t.number,
    title: t.title,
    waitingSince: t.created_at,
  }));

  // Tickets sem resposta há mais tempo: os tickets abertos com a
  // atualização mais antiga (proxy razoável para "ninguém mexe nisto há
  // muito tempo", sem depender de campos do Zammad que podem não existir
  // em todas as versões, como last_contact_*).
  const staleTickets = [...openTickets]
    .sort((a, b) => new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at))
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      owner: t.owner,
      lastActivityAt: t.updated_at || t.created_at,
    }));

  return {
    period: { days, since: sinceIso },
    totals: {
      open: openTickets.length,
      createdInPeriod,
      closedInPeriod,
      createdToday,
      closedToday,
      slaAtRisk,
      unassignedOpen: unassignedOpenTickets.length,
    },
    // Estas três distribuições refletem os tickets CRIADOS no período
    // selecionado (7d/14d/30d/90d) — é o que muda quando o utilizador troca
    // o período no Overview. `totals.open` acima é sempre o valor "agora".
    byState: countBy(periodTickets, (t) => t.state).map((x) => ({ state: x.key, count: x.count })),
    byGroup: countBy(periodTickets, (t) => t.group).map((x) => ({ group: x.key, count: x.count })),
    byAssignee: countBy(
      periodTickets.filter((t) => t.owner && t.owner !== '-'),
      (t) => t.owner
    ).map((x) => ({ assignee: x.key, count: x.count })),
    staleTickets,
    unassignedTickets,
  };
}

/**
 * Série temporal diária: tickets criados vs fechados, últimos `days` dias.
 */
async function getTimeseries({ days = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDate = isoDate(since);

  const tickets = await zammad.fetchTicketsForStats({ query: `created_at:>=${sinceDate}`, limit: 3000 });

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

/**
 * Agregações para a segunda página do wallboard: tickets por
 * cliente/organização (abertos vs fechados), principais criadores de
 * tickets, e tickets por categoria — calculadas sobre os tickets criados
 * no período pedido, tal como o overview principal.
 */
async function getSecondaryOverview({ days = 30 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDate = isoDate(since);

  const periodTickets = await zammad.fetchTicketsForStats({ query: `created_at:>=${sinceDate}`, limit: 1500 });

  const orgCounts = new Map();
  periodTickets.forEach((t) => {
    const org = t.organization || 'Sem organização';
    const entry = orgCounts.get(org) || { organization: org, open: 0, closed: 0 };
    if (t.close_at || isClosedState(t.state)) entry.closed += 1;
    else entry.open += 1;
    orgCounts.set(org, entry);
  });
  const byOrganization = Array.from(orgCounts.values()).sort(
    (a, b) => b.open + b.closed - (a.open + a.closed)
  );

  const topCreators = countBy(periodTickets, (t) => t.customer).map((x) => ({ customer: x.key, count: x.count }));

  // Campo customizado "category" — assume-se que o Zammad devolve o valor
  // selecionado diretamente nesta propriedade quando `expand=true`.
  const byCategory = countBy(periodTickets, (t) => t.category).map((x) => ({ category: x.key, count: x.count }));

  return {
    period: { days },
    byOrganization,
    topCreators,
    byCategory,
  };
}

module.exports = { getOverview, getTimeseries, getSecondaryOverview };
