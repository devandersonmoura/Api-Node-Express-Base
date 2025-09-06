// Respostas JSON padronizadas de sucesso e erro
function success(res, data = null, meta = null, status = 200) {
  const body = { success: true };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(status).json(body);
}

function fail(res, message = 'Erro', status = 400, details = undefined) {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(status).json(body);
}

module.exports = { success, fail };
