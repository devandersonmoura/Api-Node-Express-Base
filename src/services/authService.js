const bcrypt = require('bcryptjs');
// Serviço de autenticação (login, refresh, logout, utilitários)
const userRepository = require('../repositories/userRepository');
const refreshRepo = require('../repositories/refreshTokenRepository');
const { sign } = require('../helpers/jwt');
const env = require('../config/env');
const crypto = require('crypto');
const attempts = require('../utils/attempts');

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
  if (attempts.isLocked(email)) {
    const err = new Error('Muitas tentativas. Tente mais tarde.');
    err.status = 429;
    throw err;
  }
  const user = await userRepository.findByEmail(email);
  if (!user) {
    attempts.recordFailure(email);
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    attempts.recordFailure(email);
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  attempts.recordSuccess(email);
  const safe = sanitizeUser(user);
  const accessToken = sign({ id: safe.id, email: safe.email, name: safe.name, role: safe.role || 'user' });
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + env.auth.refreshTokenDays * 24 * 60 * 60 * 1000);
  await refreshRepo.create({ userId: safe.id, token: refreshToken, expiresAt });
  return { user: safe, accessToken, refreshToken };
}

async function refresh(token) {
  const rec = await refreshRepo.findValid(token);
  if (!rec) {
    const err = new Error('Refresh token inválido');
    err.status = 401;
    throw err;
  }
  const user = await userRepository.findById(rec.user_id);
  if (!user) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  const safe = sanitizeUser(user);
  const accessToken = sign({ id: safe.id, email: safe.email, name: safe.name, role: safe.role || 'user' });
  return { accessToken };
}

async function logout(token, userId) {
  if (token) {
    await refreshRepo.revoke(token);
  } else if (userId) {
    await refreshRepo.revokeAllForUser(userId);
  }
}

module.exports = { login, sanitizeUser, refresh, logout };
