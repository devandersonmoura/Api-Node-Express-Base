# ApiTeste

API em Node.js/Express com MySQL (sem ORM), autenticação JWT e documentação via Swagger.

## Requisitos

- Node.js 16+
- MySQL 5.7+ ou 8+

## Instalação

1. Instale as dependências:
   - `npm install`
2. Configure o ambiente:
   - Copie `.env.example` para `.env` e ajuste os valores.
   - Variáveis principais:
     - `PORT` – porta do servidor (padrão 3000)
     - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – conexão MySQL
     - `JWT_SECRET`, `JWT_EXPIRES_IN` – segredo/expiração do token JWT
3. Prepare o banco de dados:
   - Execute o SQL de `scripts/init.sql` no seu MySQL para criar as tabelas.

## Executar

- Desenvolvimento: `npm run dev` (auto-reload com nodemon)
- Produção: `npm start`
- Testes: `npm test` (unitários de serviços e integração básica com supertest)

## Endpoints

- `GET /health` → `{ "status": "ok" }`
- `GET /ready` → `{ "status": "ready" }` quando o MySQL estiver acessível; caso contrário retorna 503
- Users: `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id`
- Users (admin): `PUT /api/users/:id/role` (definir papel explicitamente: `user` | `admin`)
- Products: `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Tokens: `POST /api/auth/refresh`, `POST /api/auth/logout`

## Autenticação (tokens e política)

- Após login/registro, a API retorna `accessToken` (JWT de curta duração) e `refreshToken`.
- Use o `accessToken` no header: `Authorization: Bearer <token>`.
- Atualização do token: `POST /api/auth/refresh` com `{ "refreshToken": "..." }` retorna novo `accessToken`.
- Logout: `POST /api/auth/logout` (com JWT). Envie `refreshToken` no body para revogar um específico; sem body, revoga todos do usuário atual.
- Política de senha: mínimo 8 caracteres, precisa conter letras e números.
- Bloqueio por tentativas: após `AUTH_MAX_ATTEMPTS` em `AUTH_WINDOW_MINUTES`, bloqueia por `AUTH_LOCKOUT_MINUTES`.

## Swagger

- UI da documentação: `http://localhost:3000/docs`
- Especificação OpenAPI: `docs/openapi.json`
- Protegido com Basic Auth: `admin` / `admin` (padrões configuráveis via `.env`)

## Health vs Ready

- `GET /health`: indica se a API está de pé (liveness).
- `GET /ready`: testa o MySQL com `SELECT 1` (readiness). Se falhar, responde 503.

## Paginação

- Parâmetros de query suportados: `page`, `limit`, `search` (onde aplicável).
- Resposta de listagem inclui `meta` com `{ page, limit, total }`.

## Estrutura do Projeto

```
src/
  config/        # configuração de env e pool do MySQL
  controllers/   # controladores HTTP (ligam rotas ao serviço)
  helpers/       # helpers de HTTP, async handler, JWT
  middlewares/   # tratamento de erros, validação, auth
  repositories/  # DAOs (acesso ao banco via SQL puro)
  routes/        # roteadores do Express
  services/      # regras de negócio
  utils/         # paginação, logger
  index.js       # entrada do servidor
scripts/
  init.sql       # schema do MySQL (tabelas)
```

## Formato de Respostas

- Sucesso (lista): `{ success: true, data: [...], meta: { page, limit, total } }`
- Sucesso (item): `{ success: true, data: { ... } }`
- Erro: `{ success: false, message: "...", details?: ["..."] }`

## Observações

- A API usa MySQL via `mysql2` (sem Sequelize/ORM) e acesso direto nos repositórios.
- Validação com `Joi` no middleware `validate`.
- Autenticação por JWT com `jsonwebtoken` e middleware `requireAuth`.
- RBAC: rotas de usuários exigem `admin`; produtos exigem `admin` para criar/atualizar/remover.
  - Admin define o papel via `PUT /api/users/:id/role` com body `{ "role": "user" | "admin" }`.
  - Proteções: não é permitido rebaixar a si mesmo nem remover o último admin.
- `/docs` protegido com Basic Auth (configurável por env): `DOCS_BASIC_USER` e `DOCS_BASIC_PASS`.

## Logs e Observabilidade

- Logs estruturados (JSON) com `pino-http`, incluindo `X-Request-Id` por requisição.
- Cabeçalho `X-Request-Id` exposto nas respostas; envie-o em chamadas subsequentes para correlação.
- Logs incluem IP (`req.ip`), `user-agent` e `referer` do cliente (apenas externos; referers do mesmo host são omitidos).
- É possível definir domínios/subdomínios confiáveis para não logar referer via `LOG_TRUSTED_HOSTS` (CSV),
  por exemplo: `seusite.com,admin.seusite.com`. Qualquer referer cujo host seja igual ou sufixo desses será omitido.
- Auditoria: registra operações sensíveis (mudança de papel, criação/remoção de usuários, criação/atualização/remoção de produtos) com `actorId`, `targetId` e ação.

## Segurança

- Headers e hardening:
  - `helmet` aplicado; `app.disable('x-powered-by')` para ocultar stack.
  - `hpp` contra HTTP Parameter Pollution.
- Rate limiting:
  - Global em `/api`: janela e máximo configuráveis via env.
  - Mais restrito em `/api/auth` para reduzir brute force.
- CORS:
  - Whitelist configurável em `CORS_ORIGINS` (separados por vírgula). Em dev, `*`.
- Body JSON:
  - Limite configurável via `JSON_LIMIT` (padrão `1mb`).
- Conteúdo e parâmetros:
  - Exige `Content-Type: application/json` em `POST/PUT/PATCH` de `/api`.
  - `:id` validado como inteiro positivo via `router.param`.

### Variáveis de ambiente (segurança)

- `CORS_ORIGINS=*` (ex.: `https://seusite.com,https://admin.seusite.com` em produção)
- `JSON_LIMIT=1mb`
- `RATE_LIMIT_WINDOW_MS=900000` (15 minutos) e `RATE_LIMIT_MAX=100`
- `AUTH_RATE_LIMIT_WINDOW_MS=60000` (1 minuto) e `AUTH_RATE_LIMIT_MAX=10`
