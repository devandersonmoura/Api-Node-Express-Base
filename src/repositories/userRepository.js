// Acesso direto ao banco para usuários (DAO)
const { getPool } = require('../config/database');

/**
 * Lista usuários com paginação e busca.
 * @param {{limit:number, offset:number, search?:string}} params
 * @returns {Promise<{rows: any[], total: number}>}
 */
async function findAll({ limit, offset, search }) {
  const pool = getPool();
  const params = [];
  let where = '';
  if (search) {
    where = 'WHERE name LIKE ? OR email LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  const [rows] = await pool.query(
    `SELECT id, name, email, created_at, updated_at FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM users ${where}`,
    params
  );
  return { rows, total };
}

/**
 * Busca um usuário pelo ID.
 * @param {number} id
 * @returns {Promise<any|null>}
 */
async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Cria um novo usuário.
 * @param {{name:string,email:string,passwordHash:string}} payload
 * @returns {Promise<{id:number,name:string,email:string}>}
 */
async function create({ name, email, passwordHash }) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, 'user']
  );
  return { id: result.insertId, name, email, role: 'user' };
}

/**
 * Atualiza campos do usuário (parcial).
 * @param {number} id
 * @param {{name?:string,email?:string,passwordHash?:string}} payload
 * @returns {Promise<any|null>}
 */
async function update(id, { name, email, passwordHash = undefined }) {
  const pool = getPool();
  const fields = [];
  const params = [];
  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (email !== undefined) { fields.push('email = ?'); params.push(email); }
  if (passwordHash !== undefined) { fields.push('password_hash = ?'); params.push(passwordHash); }
  if (fields.length === 0) return await findById(id);
  params.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
  return await findById(id);
}

/**
 * Remove um usuário pelo ID.
 * @param {number} id
 * @returns {Promise<boolean>} true se removeu
 */
async function remove(id) {
  const pool = getPool();
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Busca usuário pelo e-mail (inclui hash da senha).
 * @param {string} email
 * @returns {Promise<any|null>}
 */
async function findByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, role, password_hash, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
  /**
   * Atualiza o papel (role) do usuário.
   * @param {number} id
   * @param {'user'|'admin'} role
   * @returns {Promise<any|null>} usuário atualizado ou null se não existir
   */
  async setRole(id, role) {
    const pool = getPool();
    await pool.query('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, id]);
    return await findById(id);
  },
  /** Conta quantos admins existem atualmente. */
  async countAdmins() {
    const pool = getPool();
    const [[row]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
    return row.total;
  }
};
