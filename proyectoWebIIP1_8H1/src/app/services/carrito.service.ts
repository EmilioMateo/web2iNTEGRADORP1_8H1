import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private _productos = signal<Producto[]>([]);
  private _notificacion = signal<boolean>(false);
  notificacion = this._notificacion.asReadonly();

  productos = this._productos.asReadonly();
  

  total = computed(() => 
    this._productos().reduce((acc, p) => acc + parseFloat(p.precio || '0'), 0)
  );

  agregar(producto: Producto) {
    (producto as any).idCarrito = crypto.randomUUID();

    this._productos.update(lista => [...lista, producto]);

    this._notificacion.set(true);
    setTimeout(() => this._notificacion.set(false), 1000);
  }

  quitar(idCarrito: string | null) {
    this._productos.update(lista => {
    const index = lista.findIndex(p => p.idCarrito === idCarrito);
    if (index !== -1) {
      lista[index].enStock++;
      const nuevaLista = [...lista];
      nuevaLista.splice(index, 1);
      
      return nuevaLista;
    }

    return lista;
    });
    
  }

  vaciar() {
    this._productos().forEach(p => p.enStock++);
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