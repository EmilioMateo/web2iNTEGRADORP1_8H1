const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito.controller');

router.get('/:username', carritoController.getCarrito);
router.post('/', carritoController.addToCarrito);
router.put('/:idCarrito', carritoController.updateCantidad);
router.post('/validate/:username', carritoController.validarStock);
router.delete('/clear/:username', carritoController.clearCarrito);
router.delete('/:idCarrito', carritoController.removeFromCarrito);

module.exports = router;
