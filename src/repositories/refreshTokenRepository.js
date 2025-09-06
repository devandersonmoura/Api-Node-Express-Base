// DAO para refresh tokens
const { getPool } = require('../config/database');

async function create({ userId, token, expiresAt }) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
  return { id: result.insertId, user_id: userId, token, expires_at: expiresAt };
}

async function findValid(token) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, user_id, token, expires_at, revoked_at, created_at FROM refresh_tokens WHERE token = ? LIMIT 1',
    [token]
  );
  const rt = rows[0];
  if (!rt) return null;
  if (rt.revoked_at) return null;
  if (new Date(rt.expires_at) < new Date()) return null;
  return rt;
}

async function revoke(token) {
  const pool = getPool();
  await pool.query('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token = ?', [token]);
}

async function revokeAllForUser(userId) {
  const pool = getPool();
  await pool.query('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ?', [userId]);
}

module.exports = { create, findValid, revoke, revokeAllForUser };

