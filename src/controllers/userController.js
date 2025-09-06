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
  if (req.log && typeof req.log.info === 'function') {
    req.log.info({ action: 'user.create', actorId: req.user && req.user.id, targetId: created.id, email: created.email }, 'user created');
  }
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
  if (req.log && typeof req.log.info === 'function') {
    req.log.info({ action: 'user.delete', actorId: req.user && req.user.id, targetId: Number(id) }, 'user deleted');
  }
  return res.status(204).send();
}

/** Define o papel do usuário explicitamente (body.role). */
async function setRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  if (req.user && req.user.id === Number(id) && role === 'user') {
    const err = new Error('Você não pode rebaixar a si mesmo');
    err.status = 400;
    throw err;
  }
  const before = await userService.getUser(Number(id));
  const updated = await userService.setRole(Number(id), role);
  if (req.log && typeof req.log.info === 'function') {
    req.log.info({ action: 'setRole', actorId: req.user.id, targetId: Number(id), from: before.role, to: role }, 'role change');
  }
  return success(res, updated);
}

module.exports = { index, show, store, update, destroy, setRole };
