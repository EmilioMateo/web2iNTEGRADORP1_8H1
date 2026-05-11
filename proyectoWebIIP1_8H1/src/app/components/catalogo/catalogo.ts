import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { ProductoCard } from '../producto/producto-card';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [AsyncPipe, CommonModule, FormsModule, ProductoCard],
  template: `
    <header class="main-header">
      <h1>Catálogo de Productos</h1>
      @if (authService.user()?.rol === 'trabajador') {
        <button class="btn-add-product" (click)="showModal.set(true)">+ Añadir Producto</button>
      }
    </header>

    @if (showModal()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>Nuevo Producto</h2>
          <form (submit)="createProduct($event)">
            <input type="text" [(ngModel)]="newProduct.id" name="id" placeholder="ID (ej. prod-6)" required>
            <input type="text" [(ngModel)]="newProduct.nombre" name="nombre" placeholder="Nombre" required>
            <label for="precio">Precio:</label>
            <input type="number" id="precio" [(ngModel)]="newProduct.precio" name="precio" placeholder="Precio" required>
            <textarea [(ngModel)]="newProduct.descripcion" name="descripcion" placeholder="Descripción" required></textarea>
            <input type="text" [(ngModel)]="newProduct.imagenUrl" name="imagenUrl" placeholder="URL Imagen" required>
            <input type="text" [(ngModel)]="newProduct.categoria" name="categoria" placeholder="Categoría" required>
            <label for="enStock">Stock Inicial:</label>
            <input type="number" id="enStock" [(ngModel)]="newProduct.enStock" name="enStock" placeholder="Stock Inicial" required>
            
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="showModal.set(false)">Cancelar</button>
              <button type="submit" class="btn-save" [disabled]="isSaving">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    }

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

    .btn-add-product {
      background: linear-gradient(135deg, #28a745 0%, #218838 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .btn-add-product:hover {
      transform: scale(1.05);
    }

    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .modal-content {
      background: #2a2a2a;
      padding: 2rem;
      border-radius: 12px;
      width: 400px;
      max-width: 90%;
      color: white;
    }
    .modal-content form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 15px;
    }
    .modal-content input, .modal-content textarea {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #444;
      background: #111;
      color: white;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 15px;
    }
    .btn-cancel {
      background: #555;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-save {
      background: #b36359;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class Catalogo {
  private servicio = inject(ProductoService);
  authService = inject(AuthService);
  productos$ = this.servicio.obtenerTodos();
  
  showModal = signal(false);
  isSaving = false;
  
  newProduct = {
    id: '',
    nombre: '',
    precio: 0,
    descripcion: '',
    imagenUrl: '',
    categoria: '',
    enStock: 0,
    idCarrito: ''
  };

  async createProduct(event: Event) {
    event.preventDefault();
    this.isSaving = true;
    this.newProduct.idCarrito = this.newProduct.id; // Usually they match in this dummy setup
    
    try {
      const res = await fetch('http://localhost:3000/api/producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.newProduct)
      });
      
      if (res.ok) {
        alert('Producto creado');
        this.showModal.set(false);
        // Refresh products
        this.productos$ = this.servicio.obtenerTodos();
        this.newProduct = { id: '', nombre: '', precio: 0, descripcion: '', imagenUrl: '', categoria: '', enStock: 0, idCarrito: '' };
      } else {
        alert('Error al crear producto');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      this.isSaving = false;
    }
  }
}