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
    .tarjeta { border: 5px solid #ffffff; border-radius: 12px; overflow: hidden; background: #b3635991; }
    img { width: 100%; height: 200px; object-fit: cover; }
    .contenido { padding: 12px; display: grid; gap: 8px; font-family: 'Roboto', sans-serif;  }
    .cabecera { display: flex; justify-content: space-between; align-items: baseline; color: white;}
    .precio { font-family: 'Roboto', sans-serif; font-weight: bold; color: #ffffff; }
    .meta { color: #ffffff; font-size: 13px; margin: 0; font-family: 'Roboto', sans-serif; }
    .desc { font-size: 14px; font-family: 'Roboto', sans-serif; color: #ffffff; margin: 0; }
    .stock { font-size: 13px; font-weight: 600; color: #01ff4d; margin: 0; font-family: 'Roboto', sans-serif; }
    .agotado { color: #dc2626; }
    button { background: #831111; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; }
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