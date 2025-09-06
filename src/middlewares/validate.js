// Middleware de validação usando Joi
const { fail } = require('../helpers/http');

/**
 * Aplica um schema Joi ao corpo da requisição.
 * Retorna 422 com mensagens em caso de erro.
 */
function validate(schema) {
  return (req, res, next) => {
    const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
      return fail(res, 'Dados inválidos', 422, error.details.map(d => d.message));
    }
    req.body = value;
    next();
  };
}

module.exports = validate;
