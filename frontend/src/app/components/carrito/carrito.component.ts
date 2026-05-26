import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { ReceiptService } from '../../services/receipt.service';
import { CheckoutComponent } from '../checkout/checkout.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, CheckoutComponent, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);
  private receiptService = inject(ReceiptService);

  descargarRecibo(): void {
    this.receiptService.descargarReciboXML(this.carritoService.productos(), this.carritoService.total());
  }
}


