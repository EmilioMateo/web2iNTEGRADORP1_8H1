const productosService = require('../services/productos.service');

const getProductos = async (req, res) => {
    try {
        const productos = await productosService.getProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

const createProducto = async (req, res) => {
    try {
        const producto = await productosService.createProducto(req.body);
        res.status(201).json({ message: 'Producto creado', id: producto.id });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.status ? error.message : 'Error al crear producto' });
    }
};

const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { enStock } = req.body;
        const producto = await productosService.updateStock(id, enStock);
        res.json({ message: 'Stock actualizado', ...producto });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.status ? error.message : 'Error al actualizar stock' });
    }
};

const deleteProducto = async (req, res) => {
    try {
        const producto = await productosService.deleteProducto(req.params.id);
        res.json({ message: 'Producto eliminado', id: producto.id });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

module.exports = {
    getProductos,
    createProducto,
    updateStock,
    deleteProducto
};
