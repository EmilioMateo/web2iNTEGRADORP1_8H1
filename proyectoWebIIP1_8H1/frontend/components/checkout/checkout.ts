import {  AfterViewInit,  Component,  ElementRef,  ViewChild,  inject} from '@angular/core';
import { CarritoService } from '../../../src/app/services/carrito.service';
import { PaypalService } from '../../servicio/paypal.service';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

declare const paypal: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './checkout.html'
})
export class CheckoutComponent implements AfterViewInit {
  @ViewChild('paypalButtonContainer')
  paypalButtonContainer!: ElementRef<HTMLDivElement>;

  private carritoService = inject(CarritoService);
  private paypalService = inject(PaypalService);

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
      this.mensaje = 'No se cargó el SDK de PayPal.';
      return;
    }

    if (!this.paypalButtonContainer) {
      return;
    }

    this.paypalButtonContainer.nativeElement.innerHTML = '';

    paypal.Buttons({
      createOrder: async () => {
        try {
          const response = await firstValueFrom(
            this.paypalService.crearOrden({
              items: this.carrito(),
              total: this.total()
            })
          );

          return response.id;
        } catch (error) {
          console.error('Error al crear la orden:', error);
          this.mensaje = 'No se pudo crear la orden.';
          throw error;
        }
      },

      onApprove: async (data: any) => {
        try {
          const capture = await firstValueFrom(
            this.paypalService.capturarOrden(data.orderID)
          );

          console.log('Pago capturado:', capture);
          this.mensaje = 'Pago realizado correctamente.';
          this.carritoService.vaciar();
          this.paypalButtonContainer.nativeElement.innerHTML = '';
        } catch (error) {
          console.error('Error al capturar el pago:', error);
          this.mensaje = 'Ocurrió un error al capturar el pago.';
        }
      },

      onCancel: () => {
        this.mensaje = 'El usuario canceló el pago.';
      },

      onError: (error: any) => {
        console.error('Error PayPal:', error);
        this.mensaje = 'Error en el proceso de PayPal.';
      }
    }).render(this.paypalButtonContainer.nativeElement);
  }
}
