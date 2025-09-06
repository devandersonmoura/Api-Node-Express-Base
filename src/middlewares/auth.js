// Middleware de autenticação e autorização JWT/RBAC
const { fail } = require('../helpers/http');
const { verify } = require('../helpers/jwt');

/** Extrai o token do header Authorization: Bearer <token>. */
function extractToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.substring(7);
  return null;
}

/**
 * Exige JWT válido. Decodifica o token e coloca o usuário em req.user.
 */
function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return fail(res, 'Não autorizado', 401);
    const payload = verify(token);
    req.user = { id: payload.id, email: payload.email, name: payload.name, role: payload.role || 'user' };
    return next();
  } catch (_e) {
    return fail(res, 'Token inválido ou expirado', 401);
  }
}

// Exige papel específico (ex.: 'admin')
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return fail(res, 'Proibido', 403);
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
