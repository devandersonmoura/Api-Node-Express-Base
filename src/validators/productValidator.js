// Schemas de validação para produtos (Joi)
const Joi = require('joi');

// Body para criação de produto
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(160).required(),
  price: Joi.number().precision(2).min(0).required()
});

// Body para atualização parcial de produto
const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(160),
  price: Joi.number().precision(2).min(0)
}).min(1);

module.exports = { createProductSchema, updateProductSchema };
