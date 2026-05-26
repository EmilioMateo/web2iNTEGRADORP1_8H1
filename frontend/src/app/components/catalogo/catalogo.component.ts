import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProductsService } from '../../services/products.service';
import { Producto, ProductoPayload } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [AsyncPipe, CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent {
  private productsService = inject(ProductsService);
  authService = inject(AuthService);

  productos$: Observable<Producto[]> = this.productsService.obtenerTodos();
  showModal = signal(false);
  isSaving = false;

  newProduct: ProductoPayload = this.crearProductoVacio();

  createProduct(event: Event): void {
    event.preventDefault();
    this.isSaving = true;
    this.newProduct.idCarrito = this.newProduct.id;

    this.productsService.crear(this.newProduct).subscribe({
      next: () => {
        alert('Producto creado');
        this.showModal.set(false);
        this.refrescarProductos();
        this.newProduct = this.crearProductoVacio();
      },
      error: () => alert('Error al crear producto'),
      complete: () => (this.isSaving = false)
    });
  }

  refrescarProductos(): void {
    this.productos$ = this.productsService.obtenerTodos();
  }

  private crearProductoVacio(): ProductoPayload {
    return {
      id: '',
      nombre: '',
      precio: 0,
      descripcion: '',
      imagenUrl: '',
      categoria: '',
      enStock: 0,
      idCarrito: ''
    };
  }
}



