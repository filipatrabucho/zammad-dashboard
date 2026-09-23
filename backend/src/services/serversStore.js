const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Persistência simples em ficheiro, tal como wallboard-settings.json —
// guardado fora do código (backend/data/, no .gitignore). O bearer token
// de cada servidor fica aqui em texto simples; nunca é devolvido ao
// frontend (ver toPublic) nem sai do backend, exceto no próprio pedido
// de health-check ao endpoint configurado.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'servers.json');
const MAX_SERVERS = 12;
const MAX_NAME_LENGTH = 60;

function readServers() {
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function writeServers(servers) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(servers, null, 2));
}

function sanitizeName(input) {
  return String(input || '').trim().slice(0, MAX_NAME_LENGTH);
}

function sanitizeEndpoint(input) {
  const value = String(input || '').trim();
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return value;
  } catch (err) {
    return null;
  }
}

function maskToken(token) {
  if (!token) return null;
  return token.length <= 4 ? '••••' : `••••${token.slice(-4)}`;
}

function toPublic(server) {
  return {
    id: server.id,
    name: server.name,
    endpoint: server.endpoint,
    hasToken: Boolean(server.bearerToken),
    tokenPreview: maskToken(server.bearerToken),
  };
}

function listServers() {
  return readServers().map(toPublic);
}

function createServer({ name, endpoint, bearerToken } = {}) {
  const cleanName = sanitizeName(name);
  const cleanEndpoint = sanitizeEndpoint(endpoint);
  if (!cleanName) throw new Error('Nome é obrigatório.');
  if (!cleanEndpoint) throw new Error('Endpoint inválido — tem de ser um URL http:// ou https:// válido.');

  const servers = readServers();
  if (servers.length >= MAX_SERVERS) throw new Error(`Limite de ${MAX_SERVERS} servidores atingido.`);

  const server = {
    id: crypto.randomUUID(),
    name: cleanName,
    endpoint: cleanEndpoint,
    bearerToken: bearerToken ? String(bearerToken).trim() : '',
    createdAt: new Date().toISOString(),
  };
  servers.push(server);
  writeServers(servers);
  return toPublic(server);
}

function updateServer(id, { name, endpoint, bearerToken } = {}) {
  const servers = readServers();
  const index = servers.findIndex((s) => s.id === id);
  if (index === -1) throw new Error('Servidor não encontrado.');

  const existing = servers[index];
  const cleanName = name !== undefined ? sanitizeName(name) : existing.name;
  const cleanEndpoint = endpoint !== undefined ? sanitizeEndpoint(endpoint) : existing.endpoint;
  if (!cleanName) throw new Error('Nome é obrigatório.');
  if (!cleanEndpoint) throw new Error('Endpoint inválido — tem de ser um URL http:// ou https:// válido.');

  const updated = {
    ...existing,
    name: cleanName,
    endpoint: cleanEndpoint,
    // Só substitui o token se vier um novo não-vazio — permite editar
    // nome/endpoint sem ter de reintroduzir sempre o bearer token.
    bearerToken: bearerToken ? String(bearerToken).trim() : existing.bearerToken,
    updatedAt: new Date().toISOString(),
  };
  servers[index] = updated;
  writeServers(servers);
  return toPublic(updated);
}

function deleteServer(id) {
  const servers = readServers();
  const next = servers.filter((s) => s.id !== id);
  if (next.length === servers.length) throw new Error('Servidor não encontrado.');
  writeServers(next);
}

// Uso interno do health-check — inclui o bearerToken real, por isso
// nunca deve ser exposto diretamente numa rota.
function getServersForHealthCheck() {
  return readServers();
}

module.exports = {
  listServers,
  createServer,
  updateServer,
  deleteServer,
  getServersForHealthCheck,
};
