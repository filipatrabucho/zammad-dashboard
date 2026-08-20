const { ZammadError } = require('../services/zammadClient');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZammadError) {
    return res.status(err.status).json({ error: err.message });
  }

  // eslint-disable-next-line no-console
  console.error('[error]', err);
  return res.status(err.status || 500).json({
    error: err.expose ? err.message : 'Erro interno do servidor.',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

module.exports = { errorHandler, notFoundHandler };
