// Router principal que agrega os módulos
const express = require('express');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Monta sub-rotas por recurso
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/auth', authRoutes);

module.exports = router;
