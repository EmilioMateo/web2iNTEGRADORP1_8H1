import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';
import { ReceiptService } from '../../services/receipt.service';

declare const paypal: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements AfterViewInit {
  @ViewChild('paypalButtonContainer') paypalButtonContainer!: ElementRef<HTMLDivElement>;

  private carritoService = inject(CarritoService);
  private paypalService = inject(PaypalService);
  private receiptService = inject(ReceiptService);

  carrito = this.carritoService.productos;
  total = this.carritoService.total;
  mensaje = '';

  ngAfterViewInit(): void {
    this.renderPaypalButton();
  }

  private renderPaypalButton(): void {
    if (this.carrito().length === 0) {
      return;
    }

    if (typeof paypal === 'undefined') {
      this.mensaje = 'No se cargo el SDK de PayPal.';
      return;
    }

    this.paypalButtonContainer.nativeElement.innerHTML = '';

    paypal.Buttons({
      createOrder: async () => {
        const response = await firstValueFrom(
          this.paypalService.crearOrden({ items: this.carrito(), total: this.total() })
        );
        return response.id;
      },
      onApprove: async (data: any) => {
        try {
          const capture = await firstValueFrom(this.paypalService.capturarOrden(data.orderID));
          this.mensaje = 'Pago realizado correctamente.';
          this.receiptService.descargarReciboXML(this.carrito(), this.total(), capture);
          this.carritoService.vaciar();
          this.paypalButtonContainer.nativeElement.innerHTML = '';
        } catch (error) {
          console.error('Error al capturar el pago:', error);
          this.mensaje = 'Ocurrio un error al capturar el pago.';
        }
      },
      onCancel: () => (this.mensaje = 'El usuario cancelo el pago.'),
      onError: (error: any) => {
        console.error('Error PayPal:', error);
        this.mensaje = 'Error en el proceso de PayPal.';
      }
    }).render(this.paypalButtonContainer.nativeElement);
  }
}


