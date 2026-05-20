const Producto = require('../models/producto.model');

const requiredFields = ['id', 'nombre', 'precio', 'descripcion', 'imagenUrl', 'categoria'];

const buildProductoForCreate = (payload) => {
    const missingField = requiredFields.find(field => payload[field] === undefined || payload[field] === '');

    if (missingField) {
        const error = new Error(`Falta el campo ${missingField}`);
        error.status = 400;
        throw error;
    }

    return new Producto({
        ...payload,
        precio: Number(payload.precio),
        enStock: Number(payload.enStock || 0),
        idCarrito: payload.idCarrito || payload.id
    });
};

const validateStock = (enStock) => {
    const stock = Number(enStock);

    if (enStock === undefined || Number.isNaN(stock) || stock < 0) {
        const error = new Error('Stock invalido');
        error.status = 400;
        throw error;
    }

    return stock;
};

module.exports = {
    buildProductoForCreate,
    validateStock
};
