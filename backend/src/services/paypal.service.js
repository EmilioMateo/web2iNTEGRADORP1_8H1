const paypalConfig = require('../config/paypal.config');
const {
  PaypalOrderRequest,
  PaypalOrderResponse,
  CompraRegistro,
  StockUpdate
} = require('../models/paypal.model');

const validateCreateOrderPayload = (payload) => {
  const { items, total } = payload;

  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('El carrito esta vacio');
    error.status = 400;
    throw error;
  }

  if (!total || Number(total) <= 0) {
    const error = new Error('El total es invalido');
    error.status = 400;
    throw error;
  }

  return new PaypalOrderRequest({ items, total });
};

const validateCaptureOrderPayload = (payload) => {
  if (!payload.orderId) {
    const error = new Error('orderId es obligatorio');
    error.status = 400;
    throw error;
  }

  return payload.orderId;
};

const getBasicAuth = () => Buffer
  .from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`)
  .toString('base64');

const getAccessToken = async () => {
  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error obteniendo access token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
};

const groupItems = (items) => items.reduce((acc, item) => {
  const existente = acc.find(i => i.id === item.id);

  if (existente) {
    existente.cantidad = (Number(existente.cantidad) || 1) + 1;
  } else {
    acc.push({ ...item, cantidad: Number(item.cantidad) || 1 });
  }

  return acc;
}, []);

const buildPaypalOrderBody = (orderData) => {
  const itemsAgrupados = groupItems(orderData.items);
  const subtotal = itemsAgrupados.reduce((sum, item) => (
    sum + (Number(item.precio) * Number(item.cantidad))
  ), 0);
  const iva = subtotal * 0.16;
  const totalConIva = subtotal + iva;

  return {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'MXN',
          value: totalConIva.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'MXN',
              value: subtotal.toFixed(2)
            },
            tax_total: {
              currency_code: 'MXN',
              value: iva.toFixed(2)
            }
          }
        },
        items: itemsAgrupados.map(item => ({
          name: item.nombre,
          quantity: String(Number(item.cantidad)),
          sku: String(item.id),
          unit_amount: {
            currency_code: 'MXN',
            value: Number(item.precio).toFixed(2)
          },
          tax: {
            currency_code: 'MXN',
            value: (Number(item.precio) * 0.16).toFixed(2)
          }
        }))
      }
    ]
  };
};

const createPaypalOrder = async (orderData) => {
  const accessToken = await getAccessToken();
  const body = buildPaypalOrderBody(orderData);

  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error creando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
};

const capturePaypalOrder = async (orderId) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error capturando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
};

const getOrderDetails = async (orderId) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error obteniendo orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
};

const buildCreateOrderResponse = (order) => new PaypalOrderResponse({
  id: order.id,
  status: order.status
});

const buildPurchaseData = (orderDetails) => {
  const purchaseUnit = orderDetails.purchase_units[0];
  const items = purchaseUnit.items || [];

  return {
    compra: new CompraRegistro({
      total: purchaseUnit.amount.value,
      detalles: items
    }),
    stockUpdates: items
      .filter(item => item.sku)
      .map(item => new StockUpdate({
        productId: item.sku,
        quantity: parseInt(item.quantity, 10)
      }))
  };
};

module.exports = {
  validateCreateOrderPayload,
  validateCaptureOrderPayload,
  createPaypalOrder,
  capturePaypalOrder,
  getOrderDetails,
  buildCreateOrderResponse,
  buildPurchaseData
};
