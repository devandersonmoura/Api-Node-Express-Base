// Entrada do servidor Express: middlewares, rotas e Swagger
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

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

// Rotas da API
app.use('/api', apiRoutes);

// Swagger UI
const swaggerDocPath = path.join(__dirname, '..', 'docs', 'openapi.json');
// Lazy load JSON to avoid require cache issues during dev
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const spec = require(swaggerDocPath);
  return swaggerUi.setup(spec)(req, res, next);
});

// Not found + error handling
app.use(notFound);
app.use(errorHandler);

// Inicia o servidor HTTP
app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
