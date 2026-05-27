class PaypalOrderRequest {
  constructor({ items, total }) {
    this.items = items;
    this.total = Number(total);
  }
}

class PaypalOrderResponse {
  constructor({ id, status }) {
    this.id = id;
    this.status = status;
  }
}

class CompraRegistro {
  constructor({ total, detalles }) {
    this.total = Number(total);
    this.detalles = JSON.stringify(detalles);
  }
}

class StockUpdate {
  constructor({ productId, quantity }) {
    this.productId = productId;
    this.quantity = Number(quantity);
  }
}

module.exports = {
  PaypalOrderRequest,
  PaypalOrderResponse,
  CompraRegistro,
  StockUpdate
};
