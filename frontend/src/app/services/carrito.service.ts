import { Injectable, computed, signal } from '@angular/core';
import { Producto } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private productosSignal = signal<Producto[]>([]);
  private notificacionSignal = signal(false);

  productos = this.productosSignal.asReadonly();
  notificacion = this.notificacionSignal.asReadonly();

  total = computed(() => this.productosSignal().reduce((acc, producto) => acc + Number(producto.precio || 0), 0));

  agregar(producto: Producto): void {
    const itemCarrito: Producto = {
      ...producto,
      idCarrito: crypto.randomUUID()
    };

    this.productosSignal.update(lista => [...lista, itemCarrito]);
    this.mostrarNotificacion();
  }

  quitar(idCarrito: string | undefined): void {
    if (!idCarrito) {
      return;
    }

    this.productosSignal.update(lista => lista.filter(producto => producto.idCarrito !== idCarrito));
  }

  vaciar(): void {
    this.productosSignal.set([]);
  }

  private mostrarNotificacion(): void {
    this.notificacionSignal.set(true);
    setTimeout(() => this.notificacionSignal.set(false), 1000);
  }
}



