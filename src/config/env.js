// Carrega variáveis de ambiente de .env e centraliza configuração
const dotenv = require('dotenv');
dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'apiteste'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'changeme-very-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};

module.exports = env;
