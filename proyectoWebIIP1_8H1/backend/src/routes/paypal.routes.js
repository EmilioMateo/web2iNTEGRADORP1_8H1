const express = require('express');
const router = express.Router();
const {captureOrder} = require('../controllers/paypal.controller');
const {createOrder} = require('../controllers/paypal.controller');

router.post('/capturarOrden', captureOrder);
router.post('/crearOrden', createOrder);
module.exports = router;