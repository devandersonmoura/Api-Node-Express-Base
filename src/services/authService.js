const bcrypt = require('bcryptjs');
// Serviço de autenticação (login e utilitários)
const userRepository = require('../repositories/userRepository');
const { sign } = require('../helpers/jwt');

/** Remove o hash de senha do objeto de usuário. */
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

/**
 * Faz login comparando senha e gera um JWT.
 * @param {{email:string,password:string}}
 * @returns {Promise<{user:any, token:string}>}
 */
async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  const safe = sanitizeUser(user);
  const token = sign({ id: safe.id, email: safe.email, name: safe.name });
  return { user: safe, token };
}

module.exports = { login, sanitizeUser };
