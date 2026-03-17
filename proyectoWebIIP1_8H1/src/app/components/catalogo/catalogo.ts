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
    <header class="main-header">
      <h1>Catálogo de Productos</h1>
      <app-carrito />
    </header>

    <section class="contenedor-grid">
      @for (prod of (productos$ | async); track prod.id) {
        <app-producto-card [item]="prod" />
      }
    </section>
  `,
  styles: [`
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
    }
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