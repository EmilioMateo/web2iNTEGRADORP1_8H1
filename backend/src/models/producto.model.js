class Producto {
    constructor({ id, nombre, precio, descripcion, imagenUrl, categoria, enStock, idCarrito }) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.categoria = categoria;
        this.enStock = enStock;
        this.idCarrito = idCarrito;
    }
}

module.exports = Producto;
