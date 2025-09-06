// Logger simples para infos e erros (pode trocar por lib)
function info(...args) {
  console.log('[INFO]', ...args);
}

function error(...args) {
  console.error('[ERROR]', ...args);
}

module.exports = { info, error };
