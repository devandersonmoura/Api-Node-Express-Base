// Rotas de autenticação (login/registro e perfil)
const express = require('express');
const ctrl = require('../controllers/authController');
const asyncHandler = require('../helpers/asyncHandler');
const validate = require('../middlewares/validate');
const { loginSchema, registerSchema } = require('../validators/authValidator');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

// Registro (público)
router.post('/register', validate(registerSchema), asyncHandler(ctrl.register));
// Login (público)
router.post('/login', validate(loginSchema), asyncHandler(ctrl.login));
// Perfil (precisa de token)
router.get('/me', requireAuth, asyncHandler(ctrl.me));

module.exports = router;
