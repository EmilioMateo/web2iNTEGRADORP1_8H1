import { Component, Input } from '@angular/core';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],

  template: `
    <article style="border: 1px solid #ddd; padding: 10px; border-radius: 8px;">
      <img [src]="product.imagenUrl" [alt]="product.nombre" style="width: 100%;">
      <h3>{{product.nombre}}</h3>
      <p>{{product.precio}}</p>
    </article>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Producto;
}