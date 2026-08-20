# ── Build do frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm install --workspace frontend --no-audit --no-fund
COPY frontend frontend
RUN npm run build --workspace frontend

# ── Runtime ──────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY backend/package.json backend/package.json
RUN npm install --prefix backend --omit=dev --no-audit --no-fund

COPY backend backend
COPY --from=frontend-build /app/frontend/dist frontend/dist

# Necessário para a funcionalidade de Logs (docker compose logs) --
# requer acesso ao socket do Docker do host (ver docker-compose.yml).
RUN apk add --no-cache docker-cli docker-cli-compose

EXPOSE 4000
CMD ["node", "backend/src/server.js"]
