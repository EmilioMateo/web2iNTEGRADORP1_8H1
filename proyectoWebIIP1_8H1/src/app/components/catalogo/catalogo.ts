import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { ProductoCard } from '../producto/producto-card';
import { CarritoComponent } from '../../carrito/carrito.component'; 

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [AsyncPipe, ProductoCard, CarritoComponent],
  template: `
    <header style="margin-bottom: 20px;">
      <h1>Catálogo de Productos</h1>
    </header>

    <section class="contenedor-grid">
      @for (prod of (productos$ | async); track prod.id) {
        <app-producto-card [item]="prod" />
      } @empty {
        <p>Cargando productos o catálogo vacío...</p>
      }
    </section>

    <app-carrito />
  `,
  styles: [`
    .contenedor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      padding: 10px;
    }
  `]
})
export class Catalogo {
  private servicio = inject(ProductoService);
  productos$ = this.servicio.obtenerTodos();
}