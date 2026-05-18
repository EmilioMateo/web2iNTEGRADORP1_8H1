const Producto = require('../models/producto.model');

const getProductos = () => Producto.findAll();

const createProducto = (producto) => {
    const requiredFields = ['id', 'nombre', 'precio', 'descripcion', 'imagenUrl', 'categoria'];
    const missingField = requiredFields.find(field => producto[field] === undefined || producto[field] === '');

    if (missingField) {
        const error = new Error(`Falta el campo ${missingField}`);
        error.status = 400;
        throw error;
    }

    return Producto.create({
        ...producto,
        enStock: Number(producto.enStock || 0),
        idCarrito: producto.idCarrito || producto.id
    });
};

const updateStock = (id, enStock) => {
    if (enStock === undefined || Number(enStock) < 0) {
        const error = new Error('Stock invalido');
        error.status = 400;
        throw error;
    }

    return Producto.updateStock(id, Number(enStock));
};

const deleteProducto = (id) => Producto.remove(id);

module.exports = {
    getProductos,
    createProducto,
    updateStock,
    deleteProducto
};
