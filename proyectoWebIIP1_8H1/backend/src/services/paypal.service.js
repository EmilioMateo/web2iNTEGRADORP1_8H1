const paypalConfig = require("../config/paypal.config")

function getBasicAuth() {
  return Buffer
    .from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`)
    .toString('base64');
}

async function getAccessToken() {
  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error obteniendo access token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function createPaypalOrder(orderData) {
  const accessToken = await getAccessToken();

  const itemsAgrupados = orderData.items.reduce((acc, item) => {
    const existente = acc.find(i => i._id === item._id);
    if (existente) {
      existente.cantidad++;
    } else {
      acc.push({ ...item, cantidad: 1 });
    }
    return acc;
  }, []);

  const itemTotal = itemsAgrupados.reduce((sum, item) => {
    return sum + (Number(item.precio) * item.cantidad);
  }, 0);

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'MXN',
          value: itemTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'MXN',
              value: itemTotal.toFixed(2)
            }
          }
        },
        items: itemsAgrupados.map(item => ({
          name: item.nombre,
          quantity: String(item.cantidad),  // ✅ era item.enStock
          sku: String(item.id),
          unit_amount: {
            currency_code: 'MXN',
            value: Number(item.precio).toFixed(2)
          }
        }))
      }
    ]
  };

  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error creando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
}

async function capturePaypalOrder(orderId) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error capturando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
}

async function getOrderDetails(orderId) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error obteniendo orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = {
  getAccessToken,
  createPaypalOrder,
  capturePaypalOrder,
  getOrderDetails
}