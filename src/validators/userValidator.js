// Schemas de validação para usuários (Joi)
const Joi = require('joi');

// Body para criação de usuário
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

// Body para atualização parcial de usuário
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(128)
}).min(1);

// Body para atualização de papel (role)
const updateRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin').required()
});

module.exports = { createUserSchema, updateUserSchema, updateRoleSchema };
