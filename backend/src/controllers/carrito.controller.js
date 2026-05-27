const db = require('../config/db');
const carritoService = require('../services/carrito.service');

const getCarrito = (req, res) => {
    const { username } = req.params;
    const sql = `
        SELECT p.*, c.id as idCarrito, c.cantidad 
        FROM carrito c 
        JOIN productos p ON c.productoId = p.id 
        WHERE c.usernameUsuario = ?
    `;

    db.query(sql, [username], (error, resultados) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener carrito' });
        }
        res.json(resultados);
    });
};

const addToCarrito = (req, res) => {
    let item;
    try {
        item = carritoService.buildCarritoItem(req.body);
    } catch (error) {
        return res.status(error.status || 500).json({ error: error.message });
    }

    const checkSql = 'SELECT id, cantidad FROM carrito WHERE usernameUsuario = ? AND productoId = ?';
    db.query(checkSql, [item.usernameUsuario, item.productoId], (checkErr, results) => {
        if (checkErr) {
            return res.status(500).json({ error: 'Error verificando el carrito' });
        }

        if (results && results.length > 0) {
            const existingId = results[0].id;
            const updateSql = 'UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?';
            db.query(updateSql, [item.cantidad, existingId], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: 'Error actualizando cantidad' });
                res.status(200).json({ message: 'Cantidad actualizada', id: existingId, updated: true });
            });
        } else {
            const insertSql = 'INSERT INTO carrito (id, usernameUsuario, productoId, cantidad) VALUES (?, ?, ?, ?)';
            db.query(insertSql, [item.id, item.usernameUsuario, item.productoId, item.cantidad], (insertErr) => {
                if (insertErr) return res.status(500).json({ error: 'Error al agregar al carrito' });
                res.status(201).json({ message: 'Agregado al carrito', id: item.id });
            });
        }
    });
};

const updateCantidad = (req, res) => {
    const { idCarrito } = req.params;
    const { cantidad } = req.body;

    if (cantidad < 1) {
        return res.status(400).json({ error: 'Cantidad debe ser al menos 1' });
    }

    const sql = 'UPDATE carrito SET cantidad = ? WHERE id = ?';
    db.query(sql, [cantidad, idCarrito], (error) => {
        if (error) return res.status(500).json({ error: 'Error al actualizar cantidad' });
        res.json({ message: 'Cantidad actualizada con éxito' });
    });
};

const validarStock = (req, res) => {
    const { username } = req.params;
    const sql = `
        SELECT c.cantidad as cantidadPedida, p.enStock, p.nombre 
        FROM carrito c 
        JOIN productos p ON c.productoId = p.id 
        WHERE c.usernameUsuario = ?
    `;

    db.query(sql, [username], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al validar stock' });
        }

        const erroresStock = [];
        for (const fila of results) {
            if (fila.cantidadPedida > fila.enStock) {
                erroresStock.push(`Solo hay ${fila.enStock} disponibles de: ${fila.nombre}`);
            }
        }

        if (erroresStock.length > 0) {
            return res.status(400).json({ valid: false, errors: erroresStock });
        }

        res.json({ valid: true });
    });
};

const removeFromCarrito = (req, res) => {
    const { idCarrito } = req.params;
    const sql = 'DELETE FROM carrito WHERE id = ?';

    db.query(sql, [idCarrito], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error al eliminar del carrito' });
        }
        res.json({ message: 'Eliminado del carrito' });
    });
};

const clearCarrito = (req, res) => {
    const { username } = req.params;
    const sql = 'DELETE FROM carrito WHERE usernameUsuario = ?';

    db.query(sql, [username], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Error al vaciar carrito' });
        }
        res.json({ message: 'Carrito vaciado' });
    });
};

module.exports = {
    getCarrito,
    addToCarrito,
    updateCantidad,
    validarStock,
    removeFromCarrito,
    clearCarrito
};
