// Controlador HTTP de autenticação
const { success } = require('../helpers/http');
const userService = require('../services/userService');
const authService = require('../services/authService');

/** Registra um novo usuário (role padrão: user) e já retorna um token JWT. */
async function register(req, res) {
  const created = await userService.createUser(req.body);
  // Emitir token imediatamente após o registro.
  const { token } = await authService.login({ email: created.email, password: req.body.password });
  return success(res, { user: created, token }, null, 201);
}

/** Realiza login e retorna { user, token }. */
async function login(req, res) {
  const { user, token } = await authService.login(req.body);
  return success(res, { user, token });
}

/** Retorna o usuário do token atual (vem do middleware). */
async function me(req, res) {
  return success(res, { user: req.user });
}

module.exports = { register, login, me };
