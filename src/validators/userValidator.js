// Schemas de validação para usuários (Joi)
const Joi = require('joi');

const { passwordRule } = require('./authValidator');

// Body para criação de usuário
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: passwordRule.required()
});

// Body para atualização parcial de usuário
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  email: Joi.string().email(),
  password: passwordRule
}).min(1);

// Body para atualização de papel (role)
const updateRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin').required()
});

module.exports = { createUserSchema, updateUserSchema, updateRoleSchema };
