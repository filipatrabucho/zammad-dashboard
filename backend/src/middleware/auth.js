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
    if (err) {
      console.error('[auth] jwks getSigningKey ERRO para kid=%s:', header.kid, err.message);
      return callback(err);
    }
    callback(null, key.getPublicKey());
  });
}

const validIssuers = [
  `https://login.microsoftonline.com/${env.azureTenantId}/v2.0`,
  `https://sts.windows.net/${env.azureTenantId}/`,
];

const validAudiences = [env.azureClientId, env.azureApiAudience].filter(Boolean);

console.log('[auth] configuração JWT esperada:', {
  jwksUri: `https://login.microsoftonline.com/${env.azureTenantId}/discovery/v2.0/keys`,
  validIssuers,
  validAudiences,
});

/**
 * Middleware de autenticação — valida o JWT do Azure AD (Bearer token)
 * em cada pedido. Não decide autorização (isso é feito em authorize.js).
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    console.warn('[auth] %s %s — sem Authorization: Bearer <token>', req.method, req.originalUrl);
    return res.status(401).json({ error: 'Token de autenticação em falta.' });
  }

  // Log do conteúdo do token SEM verificar assinatura — só para comparar
  // iss/aud/kid com o que o backend espera quando a verificação falha.
  const unverified = jwt.decode(token, { complete: true });
  console.log('[auth] token recebido, claims (não verificadas):', {
    kid: unverified?.header?.kid,
    iss: unverified?.payload?.iss,
    aud: unverified?.payload?.aud,
    scp: unverified?.payload?.scp,
    upn: unverified?.payload?.preferred_username || unverified?.payload?.upn,
    exp: unverified?.payload?.exp && new Date(unverified.payload.exp * 1000).toISOString(),
  });

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
        console.error('[auth] jwt.verify() ERRO: %s — %s', err.name, err.message);
        const message =
          err.name === 'TokenExpiredError'
            ? 'Sessão expirada. Volta a iniciar sessão.'
            : 'Token inválido.';
        return res.status(401).json({ error: message });
      }

      console.log('[auth] token válido para', decoded.preferred_username || decoded.email || decoded.upn);

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
