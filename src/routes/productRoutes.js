// Rotas de produtos
const express = require('express');
const ctrl = require('../controllers/productController');
const asyncHandler = require('../helpers/asyncHandler');
const validate = require('../middlewares/validate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

const { requireAuth } = require('../middlewares/auth');
const router = express.Router();

// Exige autenticação para todas as rotas seguintes
router.use(requireAuth);
// Lista produtos
router.get('/', asyncHandler(ctrl.index));
// Busca produto por ID
router.get('/:id', asyncHandler(ctrl.show));
// Cria produto
router.post('/', validate(createProductSchema), asyncHandler(ctrl.store));
// Atualiza produto
router.put('/:id', validate(updateProductSchema), asyncHandler(ctrl.update));
// Remove produto
router.delete('/:id', asyncHandler(ctrl.destroy));

module.exports = router;
