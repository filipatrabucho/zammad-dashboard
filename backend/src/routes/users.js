const express = require('express');
const zammad = require('../services/zammadClient');
const cache = require('../services/cache');
const env = require('../config/env');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await cache.wrap('users', env.listCacheTtlMs, () => zammad.listUsers());
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
