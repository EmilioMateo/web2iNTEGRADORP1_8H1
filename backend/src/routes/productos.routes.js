const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, adminMiddleware } = require('../middleware/auth.middleware');
const {getProductos, createProducto, updateStock, deleteProducto} = require('../controllers/productos.controller');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `producto-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Solo se permiten imagenes JPG y PNG'));
            return;
        }

        cb(null, true);
    }
});

const uploadProductImage = (req, res, next) => {
    upload.single('imagen')(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        const message = error.code === 'LIMIT_FILE_SIZE'
            ? 'La imagen no debe superar 3 MB'
            : error.message;

        res.status(400).json({ error: message });
    });
};

router.get('/producto', getProductos);
router.post('/producto', verifyToken, adminMiddleware, uploadProductImage, createProducto);
router.put('/producto/:id/stock', verifyToken, adminMiddleware, updateStock);
router.delete('/producto/:id', verifyToken, adminMiddleware, deleteProducto);
module.exports = router;
