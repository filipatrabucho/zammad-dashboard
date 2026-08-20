const env = require('../config/env');

/**
 * Normaliza um email para comparação (trim + lowercase).
 */
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

/**
 * Determina o papel (role) de um utilizador com base no email,
 * verificando as listas ALLOWED_ADMINS / ALLOWED_VIEWERS do .env.
 *
 * @param {string} email
 * @returns {'admin'|'viewer'|null}
 */
function getRole(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  if (env.allowedAdmins.includes(normalized)) return 'admin';
  if (env.allowedViewers.includes(normalized)) return 'viewer';
  return null;
}

module.exports = { getRole, normalizeEmail };
