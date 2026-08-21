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
 *
 * Usamos `docker logs` (não `docker compose logs`): este processo não tem
 * acesso ao ficheiro docker-compose.yml da stack do Zammad, só ao socket
 * do Docker (montado no docker-compose.yml deste projeto) — `docker logs`
 * funciona diretamente pelo nome/ID do container, sem precisar desse
 * ficheiro. Usa `docker ps --format '{{.Names}}'` no servidor para veres
 * os nomes reais dos containers a colocar em LOG_CONTAINERS.
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
    ['logs', '--tail', String(tail), container],
    { timeout: 15000, maxBuffer: 5 * 1024 * 1024 },
    (err, stdout, stderr) => {
      // `docker logs` escreve o output normal em stderr (comportamento do
      // Docker), por isso só tratamos como erro quando o processo `docker`
      // falhou mesmo (exit code != 0) — não quando stderr só tem os logs.
      if (err) {
        let detail = (stderr || err.message || '').trim();
        console.error('[logs] docker logs "%s" ERRO:', container, detail);

        // Erro clássico quando o backend corre numa máquina sem daemon
        // Docker local (ex: Windows sem Docker Desktop a correr, ou o
        // Zammad vive noutro host). Ver DOCKER_HOST no backend/.env.example.
        const looksLikeNoLocalDaemon = /dockerDesktopLinuxEngine|docker\.sock|daemon is running/i.test(
          detail
        );
        if (looksLikeNoLocalDaemon && !process.env.DOCKER_HOST) {
          detail +=
            '\n\nEste backend não tem um daemon Docker local. Se o Zammad corre noutra máquina, ' +
            'define DOCKER_HOST no backend/.env a apontar para lá (ex: ssh://user@servidor) — ver .env.example.';
        }

        const error = new Error(
          `Não foi possível obter os logs do container "${container}": ${detail}`
        );
        error.status = 502;
        error.expose = true;
        return next(error);
      }
      return res.json({ container, tail, logs: [stdout, stderr].filter(Boolean).join('') });
    }
  );
});

module.exports = router;
