class CarritoItem {
    constructor({ id, usernameUsuario, productoId, cantidad, fechaAgregado }) {
        this.id = id;
        this.usernameUsuario = usernameUsuario;
        this.productoId = productoId;
        this.cantidad = cantidad || 1;
        this.fechaAgregado = fechaAgregado;
    }
}

module.exports = CarritoItem;
