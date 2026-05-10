import { Component, inject } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common'; 
import { CarritoService } from '../services/carrito.service';
import { CheckoutComponent } from '../../../frontend/components/checkout/checkout';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, NgClass, CheckoutComponent, RouterLink],
  template: `
    <div class="carrito-pagina">
      <h1>Tu Carrito de Compras</h1>
      
      @if (servicio.productos().length === 0) {
        <div class="vacio-mensaje">
          <p>Tu carrito está vacío. ¡Agrega algunos productos!</p>
          <a routerLink="/" class="btn-seguir">Ver Catálogo</a>
        </div>
      } @else {
        <div class="contenido-carrito">
          <div class="items-lista">
            @for (p of servicio.productos(); track p.idCarrito) {
              <div class="item">
                <div class="item-info">
                  <span class="nombre">{{ p.nombre }}</span>
                  <span class="precio">{{ p.precio | currency:'MXN' }}</span>
                </div>
                <button class="btn-quitar" (click)="servicio.quitar(p.idCarrito)">❌</button>
              </div>
            }
          </div>
          
          <div class="sidebar-pago">
            <h3>Resumen de Compra</h3>
            <div class="total-seccion">
              <span>Total:</span>
              <span class="monto">{{ servicio.total() | currency:'MXN' }}</span>
            </div>
            
            <div class="acciones">
              <button class="btn-xml" (click)="servicio.exportarReciboXML()">Descargar XML</button>
              <button class="btn-vaciar" (click)="servicio.vaciar()">Vaciar Carrito</button>
            </div>
            
            <div class="checkout-seccion">
              <app-checkout></app-checkout>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .carrito-pagina {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 2rem;
      font-family: 'Roboto', sans-serif;
      color: white;
    }

    h1 {
      text-align: center;
      color: white;
      margin-bottom: 2rem;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .vacio-mensaje {
      text-align: center;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-seguir {
      display: inline-block;
      margin-top: 1rem;
      padding: 12px 24px;
      background: linear-gradient(135deg, #831111 0%, #b36359 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(131, 17, 17, 0.3);
    }

    .btn-seguir:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(131, 17, 17, 0.5);
    }

    .contenido-carrito {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }

    .items-lista {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      height: fit-content;
    }

    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .item:last-child {
      border-bottom: none;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .nombre {
      font-weight: bold;
      font-size: 1.1rem;
      color: white;
    }

    .precio {
      color: rgba(255, 255, 255, 0.7);
    }

    .btn-quitar {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      cursor: pointer;
      font-size: 1rem;
      color: #ff4d4d;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-quitar:hover {
      background: rgba(255, 77, 77, 0.2);
      transform: scale(1.1);
    }

    .sidebar-pago {
      background: rgba(179, 99, 89, 0.15);
      backdrop-filter: blur(10px);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      height: fit-content;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    }

    h3 {
      margin-top: 0;
      color: white;
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
    }

    .total-seccion {
      display: flex;
      justify-content: space-between;
      font-size: 1.2rem;
      font-weight: bold;
      margin: 1.5rem 0;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }

    .monto {
      color: #00ff88;
    }

    .acciones {
      display: flex;
      gap: 10px;
      margin-bottom: 1.5rem;
    }

    .btn-xml, .btn-vaciar {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .btn-xml {
      background: linear-gradient(135deg, #28a745 0%, #218838 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }

    .btn-xml:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5);
    }

    .btn-vaciar {
      background: rgba(255, 255, 255, 0.1);
      color: #ff4d4d;
      border: 1px solid rgba(255, 77, 77, 0.3);
    }

    .btn-vaciar:hover {
      background: rgba(255, 77, 77, 0.1);
      transform: translateY(-2px);
    }

    .checkout-seccion {
      margin-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .contenido-carrito {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CarritoComponent {
  public servicio = inject(CarritoService);
}