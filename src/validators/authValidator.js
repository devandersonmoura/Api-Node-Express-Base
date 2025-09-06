// Schemas de validação para autenticação (Joi)
const Joi = require('joi');

// Body de login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

// Body de registro
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

module.exports = { loginSchema, registerSchema };
