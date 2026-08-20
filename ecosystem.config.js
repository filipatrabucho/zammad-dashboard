// Configuração do PM2 — alternativa ao Docker para arrancar o backend
// (que serve também o build estático do frontend).
// Uso: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'zammad-dashboard',
      cwd: __dirname,
      script: 'backend/src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
