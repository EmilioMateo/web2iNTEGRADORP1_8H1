import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../config/environment';
import { Producto, ProductoPayload } from '../../models/product.model';
import { AccountUser } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';
import { ProductsService } from '../../services/products.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent {
  private productsService = inject(ProductsService);
  private userService = inject(UserService);
  private notifications = inject(NotificationService);
  private apiBaseUrl = environment.apiUrl.replace('/api', '');

  productos = signal<Producto[]>([]);
  accounts = signal<AccountUser[]>([]);
  activeTab = signal<'productos' | 'cuentas'>('productos');
  showModal = signal(false);
  isLoadingProducts = signal(false);
  isLoadingAccounts = signal(false);
  isSaving = false;
  selectedImage: File | null = null;
  imagePreview = '';

  newProduct: ProductoPayload = this.crearProductoVacio();

  categoryOptions = ['Maquinas de fuerza', 'Bancos', 'Racks y jaulas', 'Cardio', 'Pesas libres', 'Accesorios', 'Barras y discos', 'Poleas', 'Multifuncionales'];
  muscleOptions = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Biceps', 'Triceps', 'Abdomen', 'Gluteo', 'Cuerpo completo', 'Equipo para home gym'];
  trainingOptions = ['Fuerza', 'Hipertrofia', 'Cardio', 'Funcional', 'Rehabilitacion', 'Cross training', 'Powerlifting', 'Home gym', 'Uso comercial'];
  sizeOptions = ['Compacto', 'Mediano', 'Grande', 'Requiere espacio amplio', 'Plegable', 'Ahorro de espacio'];
  weightOptions = ['Hasta 100 kg', '100 - 200 kg', '200 - 300 kg', 'Mas de 300 kg'];

  constructor() {
    this.loadProducts();
    this.loadAccounts();
  }

  loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.productsService.obtenerTodos().subscribe({
      next: productos => {
        setTimeout(() => {
          this.productos.set(productos);
          this.isLoadingProducts.set(false);
        }, 2000);
      },
      error: () => {
        setTimeout(() => {
          this.isLoadingProducts.set(false);
          this.notifications.error('No se pudo cargar el inventario. Intenta de nuevo.');
        }, 2000);
      }
    });
  }

  loadAccounts(): void {
    this.isLoadingAccounts.set(true);
    this.userService.getAccounts().subscribe({
      next: accounts => {
        setTimeout(() => {
          this.accounts.set(accounts);
          this.isLoadingAccounts.set(false);
        }, 2000);
      },
      error: () => {
        setTimeout(() => {
          this.isLoadingAccounts.set(false);
          this.notifications.error('No se pudo cargar la lista de cuentas.');
        }, 2000);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (!file) {
      this.selectedImage = null;
      this.imagePreview = '';
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      input.value = '';
      this.selectedImage = null;
      this.imagePreview = '';
      this.notifications.error('La imagen debe ser JPG o PNG.');
      return;
    }

    this.selectedImage = file;
    this.imagePreview = URL.createObjectURL(file);
    this.notifications.info('Imagen seleccionada correctamente.');
  }

  createProduct(event: Event): void {
    event.preventDefault();

    const validationError = this.validateProduct();
    if (validationError) {
      this.notifications.error(validationError);
      return;
    }

    const formData = new FormData();
    Object.entries(this.newProduct).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });
    formData.append('imagen', this.selectedImage as File);

    this.isSaving = true;
    this.productsService.crear(formData).subscribe({
      next: () => {
        this.notifications.success('Producto creado correctamente.');
        this.closeCreateModal();
        this.loadProducts();
      },
      error: error => this.notifications.error(error.error?.error || 'No se pudo crear el producto. Revisa los campos.'),
      complete: () => (this.isSaving = false)
    });
  }

  updateStock(producto: Producto, value: string): void {
    const stock = Number(value);

    if (!producto.id) {
      this.notifications.error('No se encontro el id del producto.');
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      this.notifications.error('El stock debe ser un numero mayor o igual a 0.');
      return;
    }

    this.productsService.actualizarStock(producto.id, stock).subscribe({
      next: () => {
        this.productos.update(lista => lista.map(item => item.id === producto.id ? { ...item, enStock: stock } : item));
        this.notifications.success(`Stock actualizado para ${producto.nombre}.`);
      },
      error: error => this.notifications.error(error.error?.error || 'No se pudo actualizar el stock.')
    });
  }

  deleteProduct(producto: Producto): void {
    if (!producto.id || !confirm(`Eliminar ${producto.nombre}?`)) {
      return;
    }

    this.productsService.eliminar(producto.id).subscribe({
      next: () => {
        this.productos.update(lista => lista.filter(item => item.id !== producto.id));
        this.notifications.success('Producto eliminado correctamente.');
      },
      error: error => this.notifications.error(error.error?.error || 'No se pudo eliminar el producto.')
    });
  }

  deleteAccount(account: AccountUser): void {
    if (!confirm(`Eliminar la cuenta ${account.correo}?`)) {
      return;
    }

    this.userService.deleteAccount(account.id).subscribe({
      next: response => {
        this.accounts.update(accounts => accounts.filter(item => item.id !== response.id));
        this.notifications.success('Cuenta eliminada correctamente.');
      },
      error: error => this.notifications.error(error.error?.error || 'No se pudo eliminar la cuenta.')
    });
  }

  imageSrc(producto: Producto): string {
    if (!producto.imagenUrl) {
      return '';
    }

    return producto.imagenUrl.startsWith('/uploads')
      ? `${this.apiBaseUrl}${producto.imagenUrl}`
      : producto.imagenUrl;
  }

  closeCreateModal(): void {
    this.showModal.set(false);
    this.newProduct = this.crearProductoVacio();
    this.selectedImage = null;
    this.imagePreview = '';
  }

  private validateProduct(): string {
    if (!this.newProduct.nombre.trim()) return 'Escribe el nombre del producto.';
    if (!this.newProduct.descripcion.trim()) return 'Escribe la descripcion del producto.';
    if (!this.newProduct.categoria) return 'Selecciona una categoria.';
    if (!this.newProduct.precio || Number(this.newProduct.precio) <= 0) return 'El precio debe ser mayor a 0.';
    if (Number(this.newProduct.enStock) < 0) return 'El stock no puede ser negativo.';
    if (!this.selectedImage) return 'Selecciona una imagen JPG o PNG del producto.';
    return '';
  }

  private crearProductoVacio(): ProductoPayload {
    return {
      nombre: '',
      precio: 0,
      descripcion: '',
      imagenUrl: '',
      categoria: '',
      grupoMuscular: '',
      tipoEntrenamiento: '',
      tamano: '',
      pesoMaximoSoportado: '',
      especificaciones: '',
      enStock: 0
    };
  }
}
