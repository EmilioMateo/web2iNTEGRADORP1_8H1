const express = require('express');
const router = express.Router();
const {getProductos} = require('../controllers/productos.controller');

router.get('/producto', getProductos);
module.exports = router;