const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { authenticate } = require('./middleware/auth');
const { authorize, adminOnly } = require('./middleware/authorize');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const ticketsRoutes = require('./routes/tickets');
const groupsRoutes = require('./routes/groups');
const statesRoutes = require('./routes/states');
const usersRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const logsRoutes = require('./routes/logs');
const healthRoutes = require('./routes/health');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
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
api.use('/groups', authenticate, authorize, groupsRoutes);
api.use('/states', authenticate, authorize, statesRoutes);
api.use('/users', authenticate, authorize, usersRoutes);
api.use('/stats', authenticate, authorize, statsRoutes);
api.use('/health', authenticate, authorize, healthRoutes);

// Logs de containers — apenas admins
api.use('/logs', authenticate, authorize, adminOnly, logsRoutes);

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
