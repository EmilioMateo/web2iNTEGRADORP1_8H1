const express = require('express');
const router = express.Router();
const {getProductos, createProducto, updateStock, deleteProducto} = require('../controllers/productos.controller');

router.get('/producto', getProductos);
router.post('/producto', createProducto);
router.put('/producto/:id/stock', updateStock);
router.delete('/producto/:id', deleteProducto);
module.exports = router;