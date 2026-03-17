  import { Component, inject } from '@angular/core';
  import { CurrencyPipe } from '@angular/common';
  import { CarritoService } from '../services/carrito.service';

  @Component({
    selector: 'app-carrito',
    standalone: true,
    imports: [CurrencyPipe],
    template: `
      <div class="carrito-contenedor">
        <h3>🛒 Tu Carrito</h3>
        @if (servicio.productos().length === 0) {
          <p>Está vacío. ¡Agrega algo!</p>
        } @else {
          <ul>
            @for (p of servicio.productos(); track p.id) {
              <li>
                {{ p.nombre }} - {{ p.precio | currency:'MXN' }}
                <button (click)="servicio.quitar(p.idCarrito)">❌</button>
              </li>
            }
          </ul>
          <hr>
          <p><strong>Total: {{ servicio.total() | currency:'MXN' }}</strong></p>
          <button (click)="servicio.exportarReciboXML()">Descargar XML</button>
          <button (click)="servicio.vaciar()" style="background: #ff4444; color: white;">Vaciar</button>
        }
      </div>
    `,
    styles: [`
      .carrito-contenedor { border: 2px solid #7c3aed; padding: 20px; border-radius: 15px; margin-top: 20px; background: #f9f7ff; }
      ul { list-style: none; padding: 0; }
      li { display: flex; justify-content: space-between; margin-bottom: 8px; background: white; padding: 8px; border-radius: 8px; }
      button { cursor: pointer; border-radius: 5px; border: none; padding: 5px 10px; margin-left: 10px; }
    `]
  })
  export class CarritoComponent {
    public servicio = inject(CarritoService);
  }