import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';
import { ReceiptService } from '../../services/receipt.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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
  private notifications = inject(NotificationService);

  carrito = this.carritoService.productos;
  total = this.carritoService.total;
  mensaje = '';
  authService = inject(AuthService);
  private router = inject(Router);

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
          this.mensaje = 'Procesando pago...';
          this.notifications.info('Procesando pago...');
          const capture = await firstValueFrom(this.paypalService.capturarOrden(data.orderID));

          const xml = this.receiptService.generarReciboXML(this.carrito(), this.total(), capture);
          const ordenPaypal = capture.id || data.orderID;

          this.carritoService.vaciar();

          const userEmail = this.authService.user()?.correo;
          if (userEmail) {
            this.receiptService.enviarTicketPorCorreo(xml, userEmail, ordenPaypal).subscribe({
              error: (err) => console.error('Error enviando correo:', err)
            });
          }

          this.router.navigate(['/ticket'], {
            state: { xml, ordenPaypal }
          });
          this.notifications.success('Compra realizada correctamente.');
        } catch (error) {
          console.error('Error al capturar el pago:', error);
          this.mensaje = 'Ocurrio un error al capturar el pago.';
          this.notifications.error('Ocurrio un error al capturar el pago.');
        }
      },
      onCancel: () => {
        this.mensaje = 'El usuario cancelo el pago.';
        this.notifications.info('Pago cancelado.');
      },
      onError: (error: any) => {
        console.error('Error PayPal:', error);
        this.mensaje = 'Error en el proceso de PayPal.';
        this.notifications.error('Error en el proceso de PayPal.');
      }
    }).render(this.paypalButtonContainer.nativeElement);
  }
}


