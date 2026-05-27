import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/environment';
import { Producto } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/carrito`;

  private productosSignal = signal<Producto[]>([]);
  private notificacionSignal = signal(false);

  productos = this.productosSignal.asReadonly();
  notificacion = this.notificacionSignal.asReadonly();

  total = computed(() => this.productosSignal().reduce((acc, producto) => acc + (Number(producto.precio || 0) * (producto.cantidad || 1)), 0));

  constructor() {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    const user = this.authService.user();
    if (!user) return;
    
    this.http.get<Producto[]>(`${this.apiUrl}/${user.correo}`).subscribe({
      next: (productos) => this.productosSignal.set(productos),
      error: (err) => console.error('Error cargando carrito:', err)
    });
  }

  agregar(producto: Producto): void {
    const user = this.authService.user();
    if (!user) {
      alert('Debes iniciar sesión para agregar al carrito');
      return;
    }

    const payload = {
      usernameUsuario: user.correo,
      productoId: producto.id,
      cantidad: 1
    };

    this.http.post<{ message: string; id: string; updated?: boolean }>(this.apiUrl, payload).subscribe({
      next: (res) => {
        if (res.updated) {
          this.productosSignal.update(lista => {
            return lista.map(p => {
              if (p.idCarrito === res.id) {
                return { ...p, cantidad: (p.cantidad || 1) + 1 };
              }
              return p;
            });
          });
        } else {
          const itemCarrito: Producto = { ...producto, idCarrito: res.id, cantidad: 1 };
          this.productosSignal.update(lista => [...lista, itemCarrito]);
        }
        this.mostrarNotificacion();
      },
      error: (err) => alert('Error agregando producto al carrito')
    });
  }

  actualizarCantidad(idCarrito: string, nuevaCantidad: number): void {
    if (!idCarrito || nuevaCantidad < 1) return;

    this.http.put(`${this.apiUrl}/${idCarrito}`, { cantidad: nuevaCantidad }).subscribe({
      next: () => {
        this.productosSignal.update(lista => {
          return lista.map(p => p.idCarrito === idCarrito ? { ...p, cantidad: nuevaCantidad } : p);
        });
      },
      error: () => alert('Error al actualizar cantidad')
    });
  }

  validarStockCheckout() {
    const user = this.authService.user();
    if (!user) throw new Error('Usuario no autenticado');
    return this.http.post<{ valid: boolean; errors?: string[] }>(`${this.apiUrl}/validate/${user.correo}`, {});
  }

  quitar(idCarrito: string | undefined): void {
    if (!idCarrito) return;

    this.http.delete(`${this.apiUrl}/${idCarrito}`).subscribe({
      next: () => {
        this.productosSignal.update(lista => lista.filter(p => p.idCarrito !== idCarrito));
      },
      error: () => alert('Error quitando producto del carrito')
    });
  }

  vaciar(): void {
    const user = this.authService.user();
    if (!user) return;

    this.http.delete(`${this.apiUrl}/clear/${user.correo}`).subscribe({
      next: () => this.productosSignal.set([]),
      error: () => alert('Error vaciando el carrito')
    });
  }

  private mostrarNotificacion(): void {
    this.notificacionSignal.set(true);
    setTimeout(() => this.notificacionSignal.set(false), 2000);
  }
}

