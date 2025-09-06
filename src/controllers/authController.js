// Controlador HTTP de autenticação
const { success } = require('../helpers/http');
const userService = require('../services/userService');
const authService = require('../services/authService');

/** Registra um novo usuário (role padrão: user) e já retorna tokens. */
async function register(req, res) {
  const created = await userService.createUser(req.body);
  // Emitir tokens imediatamente após o registro
  const { accessToken, refreshToken } = await authService.login({ email: created.email, password: req.body.password });
  return success(res, { user: created, accessToken, refreshToken }, null, 201);
}

/** Realiza login e retorna { user, accessToken, refreshToken }. */
async function login(req, res) {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  return success(res, { user, accessToken, refreshToken });
}

/** Retorna o usuário do token atual (vem do middleware). */
async function me(req, res) {
  return success(res, { user: req.user });
}

/** Emite novo accessToken a partir de um refreshToken válido. */
async function refresh(req, res) {
  const { refreshToken } = req.body || {};
  const { accessToken } = await authService.refresh(refreshToken);
  return success(res, { accessToken });
}

/** Revoga um refreshToken ou todos do usuário logado. */
async function logout(req, res) {
  const { refreshToken } = req.body || {};
  const userId = req.user && req.user.id;
  await authService.logout(refreshToken, userId);
  return res.status(204).send();
}

module.exports = { register, login, me, refresh, logout };
