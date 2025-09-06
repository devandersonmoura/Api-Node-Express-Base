// Acesso direto ao banco para produtos (DAO)
const { getPool } = require('../config/database');

/**
 * Lista produtos com paginação e busca.
 * @param {{limit:number, offset:number, search?:string}} params
 * @returns {Promise<{rows:any[], total:number}>}
 */
async function findAll({ limit, offset, search }) {
  const pool = getPool();
  const params = [];
  let where = '';
  if (search) {
    where = 'WHERE name LIKE ?';
    params.push(`%${search}%`);
  }
  const [rows] = await pool.query(
    `SELECT id, name, price, created_at, updated_at FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM products ${where}`,
    params
  );
  return { rows, total };
}

/**
 * Busca um produto pelo ID.
 * @param {number} id
 * @returns {Promise<any|null>}
 */
async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, price, created_at, updated_at FROM products WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Cria um novo produto.
 * @param {{name:string, price:number}} payload
 * @returns {Promise<{id:number,name:string,price:number}>}
 */
async function create({ name, price }) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO products (name, price) VALUES (?, ?)',
    [name, price]
  );
  return { id: result.insertId, name, price };
}

/**
 * Atualiza campos do produto (parcial).
 * @param {number} id
 * @param {{name?:string, price?:number}} payload
 * @returns {Promise<any|null>}
 */
async function update(id, { name, price }) {
  const pool = getPool();
  const fields = [];
  const params = [];
  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (price !== undefined) { fields.push('price = ?'); params.push(price); }
  if (fields.length === 0) return await findById(id);
  params.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
  return await findById(id);
}

/**
 * Remove um produto pelo ID.
 * @param {number} id
 * @returns {Promise<boolean>} true se removeu
 */
async function remove(id) {
  const pool = getPool();
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
