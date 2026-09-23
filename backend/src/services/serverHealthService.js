const axios = require('axios');
const serversStore = require('./serversStore');

const CHECK_TIMEOUT_MS = 5000;

/**
 * Faz um GET ao endpoint configurado, com o bearer token (se existir).
 * Corre sempre no backend — o token nunca chega ao browser. Considera-se
 * "up" qualquer resposta 2xx; qualquer outro código, timeout ou erro de
 * rede conta como "down".
 */
async function checkServer(server) {
  const startedAt = Date.now();
  try {
    const headers = {};
    if (server.bearerToken) headers.Authorization = `Bearer ${server.bearerToken}`;

    const response = await axios.get(server.endpoint, {
      timeout: CHECK_TIMEOUT_MS,
      headers,
      validateStatus: () => true,
    });

    const latencyMs = Date.now() - startedAt;
    const up = response.status >= 200 && response.status < 300;

    return {
      id: server.id,
      name: server.name,
      status: up ? 'up' : 'down',
      statusCode: response.status,
      latencyMs,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    // Nunca expor a stack/URL completa (pode conter query params sensíveis),
    // mas o código do erro (ECONNREFUSED, ENOTFOUND, ETIMEDOUT, certificado
    // TLS, etc.) é seguro e é o que normalmente explica o "down" — vai para
    // a consola do servidor e também no campo `errorReason` da resposta,
    // para o Backoffice conseguir mostrar a causa sem teres de ir aos logs.
    const reason = err.code || (err.message && err.message.includes('timeout') ? 'ETIMEDOUT' : 'network_error');
    console.warn(
      '[servers] falha ao verificar "%s" (%s): %s',
      server.name,
      server.endpoint,
      err.code || err.message
    );
    return {
      id: server.id,
      name: server.name,
      status: 'down',
      statusCode: null,
      latencyMs: null,
      errorReason: reason,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkAllServers() {
  const servers = serversStore.getServersForHealthCheck();
  return Promise.all(servers.map(checkServer));
}

module.exports = { checkAllServers };
