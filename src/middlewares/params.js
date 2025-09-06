// Valida parâmetros comuns de rota (ex.: :id)
const { fail } = require('../helpers/http');

// Valida que :id é um inteiro positivo
function validateIdParam(req, res, next, id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return fail(res, 'Parâmetro id inválido', 400);
  }
  return next();
}

module.exports = { validateIdParam };

