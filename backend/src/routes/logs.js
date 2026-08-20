const express = require('express');
const { execFile } = require('child_process');
const { isAllowedContainer } = require('../utils/containerWhitelist');
const env = require('../config/env');

const router = express.Router();

/**
 * GET /api/logs
 * Lista os containers permitidos (whitelist), para o frontend
 * popular o seletor sem ter de o hardcodar.
 */
router.get('/', (req, res) => {
  res.json({ containers: env.logContainers });
});

/**
 * GET /api/logs/:container?tail=200
 * Restrita a admins (ver mount em app.js). O nome do container é
 * SEMPRE validado contra a whitelist LOG_CONTAINERS — nunca passamos
 * input livre do utilizador para `execFile`/shell.
 */
router.get('/:container', (req, res, next) => {
  const { container } = req.params;

  if (!isAllowedContainer(container)) {
    return res.status(400).json({
      error: 'Container inválido.',
      allowed: env.logContainers,
    });
  }

  const tailRaw = parseInt(req.query.tail, 10);
  const tail = Number.isInteger(tailRaw) && tailRaw > 0 && tailRaw <= 2000 ? tailRaw : 200;

  // execFile (sem shell) evita injeção de comandos — os argumentos
  // nunca passam por um interpretador de shell.
  execFile(
    'docker',
    ['compose', 'logs', '--no-color', '--tail', String(tail), container],
    { timeout: 15000, maxBuffer: 5 * 1024 * 1024 },
    (err, stdout, stderr) => {
      if (err && !stdout) {
        const error = new Error('Não foi possível obter os logs do container.');
        error.status = 502;
        error.expose = true;
        return next(error);
      }
      return res.json({ container, tail, logs: stdout || stderr || '' });
    }
  );
});

module.exports = router;
