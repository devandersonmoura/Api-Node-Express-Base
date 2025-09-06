// Cria e expõe um pool de conexões MySQL (mysql2/promise)
const mysql = require('mysql2/promise');
const env = require('./env');

let pool; // cache do pool para reuso

/** Retorna um pool de conexões (singleton). */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

module.exports = {
  getPool
};
