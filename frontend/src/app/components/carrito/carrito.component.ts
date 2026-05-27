import { CurrencyPipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { CheckoutComponent } from '../checkout/checkout.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, SlicePipe, CheckoutComponent, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);

  subtotal = this.carritoService.total;
  iva = computed(() => this.subtotal() * 0.16);
  totalConIva = computed(() => this.subtotal() + this.iva());
  viewState = signal<'cart' | 'checkout'>('cart');

  procederCompra(): void {
    if (this.carritoService.productos().length > 0) {
      this.carritoService.validarStockCheckout().subscribe({
        next: (res) => {
          if (res.valid) {
            this.viewState.set('checkout');
          }
        },
        error: (err) => {
          if (err.error && err.error.errors) {
            alert('Error de stock:\n' + err.error.errors.join('\n'));
          } else {
            alert('Error validando el stock');
          }
        }
      });
    }
  }

  volverAlCarrito(): void {
    this.viewState.set('cart');
  }
}


