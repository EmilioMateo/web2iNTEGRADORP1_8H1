import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private _productos = signal<Producto[]>([]);

  productos = this._productos.asReadonly();
  

  total = computed(() => 
    this._productos().reduce((acc, p) => acc + parseFloat(p.precio || '0'), 0)
  );

  agregar(producto: Producto) {
    const productoCarrito = {
      ...producto,
      idCarrito: crypto.randomUUID()
    };

    this._productos.update(lista => [...lista, productoCarrito]);
  }

  quitar(idCarrito: string | null) {
    this._productos.update(lista => lista.filter((p: any) => p.idCarrito !== idCarrito));
  }

  vaciar() {
    this._productos.set([]);
  }

  exportarReciboXML() {
    const lista = this._productos();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    
    lista.forEach(p => {
      xml += `  
      <item>    
        <nombre>${p.nombre}</nombre>    
        <precio>${p.precio}</precio>
        <descripcion>${p.descripcion || ''}</descripcion>  
      </item>`;
    });

    xml += `  <total_pagado>${this.total()}</total_pagado>\n</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mi_recibo.xml';
    link.click();
    URL.revokeObjectURL(url);
  }
}