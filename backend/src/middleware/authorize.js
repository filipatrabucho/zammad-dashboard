const { getRole } = require('../utils/role');

/**
 * Middleware de autorização — deve correr depois de `authenticate`.
 * Bloqueia (403) quem não estiver em nenhuma das listas do .env,
 * e anexa `req.userRole` ('admin' | 'viewer') para uso posterior.
 */
function authorize(req, res, next) {
  const email = req.user && req.user.email;
  const role = getRole(email);

  console.log('[authorize] email="%s" -> role=%s', email, role || 'NENHUM (não autorizado)');

  if (!role) {
    return res.status(403).json({
      error: 'Acesso negado. O teu email não está autorizado a usar este dashboard.',
    });
  }

  req.userRole = role;
  return next();
}

/**
 * Middleware adicional — restringe a rotas apenas para admins
 * (ex: logs de containers). Deve correr depois de `authorize`.
 */
function adminOnly(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Esta ação requer privilégios de administrador.' });
  }
  return next();
}

module.exports = { authorize, adminOnly };
