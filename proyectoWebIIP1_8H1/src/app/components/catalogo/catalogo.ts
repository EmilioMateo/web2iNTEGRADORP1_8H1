import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { ProductoCard } from '../producto/producto-card';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [AsyncPipe, ProductoCard],
  template: `
    <header class="main-header">
      <h1>Catálogo de Productos</h1>
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
      grid-template-columns: repeat(auto-fill, 280px);
      justify-content: center;
      align-items: start;
      gap: 30px;
      padding: 2rem;
    }
  `]
})
export class Catalogo {
  private servicio = inject(ProductoService);
  productos$ = this.servicio.obtenerTodos();
}