// Controle simples de tentativas de login (em memória)
const env = require('../config/env');

const store = new Map(); // email -> { count, firstAt, lockedUntil }

function now() { return Date.now(); }

function getWindowMs() { return env.auth.windowMinutes * 60 * 1000; }
function getLockoutMs() { return env.auth.lockoutMinutes * 60 * 1000; }

function get(email) {
  return store.get(email) || { count: 0, firstAt: 0, lockedUntil: 0 };
}

function save(email, data) { store.set(email, data); }

function clear(email) { store.delete(email); }

function isLocked(email) {
  const rec = get(email);
  if (rec.lockedUntil && rec.lockedUntil > now()) return true;
  return false;
}

function recordFailure(email) {
  const rec = get(email);
  const t = now();
  if (!rec.firstAt || (t - rec.firstAt) > getWindowMs()) {
    rec.firstAt = t;
    rec.count = 1;
  } else {
    rec.count += 1;
  }
  if (rec.count >= env.auth.maxAttempts) {
    rec.lockedUntil = t + getLockoutMs();
  }
  save(email, rec);
  return rec;
}

function recordSuccess(email) { clear(email); }

module.exports = { isLocked, recordFailure, recordSuccess };

