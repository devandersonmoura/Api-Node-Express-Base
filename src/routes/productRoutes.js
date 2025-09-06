// Rotas de produtos
const express = require('express');
const ctrl = require('../controllers/productController');
const asyncHandler = require('../helpers/asyncHandler');
const validate = require('../middlewares/validate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

const { requireAuth, requireRole } = require('../middlewares/auth');
const { validateIdParam } = require('../middlewares/params');
const router = express.Router();

// Exige autenticação para todas as rotas seguintes
router.use(requireAuth);

// Valida automaticamente o parâmetro :id
router.param('id', validateIdParam);
// Lista produtos
router.get('/', asyncHandler(ctrl.index));
// Busca produto por ID
router.get('/:id', asyncHandler(ctrl.show));
// Cria produto (apenas admin)
router.post('/', requireRole('admin'), validate(createProductSchema), asyncHandler(ctrl.store));
// Atualiza produto (apenas admin)
router.put('/:id', requireRole('admin'), validate(updateProductSchema), asyncHandler(ctrl.update));
// Remove produto (apenas admin)
router.delete('/:id', requireRole('admin'), asyncHandler(ctrl.destroy));

module.exports = router;
