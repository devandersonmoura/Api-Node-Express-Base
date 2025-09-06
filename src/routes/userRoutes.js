// Rotas de usuários
const express = require('express');
const ctrl = require('../controllers/userController');
const asyncHandler = require('../helpers/asyncHandler');
const validate = require('../middlewares/validate');
const { createUserSchema, updateUserSchema } = require('../validators/userValidator');

const { requireAuth } = require('../middlewares/auth');
const router = express.Router();

// Exige autenticação para todas as rotas seguintes
router.use(requireAuth);
// Lista usuários
router.get('/', asyncHandler(ctrl.index));
// Busca usuário por ID
router.get('/:id', asyncHandler(ctrl.show));
// Cria usuário
router.post('/', validate(createUserSchema), asyncHandler(ctrl.store));
// Atualiza usuário
router.put('/:id', validate(updateUserSchema), asyncHandler(ctrl.update));
// Remove usuário
router.delete('/:id', asyncHandler(ctrl.destroy));

module.exports = router;
