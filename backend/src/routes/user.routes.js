const express = require('express');
const router = express.Router();
const { verifyToken, adminMiddleware } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.get('/history', verifyToken, userController.getOrderHistory);
router.get('/admin/accounts', verifyToken, adminMiddleware, userController.getAccounts);
router.delete('/admin/accounts/:id', verifyToken, adminMiddleware, userController.deleteAccount);

module.exports = router;
