const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypal.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/crearOrden', verifyToken, paypalController.createOrder);
router.post('/capturarOrden', verifyToken, paypalController.captureOrder);
router.post('/send-ticket', verifyToken, paypalController.sendTicket);

module.exports = router;
