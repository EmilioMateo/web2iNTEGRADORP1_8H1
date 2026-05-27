const CarritoItem = require('../models/carrito.model');
const crypto = require('crypto');

const buildCarritoItem = (payload) => {
    if (!payload.usernameUsuario || !payload.productoId) {
        const error = new Error('Faltan datos obligatorios');
        error.status = 400;
        throw error;
    }

    return new CarritoItem({
        id: crypto.randomUUID(),
        usernameUsuario: payload.usernameUsuario,
        productoId: payload.productoId,
        cantidad: payload.cantidad || 1
    });
};

module.exports = {
    buildCarritoItem
};
