const Producto = require('../models/producto.model');

const requiredFields = ['nombre', 'precio', 'descripcion', 'imagenUrl', 'categoria'];

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
        especificaciones: payload.especificaciones || '',
        grupoMuscular: payload.grupoMuscular || '',
        tipoEntrenamiento: payload.tipoEntrenamiento || '',
        tamano: payload.tamano || '',
        pesoMaximoSoportado: payload.pesoMaximoSoportado || '',
        enStock: Number(payload.enStock || 0),
        idCarrito: null
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
