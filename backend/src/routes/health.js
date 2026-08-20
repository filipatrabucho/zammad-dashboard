const express = require('express');
const zammad = require('../services/zammadClient');

const router = express.Router();

/**
 * GET /api/health
 * Indicador de estado da ligação ao Zammad (online/offline), usado
 * pelo frontend para mostrar o indicador de estado da ligação.
 */
router.get('/', async (req, res) => {
  try {
    await zammad.ping();
    res.json({ zammad: 'online' });
  } catch (err) {
    res.status(200).json({ zammad: 'offline', detail: err.message });
  }
});

module.exports = router;
