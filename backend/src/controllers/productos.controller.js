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

    const sql = 'INSERT INTO productos (id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
        producto.id,
        producto.nombre,
        producto.precio,
        producto.descripcion,
        producto.imagenUrl,
        producto.categoria,
        producto.enStock,
        producto.idCarrito
    ];

    db.query(sql, values, (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error al crear producto' });
        }

        res.status(201).json({ message: 'Producto creado', id: producto.id });
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
