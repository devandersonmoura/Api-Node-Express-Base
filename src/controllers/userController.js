// Controlador HTTP para usuários (conecta rota -> serviço)
const { success } = require('../helpers/http');
const { parsePagination } = require('../utils/pagination');
const userService = require('../services/userService');

/** Lista usuários com paginação a partir da query string. */
async function index(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const search = req.query.search || '';
  const { data, total } = await userService.listUsers({ limit, offset, search });
  return success(res, data, { page, limit, total });
}

/** Busca um usuário específico pelo ID (params). */
async function show(req, res) {
  const { id } = req.params;
  const item = await userService.getUser(Number(id));
  return success(res, item);
}

/** Cria um usuário (validação acontece no middleware). */
async function store(req, res) {
  const created = await userService.createUser(req.body);
  return success(res, created, null, 201);
}

/** Atualiza um usuário pelo ID. */
async function update(req, res) {
  const { id } = req.params;
  const updated = await userService.updateUser(Number(id), req.body);
  return success(res, updated);
}

/** Remove um usuário pelo ID. */
async function destroy(req, res) {
  const { id } = req.params;
  await userService.deleteUser(Number(id));
  return res.status(204).send();
}

/** Promove um usuário para admin. */
async function promote(req, res) {
  const { id } = req.params;
  const updated = await userService.promoteUser(Number(id));
  return success(res, updated);
}

module.exports = { index, show, store, update, destroy, promote };
