// Funções utilitárias para assinar e verificar JWTs
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/** Gera um token com o payload informado. */
function sign(payload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

/** Verifica e decodifica um token. Lança erro se inválido. */
function verify(token) {
  return jwt.verify(token, env.jwt.secret);
}

module.exports = { sign, verify };
