// Converte query params (?page=&limit=) em números seguros
function parsePagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

module.exports = { parsePagination };
