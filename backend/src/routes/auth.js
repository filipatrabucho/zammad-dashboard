const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

/**
 * GET /api/auth/me
 * Devolve a identidade e o papel (role) do utilizador autenticado.
 * O frontend usa isto logo após o login MSAL para saber que UI mostrar.
 */
router.get('/me', authenticate, authorize, (req, res) => {
  res.json({
    email: req.user.email,
    name: req.user.name,
    role: req.userRole,
  });
});

/**
 * POST /api/auth/logout
 * O login/logout reais acontecem no browser via MSAL (redirect flow).
 * Este endpoint existe para simetria da API e para limpar eventual
 * estado guardado no servidor (cache por utilizador, etc.) no futuro.
 */
router.post('/logout', authenticate, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
