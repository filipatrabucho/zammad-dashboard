const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { authenticate } = require('./middleware/auth');
const { authorize } = require('./middleware/authorize');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const ticketsRoutes = require('./routes/tickets');
const statsRoutes = require('./routes/stats');
const healthRoutes = require('./routes/health');
const settingsRoutes = require('./routes/settings');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
console.log('[cors] origem permitida (FRONTEND_ORIGIN):', env.frontendOrigin);
app.use(
  cors({
    origin: (origin, callback) => {
      // Sem `origin` = pedido same-origin ou ferramenta tipo curl — permitir.
      if (!origin || origin === env.frontendOrigin) {
        return callback(null, true);
      }
      console.warn('[cors] origem BLOQUEADA: "%s" (esperado: "%s")', origin, env.frontendOrigin);
      return callback(new Error('Origem não permitida por CORS.'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const api = express.Router();
api.use(apiLimiter);

// Rotas de autenticação (login/logout acontecem no browser via MSAL;
// aqui expomos apenas /me e /logout — ver routes/auth.js)
api.use('/auth', authRoutes);

// A partir daqui, todas as rotas exigem um JWT válido do Azure AD
// (authenticate) e o email tem de estar numa das listas do .env (authorize).
api.use('/tickets', authenticate, authorize, ticketsRoutes);
api.use('/stats', authenticate, authorize, statsRoutes);
api.use('/health', authenticate, authorize, healthRoutes);
api.use('/settings', authenticate, authorize, settingsRoutes);

api.use(notFoundHandler);
api.use(errorHandler);

app.use('/api', api);

// Servir o build estático do frontend (React), gerado por `npm run build`.
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next(err);
  });
});

module.exports = app;
