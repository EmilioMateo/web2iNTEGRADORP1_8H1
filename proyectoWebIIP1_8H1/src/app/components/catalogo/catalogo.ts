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
      justify-content: center;
      gap: 20px;
      align-items: center;
      padding: 1rem 2rem;
      font-family: 'Roboto', sans-serif; 
      font-size: 20px;
      color: white;
    }
    .contenedor-grid {
      min-height: 100vh;
      display: grid;
      grid-template-columns: repeat(auto-fit, 250px);
      justify-content: center;
      gap: 20px;
    }
  `]
})
export class Catalogo {
  private servicio = inject(ProductoService);
  productos$ = this.servicio.obtenerTodos();
}