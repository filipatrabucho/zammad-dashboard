const express = require('express');
const statsService = require('../services/statsService');
const cache = require('../services/cache');
const env = require('../config/env');

const router = express.Router();

function parseDays(value, fallback = 30) {
  const n = parseInt(value, 10);
  if (!Number.isInteger(n) || n <= 0 || n > 365) return fallback;
  return n;
}

/**
 * GET /api/stats/overview?days=30
 */
router.get('/overview', async (req, res, next) => {
  try {
    const days = parseDays(req.query.days);
    const data = await cache.wrap(`overview:${days}`, env.statsCacheTtlMs, () =>
      statsService.getOverview({ days })
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/timeseries?days=30
 */
router.get('/timeseries', async (req, res, next) => {
  try {
    const days = parseDays(req.query.days);
    const data = await cache.wrap(`timeseries:${days}`, env.statsCacheTtlMs, () =>
      statsService.getTimeseries({ days })
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
