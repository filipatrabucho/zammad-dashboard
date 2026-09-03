const express = require('express');
const zammad = require('../services/zammadClient');

const router = express.Router();

/**
 * GET /api/tickets
 * Proxy para a pesquisa de tickets do Zammad, com filtros via query params:
 * ?query=texto&state=open&group=Suporte&assignee=user@empresa.com&page=1&perPage=25
 */
router.get('/', async (req, res, next) => {
  try {
    const { query, state, group, assignee, page, perPage, sortBy, orderBy } = req.query;
    const data = await zammad.searchTickets({
      query,
      state,
      group,
      assignee,
      page: page ? parseInt(page, 10) : undefined,
      perPage: perPage ? parseInt(perPage, 10) : undefined,
      sortBy,
      orderBy,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
