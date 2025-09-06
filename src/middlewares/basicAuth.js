// Basic Auth simples para proteger rotas (ex.: /docs)
const env = require('../config/env');

function parseAuthHeader(header) {
  if (!header || !header.startsWith('Basic ')) return null;
  try {
    const b64 = header.slice(6);
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1) return null;
    const username = decoded.slice(0, idx);
    const password = decoded.slice(idx + 1);
    return { username, password };
  } catch (_e) {
    return null;
  }
}

function basicAuthForDocs(req, res, next) {
  const creds = parseAuthHeader(req.headers.authorization);
  if (!creds || creds.username !== env.docs.basicUser || creds.password !== env.docs.basicPass) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Docs"');
    return res.status(401).send('Authentication required');
  }
  return next();
}

module.exports = { basicAuthForDocs };

