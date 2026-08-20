# Zammad Dashboard

Dashboard interno para monitorizar tickets do [Zammad](https://zammad.org),
com autenticação via Azure AD (Microsoft Entra ID) e controlo de acesso por
lista de emails (admin / viewer).

- **Backend**: Node.js + Express, proxy autenticado para a API do Zammad.
- **Frontend**: React (Vite), com login Microsoft via MSAL, gráficos
  clicáveis (Recharts) e tabela de tickets com filtros.
- **Autenticação**: o frontend obtém um token do Azure AD (MSAL, Authorization
  Code + PKCE) e envia-o como `Authorization: Bearer <token>` em cada pedido
  à API; o backend valida a assinatura do JWT contra as chaves públicas do
  tenant (`jsonwebtoken` + `jwks-rsa`) — sem sessões/cookies no servidor.
- **Autorização**: só quem estiver listado em `ALLOWED_ADMINS` ou
  `ALLOWED_VIEWERS` (no `.env` do backend) consegue usar o dashboard.
  Admins veem tudo, incluindo o separador **Logs**; viewers só veem os
  dados (Overview, Tickets, Grupos).

---

## 1. Estrutura do projeto

```
zammad-dashboard/
├── backend/          # API Express (proxy Zammad, auth, stats, logs)
├── frontend/          # React (Vite) — UI do dashboard
├── Dockerfile          # build multi-stage (frontend + backend)
├── docker-compose.yml
├── ecosystem.config.js # alternativa via PM2 (sem Docker)
```

Em produção, o Express (`backend`) serve diretamente os ficheiros estáticos
do build do React (`frontend/dist`) — um único processo, uma única porta.

---

## 2. Pré-requisitos

- Node.js ≥ 18
- Uma instância Zammad acessível, com um **token de API** (Perfil → Token de
  Acesso, com permissões de leitura sobre tickets/grupos/estados/utilizadores)
- Uma **App Registration** no Azure AD (ver secção 4)
- Docker (opcional, para deploy via container) ou PM2/systemd (opcional)

---

## 3. Setup local (desenvolvimento)

```bash
git clone <este-repo>
cd zammad-dashboard
npm install                     # instala backend + frontend (workspaces)

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# edita os dois ficheiros com os teus valores (ver secções 4 e 5)

npm run dev                     # corre backend (porta 4000) + frontend (porta 4080)
```

Abre `http://localhost:4080`. O Vite faz proxy de `/api/*` para o backend
(`http://localhost:4000`), configurável em `frontend/vite.config.js`.

---

## 4. Registar a app no Azure AD

Usamos **uma única App Registration**. O frontend pede só os scopes OIDC
padrão (`openid`, `profile`, `email`) e envia o **idToken** ao backend — não
é preciso configurar "Expose an API" nem nenhum scope customizado.

1. Vai a **Azure Portal → Microsoft Entra ID → App registrations → New
   registration**.
   - Nome: `Zammad Dashboard`
   - Supported account types: normalmente "Accounts in this organizational
     directory only" (single tenant)
   - Não definas Redirect URI ainda — fazemos isso a seguir.
2. Em **Authentication → Add a platform → Single-page application**:
   - Redirect URI: `http://localhost:4080` (dev) e o URL de produção (ex:
     `https://dashboard.empresa.local`)
   - Ativa "Access tokens" e "ID tokens" se pedido.
3. Anota:
   - **Application (client) ID** → `AZURE_CLIENT_ID` (backend) e
     `VITE_AZURE_CLIENT_ID` (frontend) — é o mesmo valor nos dois.
   - **Directory (tenant) ID** → `AZURE_TENANT_ID` / `VITE_AZURE_TENANT_ID`.

Não é necessário client secret — o frontend é uma SPA pública (PKCE), e o
backend só valida a assinatura/claims do idToken (não faz nenhum pedido
autenticado ao Azure AD).

> Precisas de chamar a Microsoft Graph API a partir do frontend (ex:
> foto de perfil)? Nesse caso sim, terias de adicionar um scope como
> `User.Read` a `loginRequest.scopes` em `frontend/src/auth/authConfig.js`
> — mas para autenticar no backend deste dashboard não é preciso.

---

## 5. Variáveis de ambiente

### Backend (`backend/.env`, a partir de `backend/.env.example`)

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor Express (default `4000`) |
| `FRONTEND_ORIGIN` | Origem permitida pelo CORS (dev: `http://localhost:4080`) |
| `ZAMMAD_URL` | URL base da instância Zammad |
| `ZAMMAD_API_TOKEN` | Token de API do Zammad |
| `AZURE_TENANT_ID` | Tenant ID da App Registration |
| `AZURE_CLIENT_ID` | Client ID da App Registration |
| `AZURE_API_AUDIENCE` | Opcional — só necessário se usares um scope de API customizado (ver secção 4) |
| `ALLOWED_ADMINS` | Emails com acesso total, separados por vírgulas |
| `ALLOWED_VIEWERS` | Emails com acesso só de leitura, separados por vírgulas |
| `LOG_CONTAINERS` | Whitelist de nomes de containers visíveis em Logs |
| `STATS_CACHE_TTL_MS` / `LIST_CACHE_TTL_MS` | TTL da cache em memória |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Rate limiting da API |

### Frontend (`frontend/.env.local`, a partir de `frontend/.env.example`)

| Variável | Descrição |
|---|---|
| `VITE_AZURE_CLIENT_ID` | Igual a `AZURE_CLIENT_ID` do backend |
| `VITE_AZURE_TENANT_ID` | Igual a `AZURE_TENANT_ID` do backend |
| `VITE_REDIRECT_URI` | URL onde o frontend corre |
| `VITE_DEFAULT_REFRESH_SECONDS` | Intervalo de auto-refresh por omissão |

**Nunca faças commit dos ficheiros `.env` / `.env.local`** — já estão no
`.gitignore`.

---

## 6. Gerir quem tem acesso (admins / viewers)

O acesso é controlado inteiramente pelas duas listas no `backend/.env`:

```bash
ALLOWED_ADMINS=maria@empresa.com,joao@empresa.com
ALLOWED_VIEWERS=suporte1@empresa.com,suporte2@empresa.com
```

- **Adicionar alguém**: acrescenta o email (o mesmo usado para login com a
  conta Microsoft) a uma das listas, separado por vírgula, e reinicia o
  backend (`pm2 restart zammad-dashboard` ou `docker compose restart`).
- **Remover alguém**: apaga o email da lista e reinicia o backend.
- **Promover/despromover**: move o email entre `ALLOWED_ADMINS` e
  `ALLOWED_VIEWERS`.
- Um email que não esteja em nenhuma das duas listas recebe `403 Forbidden`
  em qualquer pedido à API, mesmo com login Microsoft válido.
- A comparação de emails é case-insensitive.

Não é preciso tocar em código nem na App Registration do Azure para gerir
acessos — é só edição do `.env` local ao servidor.

---

## 7. Build e deploy em produção

### Opção A — Docker (recomendado)

```bash
cp backend/.env.example backend/.env   # preenche com os valores de produção
docker compose up -d --build
```

O `Dockerfile` faz build do frontend e corre o backend, que serve tudo numa
porta só (`4000` por omissão). O `docker-compose.yml` monta o socket do
Docker do host (só leitura) para a página de **Logs** poder correr
`docker logs` sobre os containers do Zammad, pelo nome real de cada um
(ver `LOG_CONTAINERS` na secção 5 — usa `docker ps --format '{{.Names}}'`
no servidor para os encontrares).

### Opção B — PM2 (sem Docker)

```bash
npm install
npm run build                # gera frontend/dist
npm install -g pm2           # se ainda não tiveres
pm2 start ecosystem.config.js --env production
pm2 save
```

### Opção C — systemd

Exemplo de unit file (`/etc/systemd/system/zammad-dashboard.service`):

```ini
[Unit]
Description=Zammad Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/zammad-dashboard
ExecStart=/usr/bin/node backend/src/server.js
Restart=on-failure
EnvironmentFile=/opt/zammad-dashboard/backend/.env
User=zammad-dashboard

[Install]
WantedBy=multi-user.target
```

```bash
npm run build
sudo systemctl enable --now zammad-dashboard
```

---

## 8. Rede / firewall (acesso só na rede interna)

Este dashboard **não deve ser exposto à internet pública**. Recomendado:

- Publicar a porta apenas no IP da interface interna
  (`docker-compose.yml`: `"192.168.1.10:4000:4000"` em vez de `"4000:4000"`),
  ou correr atrás de um reverse proxy (nginx/Caddy) que só aceita ligações
  da rede local/VPN.
- Bloquear a porta no firewall do host para qualquer origem fora da rede
  interna (`ufw`, `firewalld`, ou regras do provedor cloud).
- HTTPS: mesmo em rede interna, recomenda-se TLS (certificado interno ou
  Let's Encrypt com DNS challenge) — os tokens de acesso são sensíveis.

---

## 9. Estrutura da API (backend)

Todas as rotas abaixo (exceto `/api/auth/me`) exigem um `Authorization:
Bearer <token>` válido e o email do utilizador numa das listas do `.env`.

| Rota | Descrição | Acesso |
|---|---|---|
| `GET /api/auth/me` | Identidade + role do utilizador autenticado | qualquer autenticado autorizado |
| `GET /api/tickets` | Pesquisa de tickets (query, state, group, assignee, page, perPage) | admin/viewer |
| `GET /api/tickets/:id` | Detalhe de um ticket | admin/viewer |
| `GET /api/groups` | Lista de grupos | admin/viewer |
| `GET /api/states` | Lista de estados possíveis | admin/viewer |
| `GET /api/users` | Lista de agentes | admin/viewer |
| `GET /api/stats/overview?days=30` | Agregações (por estado/grupo/assignee, KPIs) | admin/viewer |
| `GET /api/stats/timeseries?days=30` | Série temporal criados vs fechados | admin/viewer |
| `GET /api/logs` | Lista de containers permitidos | **admin** |
| `GET /api/logs/:container?tail=200` | `docker logs` do container | **admin** |

Notas de segurança implementadas:

- `:container` é sempre validado contra a whitelist `LOG_CONTAINERS` — nunca
  é passado input livre a um comando de shell (usa `execFile`, sem shell).
- Rate limiting básico em todas as rotas `/api`.
- CORS restrito à origem configurada em `FRONTEND_ORIGIN`.
- Cache em memória (TTL configurável) para as rotas de listas/estatísticas,
  para não sobrecarregar a instância Zammad.
- Erros do Zammad (offline, timeout, token inválido) são tratados de forma
  consistente e nunca expõem detalhes internos ao cliente.

---

## 10. Limitações conhecidas

- As agregações em `/api/stats/*` são calculadas sobre os tickets mais
  recentes devolvidos pela pesquisa do Zammad (até um limite configurável,
  por omissão 1500–3000), não sobre a totalidade histórica da base de
  dados — suficiente para um dashboard operacional, mas não é um relatório
  exaustivo.
- "SLA em risco" é uma aproximação baseada no campo `escalation_at` do
  Zammad; ajusta a lógica em `backend/src/services/statsService.js` se o
  teu SLA for calculado de outra forma.
