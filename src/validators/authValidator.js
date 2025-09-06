// Schemas de validação para autenticação (Joi)
const Joi = require('joi');

// Política de senha: mínimo 8, precisa de letras e números (simplificada)
const passwordRule = Joi.string().min(8).max(128)
  .pattern(/[A-Za-z]/, 'letras')
  .pattern(/[0-9]/, 'números');

// Body de login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Body de registro
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: passwordRule.required()
});

const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });

module.exports = { loginSchema, registerSchema, refreshSchema, passwordRule };
