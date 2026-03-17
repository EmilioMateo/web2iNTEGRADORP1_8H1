import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);

  obtenerTodos() {
    return this.http.get('productos.xml', { responseType: 'text' }).pipe(
      map(xmlString => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, 'application/xml');
        return Array.from(xml.querySelectorAll('product')).map(nodo => ({
          id: nodo.getAttribute('id'),
          nombre: nodo.querySelector('name')?.textContent || '',
          precio: nodo.querySelector('price')?.textContent || '',
          descripcion: nodo.querySelector('description')?.textContent || '',
          imagenUrl: nodo.querySelector('image')?.textContent || '',
          categoria: nodo.querySelector('category')?.textContent || '',
          enStock: Number(nodo.querySelector('stock')?.textContent || 0),
        })) as Producto[];
      })
    );
  }
}