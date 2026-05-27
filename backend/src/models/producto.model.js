class Producto {
    constructor({ id, nombre, precio, descripcion, imagenUrl, categoria, especificaciones, grupoMuscular, tipoEntrenamiento, tamano, pesoMaximoSoportado, enStock, idCarrito }) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.categoria = categoria;
        this.especificaciones = especificaciones;
        this.grupoMuscular = grupoMuscular;
        this.tipoEntrenamiento = tipoEntrenamiento;
        this.tamano = tamano;
        this.pesoMaximoSoportado = pesoMaximoSoportado;
        this.enStock = enStock;
        this.idCarrito = idCarrito;
    }
}

module.exports = Producto;
