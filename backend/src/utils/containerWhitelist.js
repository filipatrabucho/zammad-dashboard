const env = require('../config/env');

/**
 * Nunca aceitar o nome do container vindo diretamente do input do
 * utilizador para um comando de shell. Validamos sempre contra a
 * whitelist definida em LOG_CONTAINERS (.env).
 */
function isAllowedContainer(name) {
  if (typeof name !== 'string') return false;
  return env.logContainers.includes(name.trim());
}

module.exports = { isAllowedContainer };
