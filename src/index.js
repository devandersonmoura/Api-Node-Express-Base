// Entrada do servidor Express: middlewares, rotas e Swagger
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const { basicAuthForDocs } = require('./middlewares/basicAuth');

const app = express();

// Middlewares globais
app.disable('x-powered-by');
app.set('trust proxy', false); // permite obter IP real atrás de proxies
app.use(helmet());
app.use(hpp());

// Logs estruturados + request-id + props extras (IP, user-agent)
app.use(pinoHttp({
  genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  customProps: function (req, _res) {
    // Captura referer apenas se for externo (domínio diferente do Host)
    const host = req.headers['host'];
    const refHeader = req.headers['referer'] || req.headers['referrer'];
    let safeReferer;
    if (refHeader) {
      try {
        const refUrl = new URL(refHeader);
        if (refUrl.host && host) {
          const isSameHost = refUrl.host === host;
          const trusted = (env.logs && Array.isArray(env.logs.trustedHosts)) ? env.logs.trustedHosts : [];
          const isTrusted = trusted.some(th => refUrl.host === th || refUrl.host.endsWith('.' + th));
          if (!isSameHost && !isTrusted) {
            safeReferer = refHeader;
          }
        }
      } catch (_e) {
        // ignora erros de parse
      }
    }
    return {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referer: safeReferer
    };
  },
  customSuccessMessage: function (req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: function (req, res, err) {
    return `error ${req.method} ${req.url} ${res.statusCode}: ${err && err.message}`;
  },
  autoLogging: {
    ignorePaths: ['/health']
  }
}));

// expõe X-Request-Id na resposta
app.use((req, res, next) => {
  if (req.id) res.setHeader('X-Request-Id', req.id);
  next();
});
// Limite do body JSON
app.use(express.json({ limit: env.http.jsonLimit }));

// CORS com whitelist (ou * se configurado)
if (env.http.corsOrigins.length === 1 && env.http.corsOrigins[0] === '*') {
  app.use(cors());
} else {
  app.use(cors({ origin: env.http.corsOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Readiness: verifica dependências críticas (MySQL)
app.get('/ready', async (_req, res) => {
  const { getPool } = require('./config/database');
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ready' });
  } catch (e) {
    return res.status(503).json({ status: 'unavailable', error: 'db' });
  }
});

// Enforce application/json nos métodos com body
app.use('/api', (req, res, next) => {
  const requiresJson = ['POST', 'PUT', 'PATCH'].includes(req.method);
  if (requiresJson && !req.is('application/json')) {
    return res.status(415).json({ success: false, message: 'Content-Type deve ser application/json' });
  }
  return next();
});

// Rate limit mais restrito para /api/auth
const authLimiter = rateLimit({
  windowMs: env.http.authRateLimitWindowMs,
  max: env.http.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth', authLimiter);

// Rate limit global para /api
const apiLimiter = rateLimit({
  windowMs: env.http.rateLimitWindowMs,
  max: env.http.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

// Rotas da API
app.use('/api', apiRoutes);

// Swagger UI
const swaggerDocPath = path.join(__dirname, '..', 'docs', 'openapi.json');
// Carrega JSON sob demanda para evitar cache do require durante o desenvolvimento
app.use('/docs', basicAuthForDocs, swaggerUi.serve, (req, res, next) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const spec = require(swaggerDocPath);
  return swaggerUi.setup(spec)(req, res, next);
});

// Rotas inexistentes + tratamento de erros
app.use(notFound);
app.use(errorHandler);

// Inicia o servidor HTTP quando não for importado por testes
if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`Servidor ouvindo em http://localhost:${env.port}`);
  });
}

module.exports = app;
