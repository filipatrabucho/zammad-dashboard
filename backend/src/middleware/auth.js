const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const env = require('../config/env');

const jwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${env.azureTenantId}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxAge: 12 * 60 * 60 * 1000, // 12h
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getSigningKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

const validIssuers = [
  `https://login.microsoftonline.com/${env.azureTenantId}/v2.0`,
  `https://sts.windows.net/${env.azureTenantId}/`,
];

const validAudiences = [env.azureClientId, env.azureApiAudience].filter(Boolean);

/**
 * Middleware de autenticação — valida o JWT do Azure AD (Bearer token)
 * em cada pedido. Não decide autorização (isso é feito em authorize.js).
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token de autenticação em falta.' });
  }

  jwt.verify(
    token,
    getSigningKey,
    {
      algorithms: ['RS256'],
      issuer: validIssuers,
      audience: validAudiences,
    },
    (err, decoded) => {
      if (err) {
        const message =
          err.name === 'TokenExpiredError'
            ? 'Sessão expirada. Volta a iniciar sessão.'
            : 'Token inválido.';
        return res.status(401).json({ error: message });
      }

      req.user = {
        email: decoded.preferred_username || decoded.email || decoded.upn,
        name: decoded.name,
        oid: decoded.oid,
        claims: decoded,
      };
      return next();
    }
  );
}

module.exports = { authenticate };
