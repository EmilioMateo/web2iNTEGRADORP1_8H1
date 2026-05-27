const db = require('../config/db');
const paypalService = require('../services/paypal.service');

const queryDb = (sql, values) => new Promise((resolve, reject) => {
  db.query(sql, values, (error, results) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(results);
  });
});

const registrarCompra = async (compra) => {
  const sql = 'INSERT INTO registro_compras (total, detalles, id_usuario, xml_cfdi, orden_paypal) VALUES (?, ?, ?, ?, ?)';
  await queryDb(sql, [compra.total, compra.detalles, compra.id_usuario || null, compra.xml_cfdi || null, compra.orden_paypal || null]);
};

const actualizarStock = async (stockUpdates) => {
  const sql = 'UPDATE productos SET enStock = enStock - ? WHERE id = ?';

  await Promise.all(stockUpdates.map(update => (
    queryDb(sql, [update.quantity, update.productId])
  )));
};

const { Resend } = require('resend');

const createOrder = async (req, res) => {
  try {
    const orderData = paypalService.validateCreateOrderPayload(req.body);
    const order = await paypalService.createPaypalOrder(orderData);

    res.status(200).json(paypalService.buildCreateOrderResponse(order));
  } catch (error) {
    console.error('Error en createOrder:', error.message);
    res.status(error.status || 500).json({
      error: error.status ? error.message : 'No se pudo crear la orden',
      detalle: error.status ? undefined : error.message
    });
  }
};

const captureOrder = async (req, res) => {
  try {
    const orderId = paypalService.validateCaptureOrderPayload(req.body);
    const captureData = await paypalService.capturePaypalOrder(orderId);

    if (captureData.status === 'COMPLETED') {
      const orderDetails = await paypalService.getOrderDetails(orderId);
      const purchaseData = paypalService.buildPurchaseData(orderDetails);

      purchaseData.compra.id_usuario = req.user?.id || null;
      purchaseData.compra.orden_paypal = orderId;

      await registrarCompra(purchaseData.compra);
      await actualizarStock(purchaseData.stockUpdates);
    }

    res.status(200).json(captureData);
  } catch (error) {
    console.error('Error en captureOrder:', error.message);
    res.status(error.status || 500).json({
      error: error.status ? error.message : 'No se pudo capturar la orden',
      detalle: error.status ? undefined : error.message
    });
  }
};

const sendTicket = async (req, res) => {
  try {
    const { xml, email, ordenPaypal } = req.body;
    
    if (!xml || !email) {
      return res.status(400).json({ error: 'Falta el xml o el email' });
    }

    if (ordenPaypal) {
      const updateSql = 'UPDATE registro_compras SET xml_cfdi = ? WHERE orden_paypal = ?';
      await queryDb(updateSql, [xml, ordenPaypal]).catch(e => console.error('Error guardando XML en BD:', e.message));
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY no configurado en el servidor' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'GymStar <noreply@lemamx.com>',
      to: email,
      subject: 'Tu Recibo de Compra (CFDI XML) - GymStar',
      html: `
        <div style="font-family: Arial, sans-serif; background: #1a0000; color: #fff; padding: 32px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff4d4d; margin-bottom: 8px;">¡Gracias por tu compra!</h1>
          <p style="color: #ccc;">Tu pedido en <strong>GymStar</strong> fue procesado exitosamente.</p>
          <p style="color: #ccc;">Adjuntamos tu <strong>Comprobante Fiscal Digital (CFDI)</strong> en formato XML tal como lo requiere el SAT de México.</p>
          <hr style="border-color: #333; margin: 24px 0;">
          <p style="color: #888; font-size: 12px;">Si tienes alguna duda, contáctanos respondiendo este correo.</p>
        </div>
      `,
      attachments: [
        {
          filename: 'recibo_cfdi.xml',
          content: Buffer.from(xml, 'utf-8').toString('base64'),
          type: 'application/xml',
          disposition: 'attachment',
        }
      ]
    });

    if (error) {
      console.error('Error de Resend:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Correo enviado con exito', id: data.id });
  } catch (error) {
    console.error('Error enviando ticket:', error);
    res.status(500).json({ error: 'Error interno enviando correo' });
  }
};

module.exports = {
  createOrder,
  captureOrder,
  sendTicket
};
