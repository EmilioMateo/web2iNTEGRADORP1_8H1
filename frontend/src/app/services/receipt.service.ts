import { Injectable } from '@angular/core';
import { Producto } from '../models/product.model';

import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../config/environment';
import { formatXmlForDownload } from '../utils/xml-download.util';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private http = inject(HttpClient);

  descargarReciboXML(productos: Producto[], total: number, paypalData?: any): void {
    const xml = formatXmlForDownload(this.crearReciboXML(productos, total, paypalData));
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `recibo_cfdi_${paypalData ? paypalData.id : 'compra'}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  }

  generarReciboXML(productos: Producto[], total: number, paypalData?: any): string {
    return this.crearReciboXML(productos, total, paypalData);
  }

  enviarTicketPorCorreo(xml: string, email: string, ordenPaypal?: string) {
    return this.http.post(`${environment.apiUrl}/paypal/send-ticket`, { xml, email, ordenPaypal });
  }

  private crearReciboXML(productos: Producto[], total: number, paypalData?: any): string {
    const fecha = new Date().toISOString().split('.')[0];
    const subtotal = total;
    const iva = +(subtotal * 0.16).toFixed(2);
    const totalConIva = +(subtotal + iva).toFixed(2);

    const mesActual = String(new Date().getMonth() + 1).padStart(2, '0');
    const anioActual = String(new Date().getFullYear());

    const ordenId = paypalData?.id || 'N/A';

    const conceptos = productos.map(p => {
      const precio = Number(p.precio);
      const cantidad = Number(p.cantidad) || 1;
      const importe = +(precio * cantidad).toFixed(2);
      const ivaConcepto = +(importe * 0.16).toFixed(2);
      return `
    <cfdi:Concepto
        ClaveProdServ="49201600"
        NoIdentificacion="${p.id}"
        Cantidad="${cantidad}"
        ClaveUnidad="H87"
        Unidad="Pieza"
        Descripcion="${p.nombre}"
        ValorUnitario="${precio.toFixed(2)}"
        Importe="${importe.toFixed(2)}"
        ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado
              Base="${importe.toFixed(2)}"
              Impuesto="002"
              TipoFactor="Tasa"
              TasaOCuota="0.160000"
              Importe="${ivaConcepto.toFixed(2)}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>`;
    }).join('');

    return `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"
    Version="4.0"
    Serie="A"
    Folio="${ordenId}"
    Fecha="${fecha}"
    Sello=""
    FormaPago="04"
    NoCertificado="00001000000500000000"
    Certificado=""
    SubTotal="${subtotal.toFixed(2)}"
    Moneda="MXN"
    Total="${totalConIva.toFixed(2)}"
    TipoDeComprobante="I"
    Exportacion="01"
    MetodoPago="PUE"
    LugarExpedicion="20000">

  <cfdi:InformacionGlobal
      Periodicidad="01"
      Meses="${mesActual}"
      Año="${anioActual}"/>

  <cfdi:Emisor
      Rfc=""
      Nombre="GYMSTAR SA DE CV"
      RegimenFiscal="601"/>

  <cfdi:Receptor
      Rfc="XAXX010101000"
      Nombre="PUBLICO EN GENERAL"
      DomicilioFiscalReceptor="20000"
      RegimenFiscalReceptor="616"
      UsoCFDI="S01"/>

  <cfdi:Conceptos>${conceptos}
  </cfdi:Conceptos>

  <cfdi:Impuestos TotalImpuestosTrasladados="${iva.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado
          Base="${subtotal.toFixed(2)}"
          Impuesto="002"
          TipoFactor="Tasa"
          TasaOCuota="0.160000"
          Importe="${iva.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>

</cfdi:Comprobante>`;
  }

}



