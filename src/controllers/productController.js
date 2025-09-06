// Controlador HTTP para produtos (conecta rota -> serviço)
const { success } = require('../helpers/http');
const { parsePagination } = require('../utils/pagination');
const productService = require('../services/productService');

/** Lista produtos com paginação a partir da query string. */
async function index(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const search = req.query.search || '';
  const { data, total } = await productService.listProducts({ limit, offset, search });
  return success(res, data, { page, limit, total });
}

/** Busca um produto específico pelo ID (params). */
async function show(req, res) {
  const { id } = req.params;
  const item = await productService.getProduct(Number(id));
  return success(res, item);
}

/** Cria um produto (validação acontece no middleware). */
async function store(req, res) {
  const created = await productService.createProduct(req.body);
  if (req.log && typeof req.log.info === 'function') {
    req.log.info({ action: 'product.create', actorId: req.user && req.user.id, targetId: created.id, name: created.name, price: created.price }, 'product created');
  }
  return success(res, created, null, 201);
}

/** Atualiza um produto pelo ID. */
async function update(req, res) {
  const { id } = req.params;
  const updated = await productService.updateProduct(Number(id), req.body);
  if (req.log && typeof req.log.info === 'function') {
    req.log.info({ action: 'product.update', actorId: req.user && req.user.id, targetId: Number(id) }, 'product updated');
  }
  return success(res, updated);
}

/** Remove um produto pelo ID. */
async function destroy(req, res) {
  const { id } = req.params;
  await productService.deleteProduct(Number(id));
  if (req.log && typeof req.log.info === 'function') {
    req.log.info({ action: 'product.delete', actorId: req.user && req.user.id, targetId: Number(id) }, 'product deleted');
  }
  return res.status(204).send();
}

module.exports = { index, show, store, update, destroy };
