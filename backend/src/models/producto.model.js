const db = require('../config/db');

const findAll = () => new Promise((resolve, reject) => {
    db.query('SELECT * FROM productos', (error, resultados) => {
        if (error) reject(error);
        resolve(resultados);
    });
});

const create = (producto) => new Promise((resolve, reject) => {
    const { id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito } = producto;
    const sql = 'INSERT INTO productos (id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito], (error) => {
        if (error) reject(error);
        resolve({ id });
    });
});

const updateStock = (id, enStock) => new Promise((resolve, reject) => {
    db.query('UPDATE productos SET enStock = ? WHERE id = ?', [enStock, id], (error) => {
        if (error) reject(error);
        resolve({ id, enStock });
    });
});

const remove = (id) => new Promise((resolve, reject) => {
    db.query('DELETE FROM productos WHERE id = ?', [id], (error) => {
        if (error) reject(error);
        resolve({ id });
    });
});

module.exports = {
    findAll,
    create,
    updateStock,
    remove
};
