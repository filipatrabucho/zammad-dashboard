const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[zammad-dashboard] backend a correr na porta ${env.port} (${env.nodeEnv})`);
});
