const express = require('express');
const { adminOnly } = require('../middleware/authorize');
const store = require('../services/settingsStore');

const router = express.Router();

/**
 * GET /api/settings/wallboard
 * Definições do wallboard (período + widgets visíveis). Leitura disponível
 * a qualquer utilizador autorizado — é o próprio ecrã da Sala IT que as lê.
 */
router.get('/wallboard', (req, res) => {
  res.json(store.readSettings());
});

/**
 * PUT /api/settings/wallboard
 * Atualiza as definições. Só admins podem alterar o que aparece no ecrã.
 */
router.put('/wallboard', adminOnly, (req, res) => {
  const updated = store.writeSettings(req.body || {});
  res.json(updated);
});

module.exports = router;
