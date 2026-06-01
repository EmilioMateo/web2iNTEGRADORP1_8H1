import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { ProductsService } from '../../services/products.service';
import { Producto } from '../../models/product.model';
import { environment } from '../../config/environment';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [NgClass, CurrencyPipe, FormsModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) item!: Producto;
  @Output() productChanged = new EventEmitter<void>();
  @Output() productSelected = new EventEmitter<Producto>();

  private carritoService = inject(CarritoService);
  private productsService = inject(ProductsService);
  private notifications = inject(NotificationService);
  private apiBaseUrl = environment.apiUrl.replace('/api', '');
  authService = inject(AuthService);

  agregado = signal(false);
  newStock = 0;
  isSavingStock = false;
  isDeleting = false;

  ngOnInit(): void {
    this.newStock = this.item.enStock;
  }

  alAgregar(): void {
    if (this.item.enStock <= 0) {
      return;
    }

    this.carritoService.agregar(this.item);
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2000);
  }

  verDetalle(): void {
    this.productSelected.emit(this.item);
  }

  imageSrc(): string {
    if (!this.item.imagenUrl) {
      return '';
    }

    return this.item.imagenUrl.startsWith('/uploads')
      ? `${this.apiBaseUrl}${this.item.imagenUrl}`
      : this.item.imagenUrl;
  }

  updateStock(): void {
    if (!this.item.id) {
      return;
    }

    this.isSavingStock = true;
    this.productsService.actualizarStock(this.item.id, this.newStock).subscribe({
      next: () => {
        this.item.enStock = this.newStock;
        this.notifications.success('Stock actualizado.');
      },
      error: () => this.notifications.error('Error al actualizar stock.'),
      complete: () => (this.isSavingStock = false)
    });
  }

  deleteProduct(): void {
    if (!this.item.id || !confirm('Estas seguro de que quieres eliminar este producto?')) {
      return;
    }

    this.isDeleting = true;
    this.productsService.eliminar(this.item.id).subscribe({
      next: () => {
        this.notifications.success('Producto eliminado.');
        this.productChanged.emit();
      },
      error: () => this.notifications.error('Error al eliminar producto.'),
      complete: () => (this.isDeleting = false)
    });
  }
}



