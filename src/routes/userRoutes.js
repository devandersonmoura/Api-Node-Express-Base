// Rotas de usuários
const express = require('express');
const ctrl = require('../controllers/userController');
const asyncHandler = require('../helpers/asyncHandler');
const validate = require('../middlewares/validate');
const { createUserSchema, updateUserSchema, updateRoleSchema } = require('../validators/userValidator');

const { requireAuth, requireRole } = require('../middlewares/auth');
const { validateIdParam } = require('../middlewares/params');
const router = express.Router();

// Exige autenticação para todas as rotas seguintes
router.use(requireAuth);

// Valida automaticamente o parâmetro :id
router.param('id', validateIdParam);

// Somente admin pode gerenciar usuários
router.use(requireRole('admin'));
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

// Promove usuário para admin
router.post('/:id/promote', asyncHandler(ctrl.promote));

// Rebaixa usuário para role 'user'
router.post('/:id/demote', asyncHandler(ctrl.demote));

// Define explicitamente o papel do usuário (user/admin)
router.put('/:id/role', validate(updateRoleSchema), asyncHandler(ctrl.setRole));

module.exports = router;
