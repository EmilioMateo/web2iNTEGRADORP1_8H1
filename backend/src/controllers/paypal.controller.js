const paypalService = require("../services/paypal.service")
const createPaypalOrder = paypalService.createPaypalOrder
const capturePaypalOrder = paypalService.capturePaypalOrder
const getOrderDetails = paypalService.getOrderDetails
const db = require('../config/db');

async function createOrder(req, res) {
  try {
    const { items, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'El carrito está vacío'
      });
    }

    if (!total || Number(total) <= 0) {
      return res.status(400).json({
        error: 'El total es inválido'
      });
    }

    const order = await createPaypalOrder({ items, total });

    res.status(200).json({
      id: order.id,
      status: order.status
    });
  } catch (error) {
    console.error('Error en createOrder:', error.message);

    res.status(500).json({
      error: 'No se pudo crear la orden',
      detalle: error.message
    });
  }
}

async function captureOrder(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: 'orderId es obligatorio'
      });
    }

    const captureData = await capturePaypalOrder(orderId);

    if (captureData.status === 'COMPLETED') {
      try {
        const orderDetails = await getOrderDetails(orderId);
        const purchaseUnit = orderDetails.purchase_units[0];
        const total = purchaseUnit.amount.value;
        const items = purchaseUnit.items || [];

        const insertSql = 'INSERT INTO registro_compras (total, detalles) VALUES (?, ?)';
        const detalles = JSON.stringify(items);

        db.query(insertSql, [total, detalles], (err, result) => {
          if (err) console.error('Error al registrar compra:', err);
          else console.log('Compra registrada en BD.');
        });

        items.forEach(item => {
          const productId = item.sku;
          const quantity = parseInt(item.quantity);

          if (productId) {
            const updateSql = 'UPDATE productos SET enStock = enStock - ? WHERE id = ?';
            db.query(updateSql, [quantity, productId], (err, result) => {
              if (err) console.error(`Error al actualizar stock del producto ${productId}:`, err);
              else console.log(`Stock actualizado para producto ${productId}.`);
            });
          }
        });
      } catch (err) {
        console.error('Error al procesar post-captura (stock/registro):', err);
      }
    }

    res.status(200).json(captureData);
  } catch (error) {
    console.error('Error en captureOrder:', error.message);

    res.status(500).json({
      error: 'No se pudo capturar la orden',
      detalle: error.message
    });
  }
}

module.exports = {
  createOrder,
  captureOrder
}