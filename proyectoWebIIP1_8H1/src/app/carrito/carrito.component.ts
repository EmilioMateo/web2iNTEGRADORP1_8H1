import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common'; 
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  template: `
    <div class="carrito-wrapper">
      <button 
        class="cart-btn" 
        [ngClass]="{'glow-animation': servicio.notificacion()}"
        (click)="toggleCarrito()">
        🛒 <span class="badge">{{ servicio.productos().length }}</span>
      </button>

      @if (mostrarMenu()) {
        <div class="dropdown-menu">
          <h3>Tu Carrito</h3>
          @if (servicio.productos().length === 0) {
            <p>Está vacío. ¡Agrega algo!</p>
          } @else {
            <div class="items-lista">
              @for (p of servicio.productos(); track p.idCarrito) {
                <div class="item">
                  <span>{{ p.nombre }}</span>
                  <span>{{ p.precio | currency:'MXN' }}</span>
                  <button (click)="servicio.quitar(p.idCarrito)">❌</button>
                </div>
              }
            </div>
            <div class="footer">
              <p><strong>Total: {{ servicio.total() | currency:'MXN' }}</strong></p>
              <button (click)="servicio.exportarReciboXML()">XML</button>
              <button class="btn-vaciar" (click)="servicio.vaciar()">Vaciar</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .carrito-wrapper { position: relative; display: inline-block; }
    
    .cart-btn {
      position: relative;
      background: #7c3aed; color: white; border: none; padding: 12px;
      border-radius: 50%; cursor: pointer; font-size: 1.2rem; transition: all 0.3s;
    }

    /* La animación de brillo que te pidió la profe */
    .glow-animation {
      box-shadow: 0 0 15px 5px rgba(124, 58, 237, 0.8);
      transform: scale(1.1);
    }

    .dropdown-menu {
      position: absolute; top: 100%; right: 0; width: 300px;
      background: white; border: 1px solid #7c3aed; border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 100; padding: 15px;
    }

    .item { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .badge { background: #ff4444; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; position: absolute; top: 0; right: 0; }
  `]
})
export class CarritoComponent {
  public servicio = inject(CarritoService);
  mostrarMenu = signal(false);

  toggleCarrito() {
    this.mostrarMenu.update(v => !v);
  }
}