import { Component, Input, inject } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  template: `
    <article class="tarjeta">
      <img [src]="item.imagenUrl" [alt]="item.nombre"/>
      <div class="contenido">
        <div class="cabecera">
          <h3>{{item.nombre}}</h3>
          <span class="precio">{{item.precio}}</span>
        </div>
        <p class="meta">{{item.categoria}}</p>
        <p class="desc">{{item.descripcion}}</p>
        <p [class]="item.enStock ? 'stock' : 'stock agotado'">
          {{ item.enStock ? 'En stock' : 'Agotado' }}
        </p>
        <button (click)="alAgregar()" [disabled]="!item.enStock">
          {{ item.enStock ? 'Añadir al carrito' : 'No disponible' }}
        </button>
      </div>
    </article>
  `,
  styles: [`
    .tarjeta { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; }
    img { width: 100%; height: 200px; object-fit: cover; }
    .contenido { padding: 12px; display: grid; gap: 8px; }
    .cabecera { display: flex; justify-content: space-between; align-items: baseline; }
    .precio { font-weight: bold; color: #111827; }
    .meta { color: #6b7280; font-size: 13px; margin: 0; }
    .desc { font-size: 14px; color: #374151; margin: 0; }
    .stock { font-size: 13px; font-weight: 600; color: #059669; margin: 0; }
    .agotado { color: #dc2626; }
    button { background: #7c3aed; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
  `]
})
export class ProductoCard {
  @Input({ required: true }) item!: Producto;
  private carritoService = inject(CarritoService);

  alAgregar() {
    this.carritoService.agregar(this.item);
  }
}