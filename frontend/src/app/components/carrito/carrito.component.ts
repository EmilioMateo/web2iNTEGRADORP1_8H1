import { CurrencyPipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CheckoutComponent } from '../checkout/checkout.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, SlicePipe, CheckoutComponent, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);
  private notifications = inject(NotificationService);

  subtotal = this.carritoService.total;
  iva = computed(() => this.subtotal() * 0.16);
  totalConIva = computed(() => this.subtotal() + this.iva());
  viewState = signal<'cart' | 'checkout'>('cart');

  procederCompra(): void {
    if (this.carritoService.productos().length > 0) {
      this.carritoService.validarStockCheckout().subscribe({
        next: (res) => {
          if (res.valid) {
            this.notifications.success('Stock validado correctamente.');
            this.viewState.set('checkout');
          }
        },
        error: (err) => {
          if (err.error && err.error.errors) {
            this.notifications.error('Error de stock: ' + err.error.errors.join(' '));
          } else {
            this.notifications.error('Error validando el stock.');
          }
        }
      });
    }
  }

  volverAlCarrito(): void {
    this.viewState.set('cart');
  }
}


