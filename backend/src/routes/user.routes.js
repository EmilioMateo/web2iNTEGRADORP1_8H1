const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.get('/history', verifyToken, userController.getOrderHistory);

module.exports = router;
