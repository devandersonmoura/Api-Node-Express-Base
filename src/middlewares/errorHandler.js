// Middlewares para rotas não encontradas e tratamento de erros
const { fail } = require('../helpers/http');
const logger = require('../utils/logger');

/** Retorna 404 para qualquer rota inexistente. */
function notFound(_req, res, _next) {
  return fail(res, 'Rota não encontrada', 404);
}

// eslint-disable-next-line no-unused-vars
/**
 * Captura erros lançados nos handlers e retorna JSON padronizado.
 * Loga erros 5xx no console.
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  if (status >= 500) {
    if (req && req.log && typeof req.log.error === 'function') {
      req.log.error({ err }, 'Unhandled error');
    } else {
      logger.error(err);
    }
  }
  return fail(res, message, status, process.env.NODE_ENV === 'development' ? err.stack : undefined);
}

module.exports = { notFound, errorHandler };
