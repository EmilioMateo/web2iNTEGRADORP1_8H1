const db = require('../config/db');
const productosService = require('../services/productos.service');

const getProductos = (req, res) => {
    const sql = 'SELECT * FROM productos';

    db.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener productos' });
        }

        res.json(resultados);
    });
};

const createProducto = (req, res) => {
    let producto;

    try {
        producto = productosService.buildProductoForCreate(req.body);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Error al crear producto' });
    }

    const sql = 'INSERT INTO productos (nombre, precio, descripcion, imagenUrl, categoria, especificaciones, grupoMuscular, tipoEntrenamiento, tamano, pesoMaximoSoportado, enStock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
        producto.nombre,
        producto.precio,
        producto.descripcion,
        producto.imagenUrl,
        producto.categoria,
        producto.especificaciones,
        producto.grupoMuscular,
        producto.tipoEntrenamiento,
        producto.tamano,
        producto.pesoMaximoSoportado,
        producto.enStock
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            return res.status(500).json({ error: 'Error al crear producto' });
        }

        res.status(201).json({ message: 'Producto creado', id: result.insertId });
    });
};

const updateStock = (req, res) => {
    const { id } = req.params;
    let stock;

    try {
        stock = productosService.validateStock(req.body.enStock);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message || 'Error al actualizar stock' });
    }

    const sql = 'UPDATE productos SET enStock = ? WHERE id = ?';

    db.query(sql, [stock, id], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error al actualizar stock' });
        }

        res.json({ message: 'Stock actualizado', id, enStock: stock });
    });
};

const deleteProducto = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM productos WHERE id = ?';

    db.query(sql, [id], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error al eliminar producto' });
        }

        res.json({ message: 'Producto eliminado', id });
    });
};

module.exports = {
    getProductos,
    createProducto,
    updateStock,
    deleteProducto
};
