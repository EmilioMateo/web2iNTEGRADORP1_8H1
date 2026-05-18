import { Injectable } from '@angular/core';
import { Producto } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  descargarReciboXML(productos: Producto[], total: number, paypalData?: any): void {
    const xml = this.crearReciboXML(productos, total, paypalData);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `recibo_paypal_${paypalData ? paypalData.id : 'compra'}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private crearReciboXML(productos: Producto[], total: number, paypalData?: any): string {
    const encabezado = paypalData
      ? `  <id_transaccion>${paypalData.id}</id_transaccion>\n  <estado>${paypalData.status}</estado>\n  <fecha>${new Date().toLocaleString()}</fecha>\n`
      : '';

    const items = productos.map(producto => `  <item>\n    <nombre>${producto.nombre}</nombre>\n    <precio>${producto.precio}</precio>\n    <descripcion>${producto.descripcion || ''}</descripcion>\n  </item>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n${encabezado}${items}\n  <total_pagado>${total}</total_pagado>\n</recibo>`;
  }
}


