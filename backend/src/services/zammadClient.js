const axios = require('axios');
const env = require('../config/env');

class ZammadError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ZammadError';
    this.status = status || 502;
    this.details = details;
  }
}

const http = axios.create({
  baseURL: `${(env.zammadUrl || '').replace(/\/+$/, '')}/api/v1`,
  timeout: 15000,
  headers: {
    Authorization: `Token token=${env.zammadApiToken}`,
    Accept: 'application/json',
  },
});

async function request(config) {
  try {
    const response = await http.request(config);
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new ZammadError('Zammad demorou demasiado tempo a responder (timeout).', 504);
    }
    if (err.response) {
      throw new ZammadError(
        `Zammad devolveu um erro (${err.response.status}).`,
        err.response.status >= 500 ? 502 : err.response.status,
        err.response.data
      );
    }
    if (err.request) {
      throw new ZammadError('Não foi possível contactar o Zammad (serviço em baixo?).', 503);
    }
    throw new ZammadError(err.message, 500);
  }
}

/**
 * Pesquisa tickets. `params` pode incluir: query, state, group_id,
 * owner_id, page, per_page, sort_by, order_by.
 */
async function searchTickets(params = {}) {
  const { query, state, group, assignee, page, perPage, sortBy, orderBy } = params;

  const parts = [];
  if (query) parts.push(query);
  if (state) parts.push(`state.name:"${state}"`);
  if (group) parts.push(`group.name:"${group}"`);
  if (assignee) parts.push(`owner.email:"${assignee}"`);

  return request({
    method: 'GET',
    url: '/tickets/search',
    params: {
      query: parts.length ? parts.join(' AND ') : '*',
      page: page || 1,
      per_page: perPage || 25,
      sort_by: sortBy || 'created_at',
      order_by: orderBy || 'desc',
      expand: true,
    },
  });
}

async function getTicket(id) {
  // expand=true (tal como na pesquisa) devolve o ticket "achatado", com
  // state/group/owner como strings legíveis em vez de *_id numéricos.
  // As mensagens não vêm incluídas nesse pedido, por isso buscamos os
  // artigos à parte e juntamos tudo numa única estrutura para o frontend.
  const [ticket, articles] = await Promise.all([
    request({ method: 'GET', url: `/tickets/${id}`, params: { expand: true } }),
    request({ method: 'GET', url: `/ticket_articles/by_ticket/${id}` }).catch(() => []),
  ]);

  return { ...ticket, articles: Array.isArray(articles) ? articles : [] };
}

async function listGroups() {
  return request({ method: 'GET', url: '/groups' });
}

async function listStates() {
  return request({ method: 'GET', url: '/ticket_states' });
}

async function listUsers() {
  return request({ method: 'GET', url: '/users', params: { per_page: 200 } });
}

/**
 * Busca um lote de tickets (com expand) para agregações internas de
 * estatísticas. Limitado por `limit` para não sobrecarregar o Zammad —
 * pensado para instâncias de dimensão média. As estatísticas são,
 * portanto, calculadas sobre os `limit` tickets mais recentes que
 * respeitam `query`, não sobre a totalidade da base de dados.
 */
async function fetchTicketsForStats({ query, limit = 1000 } = {}) {
  const perPage = 100;
  const maxPages = Math.ceil(limit / perPage);
  const q = query || '*';

  const all = [];
  for (let page = 1; page <= maxPages; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const batch = await request({
      method: 'GET',
      url: '/tickets/search',
      params: { query: q, page, per_page: perPage, sort_by: 'created_at', order_by: 'desc', expand: true },
    });
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < perPage) break;
  }
  return all.slice(0, limit);
}

async function ping() {
  return request({ method: 'GET', url: '/ticket_states', params: { per_page: 1 } });
}

module.exports = {
  ZammadError,
  searchTickets,
  getTicket,
  listGroups,
  listStates,
  listUsers,
  fetchTicketsForStats,
  ping,
};
