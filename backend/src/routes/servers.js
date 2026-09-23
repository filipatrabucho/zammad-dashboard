const express = require('express');
const { adminOnly } = require('../middleware/authorize');
const serversStore = require('../services/serversStore');
const serverHealthService = require('../services/serverHealthService');
const cache = require('../services/cache');

const router = express.Router();

const STATUS_CACHE_TTL_MS = 15000;
const STATUS_CACHE_KEY = 'servers:status';

/**
 * GET /api/servers/status
 * Estado atual (up/down, latência) dos servidores configurados — o
 * wallboard usa isto no painel "Outros servidores". Disponível a
 * qualquer utilizador autorizado (admin ou viewer); nunca inclui o
 * bearer token.
 */
router.get('/status', async (req, res, next) => {
  try {
    const data = await cache.wrap(STATUS_CACHE_KEY, STATUS_CACHE_TTL_MS, () => serverHealthService.checkAllServers());
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/servers
 * Lista de servidores configurados, para o Backoffice. O bearer token
 * nunca é devolvido — só um preview mascarado (últimos 4 caracteres).
 */
router.get('/', adminOnly, (req, res) => {
  res.json(serversStore.listServers());
});

/**
 * POST /api/servers
 */
router.post('/', adminOnly, (req, res) => {
  try {
    const created = serversStore.createServer(req.body || {});
    cache.delete(STATUS_CACHE_KEY);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/servers/:id
 */
router.put('/:id', adminOnly, (req, res) => {
  try {
    const updated = serversStore.updateServer(req.params.id, req.body || {});
    cache.delete(STATUS_CACHE_KEY);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/servers/:id
 */
router.delete('/:id', adminOnly, (req, res) => {
  try {
    serversStore.deleteServer(req.params.id);
    cache.delete(STATUS_CACHE_KEY);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
