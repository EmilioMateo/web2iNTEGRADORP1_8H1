const db = require('../config/db');

const getProductos = (req, res) =>{
    const sql = 'SELECT * FROM productos';
    console.log("hola")
    db.query(sql, (error, resultados) => {
        if (error){
            return res.status(500).json({error: 'Error al obtener productos'});
        }
        res.json(resultados);
    });
};

const createProducto = (req, res) => {
    const { id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito } = req.body;
    const sql = 'INSERT INTO productos (id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito], (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({error: 'Error al crear producto'});
        }
        res.status(201).json({message: 'Producto creado', id});
    });
};

const updateStock = (req, res) => {
    const { id } = req.params;
    const { enStock } = req.body;
    const sql = 'UPDATE productos SET enStock = ? WHERE id = ?';
    db.query(sql, [enStock, id], (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({error: 'Error al actualizar stock'});
        }
        res.json({message: 'Stock actualizado', id, enStock});
    });
};

const deleteProducto = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM productos WHERE id = ?';
    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({error: 'Error al eliminar producto'});
        }
        res.json({message: 'Producto eliminado', id});
    });
};

module.exports = {
    getProductos,
    createProducto,
    updateStock,
    deleteProducto
};