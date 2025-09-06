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
  },
  auth: {
    refreshTokenDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10),
    maxAttempts: parseInt(process.env.AUTH_MAX_ATTEMPTS || '5', 10),
    windowMinutes: parseInt(process.env.AUTH_WINDOW_MINUTES || '15', 10),
    lockoutMinutes: parseInt(process.env.AUTH_LOCKOUT_MINUTES || '15', 10)
  },
  http: {
    jsonLimit: process.env.JSON_LIMIT || '1mb',
    corsOrigins: (process.env.CORS_ORIGINS || '*')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authRateLimitWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000', 10),
    authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10)
  },
  docs: {
    basicUser: process.env.DOCS_BASIC_USER || 'admin',
    basicPass: process.env.DOCS_BASIC_PASS || 'admin'
  },
  logs: {
    trustedHosts: (process.env.LOG_TRUSTED_HOSTS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }
};

module.exports = env;
