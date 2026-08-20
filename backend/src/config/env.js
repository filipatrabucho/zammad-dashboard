require('dotenv').config();

function splitList(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function required(name) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.warn(`[config] Variável de ambiente em falta: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  zammadUrl: required('ZAMMAD_URL'),
  zammadApiToken: required('ZAMMAD_API_TOKEN'),

  azureTenantId: required('AZURE_TENANT_ID'),
  azureClientId: required('AZURE_CLIENT_ID'),
  azureApiAudience: process.env.AZURE_API_AUDIENCE || process.env.AZURE_CLIENT_ID,

  allowedAdmins: splitList(process.env.ALLOWED_ADMINS),
  allowedViewers: splitList(process.env.ALLOWED_VIEWERS),

  logContainers: splitList(process.env.LOG_CONTAINERS),

  statsCacheTtlMs: parseInt(process.env.STATS_CACHE_TTL_MS, 10) || 60000,
  listCacheTtlMs: parseInt(process.env.LIST_CACHE_TTL_MS, 10) || 300000,

  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 120,
};

module.exports = env;
